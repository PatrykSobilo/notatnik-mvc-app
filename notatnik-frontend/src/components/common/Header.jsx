import React from "react";

function Header({ userName, onLogout }) {
  return (
    <header>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        width: '100%'
      }}>
        <h1>Keeper</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {userName && (
            <span style={{ color: '#fff', fontSize: '14px' }}>
              Witaj, {userName}!
            </span>
          )}
          <button 
            onClick={onLogout}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#fff',
              color: '#f5ba13',
              border: '2px solid #fff',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '14px'
            }}
          >
            Wyloguj
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
