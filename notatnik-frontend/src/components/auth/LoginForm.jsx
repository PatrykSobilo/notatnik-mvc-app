import React, { useState } from 'react';
import AuthAPI from '../../services/authAPI';

function LoginForm({ onLogin }) {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await AuthAPI.login(formData);
      console.log('Logowanie pomyślne:', result);
      onLogin(result.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      maxWidth: '800px',
      margin: '0 auto',
      padding: '20px',
      backgroundColor: '#fff',
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    }}>
      <h2 style={{ 
        textAlign: 'center', 
        marginBottom: '30px',
        color: '#333',
        fontSize: '24px'
      }}>
        🔐 Logowanie
      </h2>

      {error && (
        <div style={{
          backgroundColor: '#ffebee',
          color: '#c62828',
          padding: '12px',
          borderRadius: '6px',
          marginBottom: '20px',
          textAlign: 'center',
          border: '1px solid #ffcdd2'
        }}>
          {error}
        </div>
      )}

      <form id="loginForm" onSubmit={handleSubmit}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontWeight: '600',
            color: '#555',
            fontSize: '14px'
          }}>
            Nazwa użytkownika:
          </label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid #e0e0e0',
              borderRadius: '6px',
              fontSize: '16px',
              boxSizing: 'border-box',
              outline: 'none',
              transition: 'border-color 0.3s'
            }}
            placeholder="Wpisz nazwę użytkownika"
            onFocus={(e) => e.target.style.borderColor = '#f5ba13'}
            onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
          />
        </div>

        <div style={{ marginBottom: '30px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontWeight: '600',
            color: '#555',
            fontSize: '14px'
          }}>
            Hasło:
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid #e0e0e0',
              borderRadius: '6px',
              fontSize: '16px',
              boxSizing: 'border-box',
              outline: 'none',
              transition: 'border-color 0.3s'
            }}
            placeholder="Wpisz hasło"
            onFocus={(e) => e.target.style.borderColor = '#f5ba13'}
            onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
          />
        </div>
      </form>

      <div style={{ 
        textAlign: 'center',
        marginTop: '40px'
      }}>
        <button
          type="submit"
          form="loginForm"
          disabled={loading}
          style={{
            width: '200px',
            padding: '14px',
            backgroundColor: loading ? '#ccc' : '#f5ba13',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.3s',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
          onMouseOver={(e) => {
            if (!loading) e.target.style.backgroundColor = '#e6a711';
          }}
          onMouseOut={(e) => {
            if (!loading) e.target.style.backgroundColor = '#f5ba13';
          }}
        >
          {loading ? 'Logowanie...' : 'Zaloguj się'}
        </button>
      </div>
    </div>
  );
}

export default LoginForm;
