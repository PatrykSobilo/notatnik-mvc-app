import React, { useEffect, useState } from "react";
import useAuthSimple from "../hooks/useAuthSimple";
import useNotesSimple from "../hooks/useNotesSimple";
import Header from "./common/Header";
import CreateArea from "./notes/CreateArea";
import Note from "./notes/Note";
import EditArea from "./notes/EditArea";
import LoginPage from "../pages/LoginPage";
import ChatModal from "./ChatModal";

function App() {
  const auth = useAuthSimple();
  const notesHook = useNotesSimple();
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [editingNoteId, setEditingNoteId] = useState(null);

  // Rozpoczęcie edycji
  const startEdit = (id) => {
    setEditingNoteId(id);
  };

  // Anulowanie edycji
  const cancelEdit = () => {
    setEditingNoteId(null);
  };

  // Zapis edycji
  const submitEdit = async (id, updated) => {
    await notesHook.updateNote(id, updated);
    setEditingNoteId(null); // wyjście z trybu edycji po sukcesie
  };

  useEffect(() => {
    auth.checkAuth();
  }, []);

  useEffect(() => {
    if (auth.isLoggedIn) {
      notesHook.loadNotes();
    }
  }, [auth.isLoggedIn]);

  const handleCoachChat = (note) => {
    setSelectedNote(note);
    setChatModalOpen(true);
  };

  const closeChatModal = () => {
    setChatModalOpen(false);
    setSelectedNote(null);
  };

  if (!auth.isLoggedIn) {
    // Dodajemy obsługę rejestracji: RegisterForm wcześniej wywoływał onRegister(user)
    // ale App nie przekazywał tej funkcji, co kończyło się błędem "... is not a function" (zminifikowane 'e is not a function')
    const handleRegistered = (user) => {
      // login() oczekuje obiektu zawierającego klucz user
      auth.login({ user });
    };
    return <LoginPage onLogin={auth.login} onRegister={handleRegistered} />;
  }

  return (
    <div>
      <Header 
        userName={auth.currentUser?.name || auth.currentUser?.username} 
        onLogout={auth.logout} 
      />

      <CreateArea onAdd={notesHook.addNote} />
      
      {notesHook.error && (
        <div style={{ 
          color: 'red', 
          textAlign: 'center', 
          margin: '10px',
          padding: '10px',
          backgroundColor: '#ffe6e6',
          border: '1px solid #ffcccc',
          borderRadius: '5px'
        }}>
          {notesHook.error}
          <button 
            onClick={notesHook.loadNotes}
            style={{
              marginLeft: '10px',
              padding: '5px 10px',
              backgroundColor: '#ff4444',
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
      
      <div className="notes-container">
        {notesHook.notes.map((note) => {
          const isEditing = editingNoteId === note.id;
          if (isEditing) {
            return (
              <div key={note.id} className="note editing-note-wrapper">
                <EditArea
                  note={note}
                  onUpdate={submitEdit}
                  onCancel={cancelEdit}
                />
              </div>
            );
          }
          return (
            <Note
              key={note.id}
              id={note.id}
              title={note.title}
              content={note.content}
              onDelete={notesHook.deleteNote}
              onEdit={startEdit}
              onCoachChat={handleCoachChat}
            />
          );
        })}
      </div>

      {/* Chat Modal */}
      <ChatModal
        note={selectedNote}
        isOpen={chatModalOpen}
        onClose={closeChatModal}
      />
    </div>
  );
}

export default App;
