import { useState, useEffect } from 'react';
import AuthAPI from '../services/authAPI';

function useAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Sprawdź autoryzację przy starcie
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      setAuthLoading(true);
      const token = localStorage.getItem('token');
      if (token) {
        const userData = await AuthAPI.getCurrentUser();
        setCurrentUser(userData);
        setIsLoggedIn(true);
      }
    } catch (error) {
      console.error('Błąd weryfikacji autoryzacji:', error);
      localStorage.removeItem('token');
      setIsLoggedIn(false);
      setCurrentUser(null);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogin = async (userData) => {
    try {
      setCurrentUser(userData.user);
      setIsLoggedIn(true);
      console.log('Zalogowano pomyślnie:', userData.user);
    } catch (error) {
      console.error('Błąd logowania:', error);
      throw error;
    }
  };

  const handleRegister = async (userData) => {
    try {
      setCurrentUser(userData);
      setIsLoggedIn(true);
      console.log('Zarejestrowano i zalogowano pomyślnie:', userData);
    } catch (error) {
      console.error('Błąd rejestracji:', error);
      throw error;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setCurrentUser(null);
    console.log('Wylogowano pomyślnie');
  };

  return {
    isLoggedIn,
    currentUser,
    authLoading,
    handleLogin,
    handleRegister,
    handleLogout,
    checkAuth
  };
}

export default useAuth;
