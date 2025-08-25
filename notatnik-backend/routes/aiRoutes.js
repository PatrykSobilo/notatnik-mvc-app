import express from 'express';
import geminiService from '../services/geminiService.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * Test połączenia z Gemini AI
 * GET /api/ai/test
 */
router.get('/test', authenticateToken, async (req, res) => {
  try {
    const testResult = await geminiService.testConnection();
    
    if (testResult.success) {
      res.json({
        success: true,
        message: testResult.message,
        data: {
          response: testResult.response,
          timestamp: new Date().toISOString()
        }
      });
    } else {
      res.status(500).json({
        success: false,
        message: testResult.message
      });
    }
  } catch (error) {
    console.error('Błąd testu Gemini AI:', error);
    res.status(500).json({
      success: false,
      message: 'Wystąpił błąd podczas testowania połączenia z AI'
    });
  }
});

/**
 * Wysłanie wiadomości do AI Coach
 * POST /api/ai/chat
 */
router.post('/chat', authenticateToken, async (req, res) => {
  try {
    const { noteId, noteTitle, noteContent, message, conversationHistory } = req.body;

    // Walidacja danych
    if (!noteTitle || !noteContent || !message) {
      return res.status(400).json({
        success: false,
        message: 'Brak wymaganych danych: noteTitle, noteContent, message'
      });
    }

    if (!geminiService.isAvailable()) {
      return res.status(503).json({
        success: false,
        message: 'Usługa AI jest obecnie niedostępna. Sprawdź konfigurację.'
      });
    }

    // Wysłanie wiadomości do AI
    const aiResponse = await geminiService.getChatResponse(
      noteTitle,
      noteContent,
      message,
      conversationHistory || []
    );

    res.json({
      success: true,
      data: {
        response: aiResponse,
        timestamp: new Date().toISOString(),
        noteId: noteId
      }
    });

  } catch (error) {
    console.error('Błąd czatu z AI:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Wystąpił błąd podczas komunikacji z AI'
    });
  }
});

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

export default router;
