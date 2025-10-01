import express from 'express';
import geminiService from '../services/geminiService.js';
import ChatModel from '../db/chatModel.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * Sprawdzenie statusu AI
 * GET /api/ai/status
 */
router.get('/status', authenticateToken, (req, res) => {
  const isAvailable = geminiService.isAvailable();
  
  res.json({
    success: true,
    data: {
      aiAvailable: isAvailable,
      model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
      status: isAvailable ? 'ready' : 'not_configured'
    }
  });
});

/**
 * Lista modeli - diagnostyka (jeśli SDK wspiera listModels)
 * GET /api/ai/models
 */
router.get('/models', authenticateToken, async (req, res) => {
  try {
    if (!geminiService.isAvailable()) {
      return res.status(503).json({ success: false, message: 'AI niedostępne' });
    }
    const sdk = geminiService.genAI;
    let models = null;
    if (sdk.listModels) {
      try {
        const list = await sdk.listModels();
        models = list?.models?.map(m => ({ name: m.name, methods: m.supportedMethods })) || [];
      } catch (e) {
        console.warn('Nie udało się pobrać listy modeli:', e.message);
      }
    }
    res.json({
      success: true,
      data: {
        activeModel: geminiService.activeModelName,
        candidateModels: geminiService.candidateModels,
        models
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Błąd pobierania modeli', error: err.message });
  }
});

/**
 * Dynamiczna zmiana modelu (diagnostyka / admin)
 * POST /api/ai/model { model }
 */
router.post('/model', authenticateToken, async (req, res) => {
  try {
    const { model } = req.body;
    if (!model) {
      return res.status(400).json({ success: false, message: 'Brak model w body' });
    }
    if (!geminiService.isAvailable()) {
      return res.status(503).json({ success: false, message: 'AI niedostępne (brak GEMINI_API_KEY)' });
    }
    // Nadpisz preferowany model i zainicjuj ponownie
    geminiService.preferredModel = model;
    await geminiService._initModel();
    if (!geminiService.model) {
      return res.status(500).json({ success: false, message: 'Nie udało się zainicjować modelu' });
    }
    res.json({ success: true, message: 'Model przełączony', data: { active: geminiService.activeModelName } });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Błąd przełączania modelu', error: e.message });
  }
});

/**
 * Surowa lista modeli (REST) – omija SDK
 * GET /api/ai/models/raw
 */
router.get('/models/raw', authenticateToken, async (req, res) => {
  try {
    const list = await geminiService.rawListModels();
    res.json({ success: true, data: list });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Błąd raw listModels', error: e.message });
  }
});

/**
 * Surowy test generowania – modelName query lub body
 * POST /api/ai/models/raw-generate { modelName, prompt }
 */
router.post('/models/raw-generate', authenticateToken, async (req, res) => {
  try {
    const modelName = req.body.modelName || req.query.modelName;
    const prompt = req.body.prompt || req.query.prompt || 'ping';
    if (!modelName) return res.status(400).json({ success: false, message: 'Brak modelName' });
    const result = await geminiService.rawGenerateTest(modelName, prompt);
    res.json({ success: true, data: result });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Błąd raw generate', error: e.message, status: e.status });
  }
});

/**
 * Pobierz sesje czatów użytkownika
 * GET /api/ai/sessions
 */
router.get('/sessions', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const sessions = await ChatModel.getUserSessions(userId);
    
    res.json({
      success: true,
      data: sessions
    });
  } catch (error) {
    console.error('Błąd pobierania sesji:', error);
    res.status(500).json({
      success: false,
      message: 'Nie udało się pobrać sesji czatów'
    });
  }
});

/**
 * Pobierz sesję czatu dla konkretnej notatki
 * GET /api/ai/sessions/note/:noteId
 */
router.get('/sessions/note/:noteId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const noteId = parseInt(req.params.noteId);
    
    if (!noteId || isNaN(noteId)) {
      return res.status(400).json({
        success: false,
        message: 'Nieprawidłowe ID notatki'
      });
    }
    
    const session = await ChatModel.getSessionByNoteId(noteId, userId);
    
    res.json({
      success: true,
      data: session
    });
  } catch (error) {
    console.error('Błąd pobierania sesji notatki:', error);
    res.status(500).json({
      success: false,
      message: 'Nie udało się pobrać sesji dla notatki'
    });
  }
});

