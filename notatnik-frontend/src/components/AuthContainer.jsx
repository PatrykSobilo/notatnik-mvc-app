import React, { useState } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

function AuthContainer({ onLogin, onRegister }) {
  const [isLoginMode, setIsLoginMode] = useState(true);

  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      backgroundColor: '#f8f9fa'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '450px',
        minHeight: '520px', // Dostosowana wysokość
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Przełącznik trybów */}
        <div style={{
          display: 'flex',
          marginBottom: '20px',
          backgroundColor: '#fff',
          borderRadius: '8px',
          padding: '4px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <button
            onClick={() => setIsLoginMode(true)}
            style={{
              flex: 1,
              padding: '12px',
              border: 'none',
              borderRadius: '6px',
              backgroundColor: isLoginMode ? '#f5ba13' : 'transparent',
              color: isLoginMode ? 'white' : '#666',
              fontWeight: isLoginMode ? 'bold' : 'normal',
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
              padding: '12px',
              border: 'none',
              borderRadius: '6px',
              backgroundColor: !isLoginMode ? '#4CAF50' : 'transparent',
              color: !isLoginMode ? 'white' : '#666',
              fontWeight: !isLoginMode ? 'bold' : 'normal',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            📝 Rejestracja
          </button>
        </div>

        {/* Kontener na formularze */}
        <div style={{
          flex: 1,
          backgroundColor: '#fff',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}>
          {isLoginMode ? (
            <LoginForm
              onLogin={onLogin}
              hideToggle={true} // Ukryj przełącznik w formularzu
            />
          ) : (
            <RegisterForm
              onRegister={onRegister}
              hideToggle={true} // Ukryj przełącznik w formularzu
            />
          )}
        </div>

        {/* Info o danych testowych - tylko dla logowania */}
        {isLoginMode && (
          <div style={{ 
            width: '320px', // Stała szerokość
            margin: '20px auto 0', // Większy odstęp od góry i centrowanie
            padding: '12px', 
            backgroundColor: '#e8f5e8', 
            borderRadius: '8px',
            fontSize: '12px',
            textAlign: 'center',
            lineHeight: '1.4',
            boxSizing: 'border-box'
          }}>
            <div style={{ marginBottom: '8px' }}>
              <strong>💡 Dane testowe:</strong>
            </div>
            <div>
              Username: <code style={{ 
                backgroundColor: '#fff', 
                padding: '2px 6px', 
                borderRadius: '3px',
                fontSize: '11px'
              }}>testuser</code>
            </div>
            <div style={{ marginTop: '4px' }}>
              Password: <code style={{ 
                backgroundColor: '#fff', 
                padding: '2px 6px', 
                borderRadius: '3px',
                fontSize: '11px'
              }}>test123</code>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AuthContainer;
