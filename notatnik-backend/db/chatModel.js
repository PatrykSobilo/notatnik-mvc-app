import pool from '../db/database.js';

class ChatModel {
  /**
   * Pobierz sesję czatu dla danej notatki
   */
  static async getSessionByNoteId(noteId, userId) {
    try {
      const result = await pool.query(
        'SELECT * FROM chat_sessions WHERE note_id = $1 AND user_id = $2',
        [noteId, userId]
      );
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Błąd pobierania sesji czatu: ${error.message}`);
    }
  }

  /**
   * Utwórz nową sesję czatu dla notatki
   */
  static async createSession(noteId, userId) {
    try {
      const result = await pool.query(
        'INSERT INTO chat_sessions (note_id, user_id) VALUES ($1, $2) RETURNING *',
        [noteId, userId]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`Błąd tworzenia sesji czatu: ${error.message}`);
    }
  }

  /**
   * Pobierz lub utwórz sesję czatu dla notatki
   */
  static async getOrCreateSession(noteId, userId) {
    try {
      let session = await this.getSessionByNoteId(noteId, userId);
      
      if (!session) {
        session = await this.createSession(noteId, userId);
      } else {
        // Aktualizuj updated_at
        await pool.query(
          'UPDATE chat_sessions SET updated_at = CURRENT_TIMESTAMP WHERE id = $1',
          [session.id]
        );
      }
      
      return session;
    } catch (error) {
      throw new Error(`Błąd pobierania/tworzenia sesji: ${error.message}`);
    }
  }

  /**
   * Pobierz wszystkie wiadomości z sesji czatu
   */
  static async getMessagesBySessionId(sessionId) {
    try {
      const result = await pool.query(
        'SELECT * FROM chat_messages WHERE session_id = $1 ORDER BY created_at ASC',
        [sessionId]
      );
      return result.rows;
    } catch (error) {
      throw new Error(`Błąd pobierania wiadomości: ${error.message}`);
    }
  }

  /**
   * Dodaj nową wiadomość do sesji
   */
  static async addMessage(sessionId, sender, message) {
    try {
      const result = await pool.query(
        'INSERT INTO chat_messages (session_id, sender, message) VALUES ($1, $2, $3) RETURNING *',
        [sessionId, sender, message]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`Błąd dodawania wiadomości: ${error.message}`);
    }
  }

  /**
   * Pobierz sesje czatów użytkownika
   */
  static async getUserSessions(userId) {
    try {
      const result = await pool.query(`
        SELECT 
          cs.*,
          n.title as note_title,
          n.content as note_content,
          (SELECT COUNT(*) FROM chat_messages WHERE session_id = cs.id) as message_count
        FROM chat_sessions cs
        JOIN notes n ON cs.note_id = n.id
        WHERE cs.user_id = $1
        ORDER BY cs.updated_at DESC
      `, [userId]);
      return result.rows;
    } catch (error) {
      throw new Error(`Błąd pobierania sesji użytkownika: ${error.message}`);
    }
  }

  /**
   * Usuń sesję czatu (wraz z wiadomościami - CASCADE)
   */
  static async deleteSession(sessionId, userId) {
    try {
      const result = await pool.query(
        'DELETE FROM chat_sessions WHERE id = $1 AND user_id = $2 RETURNING *',
        [sessionId, userId]
      );
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Błąd usuwania sesji: ${error.message}`);
    }
  }
}

export default ChatModel;
