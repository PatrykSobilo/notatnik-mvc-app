import React, { useState } from "react";

function EditArea({ note, onUpdate, onCancel }) {
  const [editedNote, setEditedNote] = useState({
    title: note.title,
    content: note.content
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setEditedNote(prevNote => ({
      ...prevNote,
      [name]: value
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    
    // Walidacja
    if (!editedNote.title.trim() || !editedNote.content.trim()) {
      alert('Proszę wypełnić zarówno tytuł jak i treść notatki');
      return;
    }

    try {
      setIsSubmitting(true);
      await onUpdate(note.id, {
        title: editedNote.title.trim(),
        content: editedNote.content.trim()
      });
    } catch (error) {
      console.error('Błąd edycji notatki:', error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="edit-area">
      <h3 style={{ margin: '0 0 15px 0', color: '#f5ba13' }}>
        ✏️ Edytuj notatkę
      </h3>
      <form onSubmit={handleSubmit}>
        <input
          name="title"
          value={editedNote.title}
          onChange={handleChange}
          placeholder="Tytuł"
          disabled={isSubmitting}
          autoFocus
        />
        <textarea
          name="content"
          value={editedNote.content}
          onChange={handleChange}
          placeholder="Treść notatki..."
          rows="4"
          disabled={isSubmitting}
        />
        
        <div className="edit-buttons" style={{ 
          display: 'flex', 
          gap: '10px', 
          justifyContent: 'flex-end', 
          marginTop: '15px',
          width: '100%',
          position: 'static !important'
        }}>
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="save-btn"
            style={{
              position: 'static !important',
              right: 'auto !important',
              bottom: 'auto !important',
              background: isSubmitting ? '#6c757d' : '#28a745',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '5px',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              fontSize: '1em',
              fontWeight: 'bold',
              width: 'auto !important',
              height: 'auto !important',
              display: 'inline-block !important'
            }}
          >
            {isSubmitting ? 'Zapisuję...' : '💾 Zapisz'}
          </button>
          <button 
            type="button" 
            onClick={onCancel}
            disabled={isSubmitting}
            className="cancel-btn"
            style={{
              position: 'static !important',
              right: 'auto !important',
              bottom: 'auto !important',
              background: '#6c757d',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '1em',
              width: 'auto !important',
              height: 'auto !important',
              display: 'inline-block !important'
            }}
          >
            ❌ Anuluj
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditArea;
