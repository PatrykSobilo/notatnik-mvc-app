import { useState } from 'react';
import AuthAPI from '../services/authAPI';

function useAuthSimple() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const checkAuth = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const result = await AuthAPI.verifyToken();
        if (result.valid) {
          setCurrentUser(result.user);
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
          setCurrentUser(null);
        }
      } else {
        setIsLoggedIn(false);
        setCurrentUser(null);
      }
    } catch (error) {
      console.error('Błąd autoryzacji:', error);
      localStorage.removeItem('token');
      setIsLoggedIn(false);
      setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (userData) => {
    setCurrentUser(userData.user);
    setIsLoggedIn(true);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setCurrentUser(null);
  };

  return {
    isLoggedIn,
    currentUser,
    loading,
    checkAuth,
    login,
    logout
  };
}

export default useAuthSimple;
