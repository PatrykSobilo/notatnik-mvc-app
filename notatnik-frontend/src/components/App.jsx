import React, { useState, useEffect, useRef } from "react";
import Header from "./common/Header";
import Footer from "./common/Footer";
import Note from "./notes/Note";
import CreateArea from "./notes/CreateArea";
import EditArea from "./notes/EditArea";
import SearchArea from "./notes/SearchArea";
import AuthContainer from "./auth/AuthContainer";
import NotesAPI from "../services/notesAPI";
import AuthAPI from "../services/authAPI";

function App() {
  const [notes, setNotes] = useState([]);
  const [displayedNotes, setDisplayedNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingNote, setEditingNote] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  
  // Stany autoryzacji
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Sprawdź autoryzację przy starcie aplikacji
  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    setAuthLoading(true);
    try {
      const authResult = await AuthAPI.verifyToken();
      if (authResult.valid) {
        setIsLoggedIn(true);
        setCurrentUser(authResult.user);
        // Automatycznie załaduj notatki po zalogowaniu
        await reloadNotes();
      } else {
        setIsLoggedIn(false);
        setCurrentUser(null);
      }
    } catch (error) {
      console.error('Błąd sprawdzania autoryzacji:', error);
      setIsLoggedIn(false);
      setCurrentUser(null);
    } finally {
      setAuthLoading(false);
    }
  }

  // Funkcja ponownego ładowania (używana też przy starcie)
  async function reloadNotes() {
    if (!isLoggedIn) {
      return;
    }
    
    try {
      setLoading(true);
      const notesData = await NotesAPI.getAllNotes();
      setNotes(notesData);
      setDisplayedNotes(notesData);
      setError(null);
      setIsSearching(false);
      setHasLoadedOnce(true); // Oznaczamy że załadowaliśmy
    } catch (err) {
      setError('Nie udało się załadować notatek');
      console.error('Błąd ładowania notatek:', err);
    } finally {
      setLoading(false);
    }
  }

  // Obsługa logowania
  function handleLogin(user) {
    setIsLoggedIn(true);
    setCurrentUser(user);
    setError(null);
    // Automatycznie załaduj notatki po zalogowaniu
    reloadNotes();
  }

  // Obsługa rejestracji
  function handleRegister(user) {
    setIsLoggedIn(true);
    setCurrentUser(user);
    setError(null);
    // Automatycznie załaduj notatki po rejestracji (będzie pusta lista)
    reloadNotes();
  }

  // Obsługa wylogowania
  async function handleLogout() {
    try {
      await AuthAPI.logout();
      setIsLoggedIn(false);
      setCurrentUser(null);
      setNotes([]);
      setDisplayedNotes([]);
      setHasLoadedOnce(false);
      setError(null);
    } catch (error) {
      console.error('Błąd wylogowania:', error);
    }
  }

  // USUNIĘTY automatyczny useEffect - będzie tylko ręczne ładowanie

  // Funkcja dodawania notatki
  async function addNote(newNote) {
    try {
      const createdNote = await NotesAPI.createNote(newNote);
      const updatedNotes = [...notes, createdNote];
      setNotes(updatedNotes);
      if (!isSearching) {
        setDisplayedNotes(updatedNotes);
      }
      setError(null);
    } catch (err) {
      setError('Nie udało się dodać notatki');
      console.error('Błąd dodawania notatki:', err);
    }
  }

  // Funkcja usuwania notatki
  async function deleteNote(id) {
    try {
      await NotesAPI.deleteNote(id);
      const updatedNotes = notes.filter(note => note.id !== id);
      setNotes(updatedNotes);
      if (!isSearching) {
        setDisplayedNotes(updatedNotes);
      }
      setError(null);
    } catch (err) {
      setError('Nie udało się usunąć notatki');
      console.error('Błąd usuwania notatki:', err);
    }
  }

  // Funkcja rozpoczynania edycji
  function startEditing(id) {
    const noteToEdit = notes.find(note => note.id === id);
    if (noteToEdit) {
      setEditingNote(noteToEdit);
    }
  }

  // Funkcja aktualizacji notatki
  async function updateNote(id, updatedData) {
    try {
      const updatedNote = await NotesAPI.updateNote(id, updatedData);
      const updatedNotes = notes.map(note => 
        note.id === id ? updatedNote : note
      );
      setNotes(updatedNotes);
      if (!isSearching) {
        setDisplayedNotes(updatedNotes);
      }
      setEditingNote(null);
      setError(null);
    } catch (err) {
      setError('Nie udało się zaktualizować notatki');
      console.error('Błąd aktualizacji notatki:', err);
    }
  }

  // Funkcja anulowania edycji
  function cancelEditing() {
    setEditingNote(null);
  }

  // Funkcja wyszukiwania
  async function searchNotes(query) {
    try {
      setIsSearching(true);
      const searchResults = await NotesAPI.searchNotes(query);
      setDisplayedNotes(searchResults);
      setError(null);
    } catch (err) {
      setError('Nie udało się wyszukać notatek');
      console.error('Błąd wyszukiwania:', err);
    }
  }

  // Funkcja czyszczenia wyszukiwania
  function clearSearch() {
    setIsSearching(false);
    setDisplayedNotes(notes);
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Header />
      
      {/* Loading autoryzacji */}
      {authLoading && (
        <div style={{
          textAlign: 'center',
          padding: '40px',
          color: '#666'
        }}>
          <div>🔄 Sprawdzanie autoryzacji...</div>
        </div>
      )}

      {/* Formularz logowania/rejestracji dla niezalogowanych */}
      {!authLoading && !isLoggedIn && (
        <AuthContainer
          onLogin={handleLogin}
          onRegister={handleRegister}
        />
      )}

      {/* Interfejs dla zalogowanych użytkowników */}
      {!authLoading && isLoggedIn && (
        <>
          {/* Panel użytkownika */}
          <div style={{
            padding: '10px 20px',
            backgroundColor: '#f5f5f5',
            borderBottom: '1px solid #ddd',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              👋 Witaj, <strong>{currentUser?.username}</strong>!
            </div>
            <button
              onClick={handleLogout}
              style={{
                padding: '8px 16px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Wyloguj się
            </button>
          </div>

          {/* Obszar tworzenia nowych notatek - ukryj podczas edycji */}
      {!editingNote && <CreateArea onAdd={addNote} />}
      
      {/* Obszar edycji - pokaż tylko podczas edycji */}
      {editingNote && (
        <EditArea 
          note={editingNote}
          onUpdate={updateNote}
          onCancel={cancelEditing}
        />
      )}
      
      {/* Wyszukiwarka - ukryj podczas edycji */}
      {!editingNote && (
        <SearchArea 
          onSearch={searchNotes}
          onClear={clearSearch}
        />
      )}
      
      {/* Wyświetlanie błędów */}
      {error && (
        <div style={{
          backgroundColor: '#ffebee',
          color: '#c62828',
          padding: '10px',
          margin: '10px auto',
          maxWidth: '480px',
          borderRadius: '5px',
          textAlign: 'center'
        }}>
          {error}
          <button 
            onClick={reloadNotes}
            style={{
              marginLeft: '10px',
              padding: '5px 10px',
              backgroundColor: '#c62828',
              color: 'white',
              border: 'none',
              borderRadius: '3px',
              cursor: 'pointer'
            }}
          >
            Spróbuj ponownie
          </button>
        </div>
      )}

      {/* Loading indicator */}
      {loading && (
        <div style={{
          textAlign: 'center',
          padding: '20px',
          color: '#666'
        }}>
          Ładowanie notatek...
        </div>
      )}

      {/* Lista notatek */}
      {!loading && displayedNotes.length > 0 && (
        <div className="notes-container">
          {displayedNotes.map((noteItem) => (
            <Note
              key={noteItem.id}
              id={noteItem.id}
              title={noteItem.title}
              content={noteItem.content}
              onDelete={deleteNote}
              onEdit={startEditing}
            />
          ))}
        </div>
      )}

      {/* Komunikat gdy brak notatek lub pierwsza wizyta */}
      {!loading && displayedNotes.length === 0 && !error && (
        <div style={{
          textAlign: 'center',
          padding: '40px',
          color: '#999'
        }}>
          {hasLoadedOnce ? (
            isSearching ? 'Brak wyników wyszukiwania' : 'Brak notatek. Dodaj pierwszą notatkę!'
          ) : (
            <div>
              <p style={{ marginBottom: '20px' }}>Witaj w aplikacji Notatnik!</p>
              <button 
                onClick={reloadNotes}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#f5ba13',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}
              >
                📝 Załaduj moje notatki
              </button>
            </div>
          )}
        </div>
      )}
        </>
      )}
      
      <Footer />
    </div>
  );
}

export default App;