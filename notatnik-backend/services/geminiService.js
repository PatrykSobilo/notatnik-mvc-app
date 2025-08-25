import { GoogleGenerativeAI } from '@google/generative-ai';

class GeminiService {
  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      console.warn('⚠️ GEMINI_API_KEY nie jest ustawiony w zmiennych środowiskowych');
      this.genAI = null;
      return;
    }

    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ 
      model: process.env.GEMINI_MODEL || 'gemini-1.5-flash' 
    });
    
    console.log('✅ Gemini AI zainicjalizowany pomyślnie');
  }

  /**
   * Sprawdza czy Gemini AI jest dostępny
   */
  isAvailable() {
    return this.genAI !== null;
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
    if (!this.isAvailable()) {
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
      console.error('❌ Błąd komunikacji z Gemini AI:', error);
      
      if (error.message.includes('API_KEY_INVALID')) {
        throw new Error('Nieprawidłowy klucz API Gemini. Sprawdź konfigurację.');
      }
      
      if (error.message.includes('QUOTA_EXCEEDED')) {
        throw new Error('Przekroczono limit zapytań do Gemini API.');
      }
      
      throw new Error('Wystąpił błąd podczas komunikacji z AI. Spróbuj ponownie.');
    }
  }

  /**
   * Test połączenia z Gemini API
   */
  async testConnection() {
    if (!this.isAvailable()) {
      return { success: false, message: 'Gemini AI nie jest skonfigurowany' };
    }

    try {
      const result = await this.model.generateContent('Odpowiedz tylko "Test połączenia udany"');
      const response = await result.response;
      const text = response.text();
      
      return { 
        success: true, 
        message: 'Połączenie z Gemini AI działa prawidłowo',
        response: text 
      };
    } catch (error) {
      return { 
        success: false, 
        message: `Błąd połączenia: ${error.message}` 
      };
    }
  }
}

export default new GeminiService();
