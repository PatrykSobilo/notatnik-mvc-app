const API_BASE_URL = 'http://localhost:3000/api';

import AuthAPI from './authAPI.js';

class NotesAPI {
  static async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config = {
      headers: {
        ...AuthAPI.getAuthHeaders(),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          AuthAPI.logout();
          window.location.reload();
        }
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }
      
      return data;
    } catch (error) {
      console.error('❌ API Request Error:', error);
      throw error;
    }
  }

  static async getAllNotes() {
    try {
      const response = await this.request('/notes');
      return response.data || [];
    } catch (error) {
      console.error('Błąd pobierania notatek:', error);
      throw new Error('Nie udało się pobrać notatek');
    }
  }

  static async getNoteById(id) {
    try {
      const response = await this.request(`/notes/${id}`);
      return response.data;
    } catch (error) {
      console.error('Błąd pobierania notatki:', error);
      throw new Error('Nie udało się pobrać notatki');
    }
  }

  static async createNote(noteData) {
    try {
      const response = await this.request('/notes', {
        method: 'POST',
        body: JSON.stringify(noteData),
      });
      return response.data;
    } catch (error) {
      console.error('Błąd tworzenia notatki:', error);
      throw new Error('Nie udało się utworzyć notatki');
    }
  }

  static async updateNote(id, noteData) {
    try {
      const response = await this.request(`/notes/${id}`, {
        method: 'PUT',
        body: JSON.stringify(noteData),
      });
      return response.data;
    } catch (error) {
      console.error('Błąd aktualizacji notatki:', error);
      throw new Error('Nie udało się zaktualizować notatki');
    }
  }

  static async deleteNote(id) {
    try {
      const response = await this.request(`/notes/${id}`, {
        method: 'DELETE',
      });
      return response.data;
    } catch (error) {
      console.error('Błąd usuwania notatki:', error);
      throw new Error('Nie udało się usunąć notatki');
    }
  }

  static async searchNotes(query) {
    try {
      const response = await this.request(`/notes/search?q=${encodeURIComponent(query)}`);
      return response.data || [];
    } catch (error) {
      console.error('Błąd wyszukiwania notatek:', error);
      throw new Error('Nie udało się wyszukać notatek');
    }
  }
}

export default NotesAPI;
