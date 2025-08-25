const API_BASE_URL = 'http://localhost:3000/api';

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
   * Test połączenia z AI
   */
  static async testConnection() {
    try {
      const response = await this.request('/ai/test');
      return response;
    } catch (error) {
      console.error('Błąd testu AI:', error);
      throw new Error('Nie udało się przetestować połączenia z AI');
    }
  }

  /**
   * Wyślij wiadomość do AI Coach
   */
  static async sendMessage(noteTitle, noteContent, message, conversationHistory = []) {
    try {
      const requestData = {
        noteTitle,
        noteContent,
        message,
        conversationHistory
      };

      const response = await this.request('/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      return response.data;
    } catch (error) {
      console.error('Błąd wysyłania wiadomości do AI:', error);
      throw new Error(error.message || 'Nie udało się wysłać wiadomości do AI Coach');
    }
  }
}

export default AIAPI;