/**
 * Pobierz wiadomości z sesji czatu
 * GET /api/ai/sessions/:sessionId/messages
 */
router.get('/sessions/:sessionId/messages', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const sessionId = parseInt(req.params.sessionId);
    
    if (!sessionId || isNaN(sessionId)) {
      return res.status(400).json({
        success: false,
        message: 'Nieprawidłowe ID sesji'
      });
    }
    
    // Sprawdź czy sesja należy do użytkownika poprzez pobranie sesji
    const userSessions = await ChatModel.getUserSessions(userId);
    const sessionExists = userSessions.find(s => s.id === sessionId);
    
    if (!sessionExists) {
      return res.status(403).json({
        success: false,
        message: 'Brak dostępu do tej sesji'
      });
    }
    
    // Pobierz wiadomości
    const messages = await ChatModel.getMessagesBySessionId(sessionId);
    
    res.json({
      success: true,
      data: messages
    });
  } catch (error) {
    console.error('Błąd pobierania wiadomości:', error);
    res.status(500).json({
      success: false,
      message: 'Nie udało się pobrać wiadomości'
    });
  }
});

/**
 * Wyślij wiadomość do AI Coach z zapisem w historii
 * POST /api/ai/chat/persistent
 */
router.post('/chat/persistent', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { noteId, noteTitle, noteContent, message } = req.body;

    // Walidacja danych
    if (!noteId || !noteTitle || !noteContent || !message) {
      return res.status(400).json({
        success: false,
        message: 'Brak wymaganych danych: noteId, noteTitle, noteContent, message'
      });
    }

    if (!geminiService.isAvailable()) {
      return res.status(503).json({
        success: false,
        message: 'Usługa AI jest obecnie niedostępna. Sprawdź konfigurację.'
      });
    }

    // Pobierz lub utwórz sesję czatu
    const session = await ChatModel.getOrCreateSession(noteId, userId);
    
    // Pobierz historię rozmowy
    const messages = await ChatModel.getMessagesBySessionId(session.id);
    const conversationHistory = messages.map(msg => msg.message);

    // Zapisz wiadomość użytkownika
    await ChatModel.addMessage(session.id, 'user', message);

    // Wyślij zapytanie do AI
    const aiResponse = await geminiService.getChatResponse(
      noteTitle,
      noteContent,
      message,
      conversationHistory
    );

    // Zapisz odpowiedź AI
    await ChatModel.addMessage(session.id, 'ai', aiResponse);

    res.json({
      success: true,
      data: {
        response: aiResponse,
        sessionId: session.id,
        timestamp: new Date().toISOString(),
        noteId: noteId
      }
    });

  } catch (error) {
    console.error('Błąd czatu z AI (persistent):', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Wystąpił błąd podczas komunikacji z AI'
    });
  }
});

/**
 * Usuń sesję czatu
 * DELETE /api/ai/sessions/:sessionId
 */
router.delete('/sessions/:sessionId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const sessionId = parseInt(req.params.sessionId);
    
    if (!sessionId || isNaN(sessionId)) {
      return res.status(400).json({
        success: false,
        message: 'Nieprawidłowe ID sesji'
      });
    }
    
    const deletedSession = await ChatModel.deleteSession(sessionId, userId);
    
    if (!deletedSession) {
      return res.status(404).json({
        success: false,
        message: 'Sesja nie została znaleziona lub nie należy do użytkownika'
      });
    }
    
    res.json({
      success: true,
      message: 'Sesja została usunięta',
      data: deletedSession
    });
  } catch (error) {
    console.error('Błąd usuwania sesji:', error);
    res.status(500).json({
      success: false,
      message: 'Nie udało się usunąć sesji'
    });
  }
});

export default router;
