// Dynamiczne wyznaczanie bazowego URL API (spójne z authAPI / notesAPI)
const API_BASE_URL = (
  (typeof import.meta !== 'undefined' && import.meta.env && (import.meta.env.VITE_API_BASE || import.meta.env.VITE_API_BASE_URL)) ||
  (typeof window !== 'undefined' ? '/api' : 'http://localhost:3000/api')
);

import AuthAPI from './authAPI.js';

class AIAPI {
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
      console.error('❌ AI API Request Error:', error);
      throw error;
    }
  }

  /**
   * Sprawdź status AI Coach
   */
  static async getStatus() {
    try {
      const response = await this.request('/ai/status');
      return response.data;
    } catch (error) {
      console.error('Błąd pobierania statusu AI:', error);
      throw new Error('Nie udało się sprawdzić statusu AI');
    }
  }

  /**
   * Wyślij wiadomość do AI Coach z zapisem w historii
   */
  static async sendMessagePersistent(noteId, noteTitle, noteContent, message) {
    try {
      const requestData = {
        noteId,
        noteTitle,
        noteContent,
        message
      };

      const response = await this.request('/ai/chat/persistent', {
        method: 'POST',
        body: JSON.stringify(requestData),
      });

      return response.data;
    } catch (error) {
      console.error('Błąd wysyłania wiadomości do AI (persistent):', error);
      throw new Error(error.message || 'Nie udało się wysłać wiadomości do AI Coach');
    }
  }
}

export default AIAPI;
