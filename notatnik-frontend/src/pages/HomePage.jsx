import React from 'react';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import CreateArea from '../components/notes/CreateArea';
import EditArea from '../components/notes/EditArea';
import SearchArea from '../components/notes/SearchArea';
import Note from '../components/notes/Note';

function HomePage({
  currentUser,
  notes,
  displayedNotes,
  isSearching,
  editingNote,
  onAddNote,
  onUpdateNote,
  onDeleteNote,
  onEditNote,
  onCancelEdit,
  onSearch,
  onClearSearch,
  onLogout
}) {
  return (
    <div className="home-page">
      <Header
        userName={currentUser?.username}
        onLogout={onLogout}
      />

      <main>
        <CreateArea onAdd={onAddNote} />

        <SearchArea
          onSearch={onSearch}
          onClear={onClearSearch}
        />

        {editingNote && (
          <EditArea
            note={editingNote}
            onUpdate={onUpdateNote}
            onCancel={onCancelEdit}
          />
        )}

        <div className="notes-container">
          {isSearching && (!displayedNotes || displayedNotes.length === 0) ? (
            <div className="no-results">
              <p style={{ textAlign: 'center', color: '#666', marginTop: '50px' }}>
                🔍 Nie znaleziono notatek pasujących do wyszukiwanego terminu
              </p>
            </div>
          ) : (!displayedNotes || displayedNotes.length === 0) ? (
            <div className="no-notes">
              <p style={{ textAlign: 'center', color: '#666', marginTop: '50px' }}>
                📝 Nie masz jeszcze żadnych notatek. Dodaj pierwszą!
              </p>
            </div>
          ) : (
            (displayedNotes || []).map((noteItem) => (
              <Note
                key={noteItem.id}
                id={noteItem.id}
                title={noteItem.title}
                content={noteItem.content}
                onDelete={onDeleteNote}
                onEdit={onEditNote}
              />
            ))
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default HomePage;
