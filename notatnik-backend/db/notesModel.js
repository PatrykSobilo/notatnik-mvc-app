import pool from '../db/database.js';

class NotesModel {
  static async getNotesByUserId(userId) {
    try {
      const result = await pool.query(
        'SELECT * FROM notes WHERE user_id = $1 ORDER BY created_at DESC',
        [userId]
      );
      return result.rows;
    } catch (error) {
      throw new Error(`Błąd pobierania notatek: ${error.message}`);
    }
  }

  static async getNoteByIdAndUserId(id, userId) {
    try {
      const result = await pool.query(
        'SELECT * FROM notes WHERE id = $1 AND user_id = $2',
        [id, userId]
      );
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Błąd pobierania notatki: ${error.message}`);
    }
  }

  static async createNote(title, content, userId) {
    try {
      const result = await pool.query(
        'INSERT INTO notes (title, content, user_id) VALUES ($1, $2, $3) RETURNING *',
        [title, content, userId]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`Błąd tworzenia notatki: ${error.message}`);
    }
  }

  static async updateNoteByIdAndUserId(id, title, content, userId) {
    try {
      const result = await pool.query(
        'UPDATE notes SET title = $1, content = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 AND user_id = $4 RETURNING *',
        [title, content, id, userId]
      );
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Błąd aktualizacji notatki: ${error.message}`);
    }
  }

  static async deleteNoteByIdAndUserId(id, userId) {
    try {
      const result = await pool.query(
        'DELETE FROM notes WHERE id = $1 AND user_id = $2 RETURNING *',
        [id, userId]
      );
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Błąd usuwania notatki: ${error.message}`);
    }
  }

  static async searchNotesByUserId(query, userId) {
    try {
      const result = await pool.query(
        'SELECT * FROM notes WHERE (title ILIKE $1 OR content ILIKE $1) AND user_id = $2 ORDER BY created_at DESC',
        [`%${query}%`, userId]
      );
      return result.rows;
    } catch (error) {
      throw new Error(`Błąd wyszukiwania notatek: ${error.message}`);
    }
  }
}

export default NotesModel;
