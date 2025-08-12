import NotesModel from '../db/notesModel.js';

class NotesController {
  // GET /api/notes - Pobierz wszystkie notatki użytkownika
  static async getAllNotes(req, res) {
    try {
      const userId = req.user?.userId; // Z middleware auth
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Wymagana autoryzacja'
        });
      }

      const notes = await NotesModel.getNotesByUserId(userId);
      res.json({
        success: true,
        count: notes.length,
        data: notes
      });
    } catch (error) {
      console.error('❌ Błąd pobierania notatek:', error);
      res.status(500).json({
        success: false,
        message: 'Błąd serwera podczas pobierania notatek',
        error: error.message
      });
    }
  }

  // GET /api/notes/:id - Pobierz notatkę po ID (tylko własną)
  static async getNoteById(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Wymagana autoryzacja'
        });
      }

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Nieprawidłowe ID notatki'
        });
      }

      const note = await NotesModel.getNoteByIdAndUserId(id, userId);
      
      if (!note) {
        return res.status(404).json({
          success: false,
          message: 'Notatka nie została znaleziona'
        });
      }

      res.json({
        success: true,
        data: note
      });
    } catch (error) {
      console.error('❌ Błąd pobierania notatki:', error);
      res.status(500).json({
        success: false,
        message: 'Błąd serwera podczas pobierania notatki',
        error: error.message
      });
    }
  }

  // POST /api/notes - Utwórz nową notatkę
  static async createNote(req, res) {
    try {
      const { title, content } = req.body;
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Wymagana autoryzacja'
        });
      }

      // Walidacja danych
      if (!title || !content) {
        return res.status(400).json({
          success: false,
          message: 'Tytuł i treść są wymagane'
        });
      }

      if (title.trim().length === 0 || content.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Tytuł i treść nie mogą być puste'
        });
      }

      const newNote = await NotesModel.createNote(title.trim(), content.trim(), userId);
      
      res.status(201).json({
        success: true,
        message: 'Notatka została utworzona pomyślnie',
        data: newNote
      });
    } catch (error) {
      console.error('❌ Błąd tworzenia notatki:', error);
      res.status(500).json({
        success: false,
        message: 'Błąd serwera podczas tworzenia notatki',
        error: error.message
      });
    }
  }

  // PUT /api/notes/:id - Zaktualizuj notatkę (tylko własną)
  static async updateNote(req, res) {
    try {
      const { id } = req.params;
      const { title, content } = req.body;
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Wymagana autoryzacja'
        });
      }

      // Walidacja ID
      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Nieprawidłowe ID notatki'
        });
      }

      // Walidacja danych
      if (!title || !content) {
        return res.status(400).json({
          success: false,
          message: 'Tytuł i treść są wymagane'
        });
      }

      if (title.trim().length === 0 || content.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Tytuł i treść nie mogą być puste'
        });
      }

      const updatedNote = await NotesModel.updateNoteByIdAndUserId(id, title.trim(), content.trim(), userId);
      
      if (!updatedNote) {
        return res.status(404).json({
          success: false,
          message: 'Notatka nie została znaleziona'
        });
      }

      res.json({
        success: true,
        message: 'Notatka została zaktualizowana pomyślnie',
        data: updatedNote
      });
    } catch (error) {
      console.error('❌ Błąd aktualizacji notatki:', error);
      res.status(500).json({
        success: false,
        message: 'Błąd serwera podczas aktualizacji notatki',
        error: error.message
      });
    }
  }

  // DELETE /api/notes/:id - Usuń notatkę (tylko własną)
  static async deleteNote(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Wymagana autoryzacja'
        });
      }

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Nieprawidłowe ID notatki'
        });
      }

      const deletedNote = await NotesModel.deleteNoteByIdAndUserId(id, userId);
      
      if (!deletedNote) {
        return res.status(404).json({
          success: false,
          message: 'Notatka nie została znaleziona'
        });
      }

      res.json({
        success: true,
        message: 'Notatka została usunięta pomyślnie',
        data: deletedNote
      });
    } catch (error) {
      console.error('❌ Błąd usuwania notatki:', error);
      res.status(500).json({
        success: false,
        message: 'Błąd serwera podczas usuwania notatki',
        error: error.message
      });
    }
  }

  // GET /api/notes/search?q=query - Wyszukaj notatki (tylko własne)
  static async searchNotes(req, res) {
    try {
      const { q } = req.query;
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Wymagana autoryzacja'
        });
      }

      if (!q || q.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Zapytanie wyszukiwania jest wymagane'
        });
      }

      const notes = await NotesModel.searchNotesByUserId(q.trim(), userId);
      
      res.json({
        success: true,
        count: notes.length,
        query: q.trim(),
        data: notes
      });
    } catch (error) {
      console.error('❌ Błąd wyszukiwania notatek:', error);
      res.status(500).json({
        success: false,
        message: 'Błąd serwera podczas wyszukiwania notatek',
        error: error.message
      });
    }
  }
}

export default NotesController;
