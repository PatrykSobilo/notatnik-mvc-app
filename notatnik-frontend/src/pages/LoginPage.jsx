import React from 'react';
import AuthContainer from '../components/auth/AuthContainer';

function LoginPage({ onLogin, onRegister }) {
  return (
    <div className="login-page">
      <AuthContainer 
        onLogin={onLogin} 
        onRegister={onRegister} 
      />
    </div>
  );
}

export default LoginPage;
