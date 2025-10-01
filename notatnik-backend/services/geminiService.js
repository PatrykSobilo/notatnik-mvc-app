import { GoogleGenerativeAI } from '@google/generative-ai';
import https from 'https';

class GeminiService {
  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      console.warn('⚠️ GEMINI_API_KEY nie jest ustawiony w zmiennych środowiskowych');
      this.genAI = null;
      return;
    }

    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // Pozwól ustawiać model zarówno w formie 'models/gemini-2.5-pro' jak i 'gemini-2.5-pro'
    const rawPreferred = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
    this.preferredModel = rawPreferred.replace(/^models\//, '');
    // Lista kandydatów do automatycznego fallbacku podczas runtime (kolejność ma znaczenie)
    const extra = (process.env.GEMINI_MODEL_CANDIDATES || '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
    this.candidateModels = Array.from(new Set([
      this.preferredModel,
      ...extra.map(m => m.replace(/^models\//, '')),
      // Najnowsze serie 2.5 / 2.0 (jeśli dostępne w środowisku konta)
      'gemini-2.5-pro',
      'gemini-2.5-pro-preview',
      'gemini-2.5-flash',
      'gemini-2.5-flash-lite',
      'gemini-2.0-pro-exp',
      'gemini-2.0-flash',
      'gemini-2.0-flash-lite',
      // Stabilne 1.5 / legacy krótkie aliasy
      'gemini-1.5-pro-latest',
      'gemini-1.5-pro',
      'gemini-pro',
      'gemini-1.5-flash',
      'gemini-1.5-flash-001'
    ]));
    this.model = null;
    this.activeModelName = null;
    this._selecting = false; // prosty lock aby uniknąć równoległej selekcji
    this._initModel();
  }

  async _initModel() {
    try {
      // Spróbuj użyć preferowanego modelu
      this.model = this.genAI.getGenerativeModel({ model: this.preferredModel });
      // Prosty test: niektóre SDK nie udostępniają ping - odczekujemy lazy init przy pierwszym wywołaniu
      console.log(`✅ Gemini AI zainicjalizowany. Model: ${this.preferredModel}`);
      this.activeModelName = this.preferredModel;
    } catch (err) {
      console.warn(`⚠️ Nie udało się ustawić modelu '${this.preferredModel}':`, err.message);
      try {
        // Pobierz listę modeli i wybierz pierwszy obsługujący generateContent
        if (this.genAI.listModels) {
          const list = await this.genAI.listModels();
          const first = list?.models?.find(m => (m.supportedMethods || []).includes('generateContent')) || list?.models?.[0];
          if (first?.name) {
            this.model = this.genAI.getGenerativeModel({ model: first.name });
            console.log(`🔁 Fallback do modelu: ${first.name}`);
            this.activeModelName = first.name;
          } else {
            console.error('❌ Brak dostępnych modeli do fallbacku.');
            this.model = null;
          }
        } else {
          console.error('❌ API listModels niedostępne w tej wersji SDK.');
          this.model = null;
        }
      } catch (inner) {
        console.error('❌ Fallback model initialization failed:', inner.message);
        this.model = null;
      }
    }
  }

  async _runtimeSelectWorkingModel() {
    if (this._selecting) {
      // Inny request już próbuje — poczekaj krótko
      for (let i = 0; i < 20 && this._selecting; i++) {
        await new Promise(r => setTimeout(r, 50));
      }
      return this.model ? true : false;
    }
    this._selecting = true;
    try {
      console.warn('🔍 Runtime fallback: próba znalezienia działającego modelu...');
      for (const candidate of this.candidateModels) {
        try {
          const testModel = this.genAI.getGenerativeModel({ model: candidate });
          // Wysyłamy bardzo krótki prompt testowy aby zweryfikować generateContent
          const test = await testModel.generateContent('ping');
          await test.response.text();
          this.model = testModel;
          this.activeModelName = candidate;
          console.log(`✅ Runtime fallback udany. Aktywny model: ${candidate}`);
          return true;
        } catch (err) {
          const msg = err?.message || '';
          if (err?.status === 404 || msg.includes('not found')) {
            console.warn(`⏭️ Model ${candidate} niedostępny (404). Przechodzę dalej...`);
            continue;
          }
          if (msg.includes('QUOTA') || msg.includes('permission')) {
            console.warn(`⏭️ Model ${candidate} odrzucony (quota/permission).`);
            continue;
          }
          // Inny błąd — też próbujemy kolejny, ale logujemy bardziej szczegółowo
          console.warn(`⏭️ Model ${candidate} błąd: ${msg}`);
        }
      }
      console.error('❌ Runtime fallback nie znalazł działającego modelu.');
      return false;
    } finally {
      this._selecting = false;
    }
  }

  /**
   * Sprawdza czy Gemini AI jest dostępny
   */
  isAvailable() {
    return this.genAI !== null;
  }

  /**
   * Surowa lista modeli poprzez REST (pomija SDK) – diagnostyka.
   * Próbuje zarówno ścieżkę v1beta jak i v1. Zwraca scaloną tablicę unikalnych nazw.
   */
  async rawListModels() {
    if (!process.env.GEMINI_API_KEY) throw new Error('Brak GEMINI_API_KEY');
    const key = process.env.GEMINI_API_KEY;
    const endpoints = [
      'https://generativelanguage.googleapis.com/v1beta/models',
      'https://generativelanguage.googleapis.com/v1/models'
    ];
    const all = [];
    for (const url of endpoints) {
      try {
        const data = await this._simpleGetJson(`${url}?key=${key}`);
        if (Array.isArray(data.models)) {
          data.models.forEach(m => {
            if (m?.name && !all.find(x => x.name === m.name)) {
              all.push({ name: m.name, displayName: m.displayName, supportedMethods: m.supportedMethods });
            }
          });
        }
      } catch (e) {
        console.warn(`RAW listModels błąd dla ${url}:`, e.message);
      }
    }
    return all;
  }

  /**
   * Surowy test wygenerowania odpowiedzi dla krótkiego promptu – bez użycia instancji modelu z SDK.
   */
  async rawGenerateTest(modelName, prompt = 'ping') {
    if (!process.env.GEMINI_API_KEY) throw new Error('Brak GEMINI_API_KEY');
    const key = process.env.GEMINI_API_KEY;
    const body = {
      contents: [
        { role: 'user', parts: [{ text: prompt }] }
      ]
    };
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(modelName)}:generateContent?key=${key}`;
    return this._simplePostJson(url, body);
  }

  _simpleGetJson(url) {
    return new Promise((resolve, reject) => {
      https.get(url, res => {
        let raw = '';
        res.on('data', chunk => raw += chunk);
        res.on('end', () => {
          try { resolve(JSON.parse(raw)); } catch (e) { reject(e); }
        });
      }).on('error', reject);
    });
  }

  _simplePostJson(url, payload) {
    return new Promise((resolve, reject) => {
      const u = new URL(url);
      const data = JSON.stringify(payload);
      const req = https.request({
        method: 'POST',
        hostname: u.hostname,
        path: u.pathname + u.search,
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data)
        }
      }, res => {
        let raw = '';
        res.on('data', c => raw += c);
        res.on('end', () => {
          try {
            const parsed = JSON.parse(raw || '{}');
            if (res.statusCode >= 400) {
              const err = new Error(parsed.error?.message || `HTTP ${res.statusCode}`);
              err.status = res.statusCode;
              return reject(err);
            }
            resolve(parsed);
          } catch (e) { reject(e); }
        });
      });
      req.on('error', reject);
      req.write(data);
      req.end();
    });
  }

  /**
   * Generuje prompt dla roli psychologa/coacha
   */
  generateCoachPrompt(noteTitle, noteContent, userMessage) {
    return `Jesteś doświadczonym psychologiem i life coachem. Użytkownik podzielił się z Tobą swoim problemem w notatce:

**Tytuł problemu:** ${noteTitle}
**Opis problemu:** ${noteContent}

**Aktualna wiadomość użytkownika:** ${userMessage}

Jako psycholog i coach:
1. Wykaż empatię i zrozumienie
2. Zadaj pomocne pytania (jeśli to stosowne)
3. Zaproponuj konkretne, wykonalne rozwiązania
4. Zachęć do pozytywnego myślenia
5. Napisz w sposób ciepły i wspierający

Odpowiedz po polsku w maksymalnie 200 słowach.`;
  }

  /**
   * Wysyła wiadomość do Gemini AI i otrzymuje odpowiedź
   */
  async getChatResponse(noteTitle, noteContent, userMessage, conversationHistory = []) {
    if (!this.isAvailable() || !this.model) {
      throw new Error('Gemini AI nie jest dostępny. Sprawdź konfigurację API key.');
    }

    try {
      // Generuj prompt z kontekstem
      const systemPrompt = this.generateCoachPrompt(noteTitle, noteContent, userMessage);
      
      // Przygotuj historię konwersacji
      let fullPrompt = systemPrompt;
      
      if (conversationHistory.length > 0) {
        fullPrompt += "\n\n**Historia rozmowy:**\n";
        conversationHistory.forEach((msg, index) => {
          fullPrompt += `${index % 2 === 0 ? 'Użytkownik' : 'Coach'}: ${msg}\n`;
        });
        fullPrompt += `\nUżytkownik: ${userMessage}`;
      }

    // Wyślij zapytanie do Gemini
    const result = await this.model.generateContent(fullPrompt);
      const response = await result.response;
      const text = response.text();

      console.log('✅ Odpowiedź otrzymana z Gemini AI');
      return text;

    } catch (error) {
      const status = error?.status;
      const msg = error?.message || '';
      console.error('❌ Błąd komunikacji z Gemini AI:', status, msg);

      // Specyficzne komunikaty
      if (msg.includes('API_KEY_INVALID')) {
        throw new Error('Nieprawidłowy klucz API Gemini (API_KEY_INVALID).');
      }
      if (msg.includes('QUOTA') || msg.includes('quota')) {
        throw new Error('Przekroczono limit (quota) Gemini API. Odczekaj lub zmień plan.');
      }

      const notFound = status === 404 || msg.toLowerCase().includes('not found');
      if (notFound) {
        const triedBefore = this._attemptedRuntimeFallback;
        if (!triedBefore) {
          this._attemptedRuntimeFallback = true;
          const ok = await this._runtimeSelectWorkingModel();
          if (ok) {
            try {
              const retry = await this.model.generateContent(this.generateCoachPrompt(noteTitle, noteContent, userMessage));
              const rtext = await retry.response.text();
              console.log('🔁 Udało się po runtime fallback.');
              return rtext;
            } catch (retryErr) {
              console.error('❌ Retry po fallbacku nieudany:', retryErr.message);
            }
          }
        }
        const suggestion = `Nie znaleziono modelu '${this.preferredModel}'. Spróbuj ustawić GEMINI_MODEL=gemini-pro lub GEMINI_MODEL=gemini-1.5-pro.`;
        throw new Error(`Model Gemini niedostępny (404). ${suggestion}`);
      }

      throw new Error(`Wystąpił błąd podczas komunikacji z AI${status ? ` (status ${status})` : ''}. Spróbuj ponownie.`);
    }
  }
}

export default new GeminiService();
