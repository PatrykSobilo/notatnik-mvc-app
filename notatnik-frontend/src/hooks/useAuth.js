import { useState, useEffect } from 'react';
import AuthAPI from '../services/authAPI';

function useAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

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
    } catch (error) {
      throw error;
    }
  };

  const handleRegister = async (userData) => {
    try {
      setCurrentUser(userData);
      setIsLoggedIn(true);
    } catch (error) {
      throw error;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setCurrentUser(null);
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
