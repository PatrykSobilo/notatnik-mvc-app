import React, { useState } from 'react';
import AuthAPI from '../services/authAPI';

function RegisterForm({ onRegister, onSwitchToLogin, hideToggle = false }) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
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

    // Walidacja hasła
    if (formData.password !== formData.confirmPassword) {
      setError('Hasła nie są identyczne');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Hasło musi mieć co najmniej 6 znaków');
      setLoading(false);
      return;
    }

    try {
      const { confirmPassword, ...registerData } = formData;
      const result = await AuthAPI.register(registerData);
      console.log('Rejestracja pomyślna:', result);
      onRegister(result.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      padding: '15px', // Zmniejszony padding
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between' // Rozłożenie elementów
    }}>
      <div>
        <h2 style={{ textAlign: 'center', marginBottom: '25px', margin: '0 0 25px 0' }}>
          📝 Rejestracja
        </h2>

      {error && (
        <div style={{
          backgroundColor: '#ffebee',
          color: '#c62828',
          padding: '10px',
          borderRadius: '5px',
          marginBottom: '15px',
          textAlign: 'center'
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
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
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '5px',
              fontSize: '16px',
              boxSizing: 'border-box'
            }}
            placeholder="Wybierz nazwę użytkownika"
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Email:
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '5px',
              fontSize: '16px',
              boxSizing: 'border-box'
            }}
            placeholder="Wpisz adres email"
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
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
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '5px',
              fontSize: '16px',
              boxSizing: 'border-box'
            }}
            placeholder="Minimum 6 znaków"
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Potwierdź hasło:
          </label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '5px',
              fontSize: '16px',
              boxSizing: 'border-box'
            }}
            placeholder="Powtórz hasło"
          />
        </div>

        <div style={{
          marginTop: '20px',
          marginBottom: '30px', // Większy odstęp od dolnych elementów
          textAlign: 'center' // Centrowanie przez text-align
        }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '250px', // Zmieniona szerokość
              padding: '12px 20px',
              backgroundColor: loading ? '#ccc' : '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxSizing: 'border-box',
              display: 'inline-block' // Żeby text-align działało
            }}
          >
            {loading ? 'Rejestracja...' : 'Zarejestruj się'}
          </button>
        </div>
      </form>
      </div>

      {/* Dolna część - przełączniki */}
      <div>
        {!hideToggle && (
          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: '0', color: '#666' }}>
              Masz już konto?{' '}
              <button
                onClick={onSwitchToLogin}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#f5ba13',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Zaloguj się
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default RegisterForm;
