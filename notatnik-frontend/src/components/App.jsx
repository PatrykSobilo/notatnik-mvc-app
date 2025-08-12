import React, { useEffect } from "react";
import useAuthSimple from "../hooks/useAuthSimple";
import useNotesSimple from "../hooks/useNotesSimple";
import Header from "./common/Header";
import CreateArea from "./notes/CreateArea";
import Note from "./notes/Note";
import LoginPage from "../pages/LoginPage";

function App() {
  const auth = useAuthSimple();
  const notesHook = useNotesSimple();

  useEffect(() => {
    auth.checkAuth();
  }, []);

  if (!auth.isLoggedIn) {
    return <LoginPage onLogin={auth.login} />;
  }

  return (
    <div>
      <Header 
        userName={auth.currentUser?.name || auth.currentUser?.username} 
        onLogout={auth.logout} 
      />
      
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <button 
          onClick={notesHook.loadNotes}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: '#f5ba13',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginBottom: '20px'
          }}
        >
          {notesHook.loading ? 'Ładowanie...' : 'Załaduj notatki'}
        </button>
        
        {notesHook.error && (
          <div style={{ color: 'red', marginBottom: '20px' }}>
            {notesHook.error}
          </div>
        )}
        
        <div>
          <strong>Liczba notatek: {notesHook.notes.length}</strong>
        </div>
      </div>

      <CreateArea onAdd={notesHook.addNote} />
      
      <div className="notes-container">
        {notesHook.notes.map((note) => (
          <Note
            key={note.id}
            id={note.id}
            title={note.title}
            content={note.content}
            onDelete={notesHook.deleteNote}
            onUpdate={notesHook.updateNote}
          />
        ))}
      </div>
    </div>
  );
}

export default App;
