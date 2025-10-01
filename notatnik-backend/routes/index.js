import express from 'express';
import notesRoutes from './notesRoutes.js';
import authRoutes from './authRoutes.js';
import aiRoutes from './aiRoutes.js';

const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    message: '🗒️ Notatnik API',
    version: '2.0.0',
    endpoints: {
      auth: {
        'POST /api/auth/register': 'Rejestracja nowego użytkownika',
        'POST /api/auth/login': 'Logowanie użytkownika',
        'GET /api/auth/verify': 'Sprawdzenie tokena',
        'POST /api/auth/logout': 'Wylogowanie'
      },
      notes: {
        'GET /api/notes': 'Pobierz wszystkie notatki użytkownika',
        'GET /api/notes/:id': 'Pobierz notatkę po ID',
        'POST /api/notes': 'Utwórz nową notatkę',
        'PUT /api/notes/:id': 'Zaktualizuj notatkę',
        'DELETE /api/notes/:id': 'Usuń notatkę',
        'GET /api/notes/search?q=query': 'Wyszukaj notatki'
      },
      ai: {
        'GET /api/ai/status': 'Sprawdź status AI Coach',
        'GET /api/ai/models': 'Lista dostępnych modeli (diagnostyka)',
        'GET /api/ai/models/raw': 'Surowa lista modeli (REST, bez SDK)',
        'POST /api/ai/models/raw-generate': 'Surowy test generateContent przez REST',
        'GET /api/ai/test': 'Test połączenia z AI',
        'POST /api/ai/chat': 'Wyślij wiadomość do AI Coach (bez historii)',
        'POST /api/ai/chat/persistent': 'Wyślij wiadomość do AI Coach (z historią)',
        'GET /api/ai/sessions': 'Pobierz wszystkie sesje czatów użytkownika',
        'GET /api/ai/sessions/note/:noteId': 'Pobierz sesję czatu dla konkretnej notatki',
        'GET /api/ai/sessions/:sessionId/messages': 'Pobierz wiadomości z sesji',
        'DELETE /api/ai/sessions/:sessionId': 'Usuń sesję czatu'
      }
    },
    timestamp: new Date().toISOString()
  });
});

router.use('/auth', authRoutes);

router.use('/notes', notesRoutes);

router.use('/ai', aiRoutes);

export default router;
