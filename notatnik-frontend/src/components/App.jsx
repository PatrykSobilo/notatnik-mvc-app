import React from "react";
import useAuth from "../hooks/useAuth";
import useNotes from "../hooks/useNotes";
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";

function App() {
  const {
    isLoggedIn,
    currentUser,
    authLoading,
    handleLogin,
    handleRegister,
    handleLogout
  } = useAuth();

  const {
    notes,
    displayedNotes,
    loading,
    error,
    editingNote,
    isSearching,
    addNote,
    updateNote,
    deleteNote,
    editNote,
    cancelEdit,
    searchNotes,
    clearSearch
  } = useNotes(isLoggedIn);

  if (authLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        fontSize: '18px',
        color: '#666'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>⏳</div>
          <div>Ładowanie aplikacji...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        fontSize: '18px',
        color: '#d32f2f',
        textAlign: 'center'
      }}>
        <div>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>❌</div>
          <div>Wystąpił błąd: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      {!isLoggedIn ? (
        <LoginPage 
          onLogin={handleLogin}
          onRegister={handleRegister}
        />
      ) : (
        <HomePage
          currentUser={currentUser}
          notes={notes}
          displayedNotes={displayedNotes}
          isSearching={isSearching}
          editingNote={editingNote}
          onAddNote={addNote}
          onUpdateNote={updateNote}
          onDeleteNote={deleteNote}
          onEditNote={editNote}
          onCancelEdit={cancelEdit}
          onSearch={searchNotes}
          onClearSearch={clearSearch}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
}

export default App;
