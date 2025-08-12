import express from 'express';
import notesRoutes from './notesRoutes.js';
import authRoutes from './authRoutes.js';

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
      }
    },
    timestamp: new Date().toISOString()
  });
});

router.use('/auth', authRoutes);

router.use('/notes', notesRoutes);

export default router;
