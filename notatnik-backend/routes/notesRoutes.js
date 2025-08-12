import express from 'express';
import NotesController from '../controllers/notesController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Wszystkie endpointy notatek wymagają autoryzacji
router.use(authenticateToken);

// GET /api/notes/search?q=query - Wyszukaj notatki (musi być przed /:id)
router.get('/search', NotesController.searchNotes);

// GET /api/notes - Pobierz wszystkie notatki użytkownika
router.get('/', NotesController.getAllNotes);

// GET /api/notes/:id - Pobierz notatkę po ID
router.get('/:id', NotesController.getNoteById);

// POST /api/notes - Utwórz nową notatkę
router.post('/', NotesController.createNote);

// PUT /api/notes/:id - Zaktualizuj notatkę
router.put('/:id', NotesController.updateNote);

// DELETE /api/notes/:id - Usuń notatkę
router.delete('/:id', NotesController.deleteNote);

export default router;
