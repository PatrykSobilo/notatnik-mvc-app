import express from 'express';
import NotesController from '../controllers/notesController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/search', NotesController.searchNotes);

router.get('/', NotesController.getAllNotes);

router.get('/:id', NotesController.getNoteById);

router.post('/', NotesController.createNote);

router.put('/:id', NotesController.updateNote);

router.delete('/:id', NotesController.deleteNote);

export default router;
