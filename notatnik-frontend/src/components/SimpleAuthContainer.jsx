import React, { useState } from 'react';
import SimpleLoginForm from './SimpleLoginForm';
import SimpleRegisterForm from './SimpleRegisterForm';

function SimpleAuthContainer({ onLogin, onRegister }) {
  const [isLoginMode, setIsLoginMode] = useState(true);

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      padding: '20px 20px 120px', // Dodany większy padding-bottom dla stopki
      display: 'flex',
      alignItems: 'flex-start', // Zmiana z 'center' na 'flex-start'
      justifyContent: 'center',
      paddingTop: '50px' // Mniejszy odstęp od góry (o połowę)
    }}>
      <div style={{
        width: '100%',
        maxWidth: '900px' // Zwiększona szerokość kontenera
      }}>
        {/* Przełącznik trybu */}
        <div style={{
          display: 'flex',
          marginBottom: '30px',
          backgroundColor: '#fff',
          borderRadius: '10px',
          padding: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          border: '1px solid #e0e0e0'
        }}>
          <button
            onClick={() => setIsLoginMode(true)}
            style={{
              flex: 1,
              padding: '15px',
              border: 'none',
              borderRadius: '8px',
              backgroundColor: isLoginMode ? '#f5ba13' : 'transparent',
              color: isLoginMode ? 'white' : '#666',
              fontWeight: isLoginMode ? '600' : 'normal',
              fontSize: '16px',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            🔐 Logowanie
          </button>
          <button
            onClick={() => setIsLoginMode(false)}
            style={{
              flex: 1,
              padding: '15px',
              border: 'none',
              borderRadius: '8px',
              backgroundColor: !isLoginMode ? '#4CAF50' : 'transparent',
              color: !isLoginMode ? 'white' : '#666',
              fontWeight: !isLoginMode ? '600' : 'normal',
              fontSize: '16px',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            📝 Rejestracja
          </button>
        </div>

        {/* Formularz */}
        {isLoginMode ? (
          <SimpleLoginForm onLogin={onLogin} />
        ) : (
          <SimpleRegisterForm onRegister={onRegister} />
        )}
      </div>
    </div>
  );
}

export default SimpleAuthContainer;
