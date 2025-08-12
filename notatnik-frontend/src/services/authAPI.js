const API_BASE_URL = 'http://localhost:3000/api';

class AuthAPI {
  
  static async register(userData) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Błąd rejestracji');
      }

      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      return data;
    } catch (error) {
      console.error('Błąd rejestracji:', error);
      throw error;
    }
  }

  static async login(credentials) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Błąd logowania');
      }

      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      return data;
    } catch (error) {
      console.error('Błąd logowania:', error);
      throw error;
    }
  }

  static async logout() {
    try {
      const token = this.getToken();
      
      if (token) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        });
      }

      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
    } catch (error) {
      console.error('Błąd wylogowania:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }

  static async verifyToken() {
    try {
      const token = this.getToken();
      
      if (!token) {
        return { valid: false };
      }

      const response = await fetch(`${API_BASE_URL}/auth/verify`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();

      if (!response.ok) {
        this.logout();
        return { valid: false };
      }

      return { valid: true, user: data.user };
    } catch (error) {
      console.error('Błąd weryfikacji tokenu:', error);
      this.logout();
      return { valid: false };
    }
  }

  static getToken() {
    return localStorage.getItem('token');
  }

  static getUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  static isLoggedIn() {
    return !!this.getToken();
  }

  static getAuthHeaders() {
    const token = this.getToken();
    return token ? {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    } : {
      'Content-Type': 'application/json'
    };
  }
}

export default AuthAPI;
