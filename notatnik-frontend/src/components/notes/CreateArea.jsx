import React, { useState } from "react";

function CreateArea(props) {
  const [note, setNote] = useState({
    title: "",
    content: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setNote(prevNote => {
      return {
        ...prevNote,
        [name]: value
      };
    });
  }

  async function submitNote(event) {
    event.preventDefault();
    
    if (!note.title.trim() || !note.content.trim()) {
      alert('Proszę wypełnić zarówno tytuł jak i treść notatki');
      return;
    }

    try {
      setIsSubmitting(true);
      await props.onAdd({
        title: note.title.trim(),
        content: note.content.trim()
      });
      
      setNote({
        title: "",
        content: ""
      });
    } catch (error) {
      console.error('Błąd dodawania notatki:', error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div>
      <form onSubmit={submitNote}>
        <input
          name="title"
          onChange={handleChange}
          value={note.title}
          placeholder="Tytuł"
          disabled={isSubmitting}
        />
        <textarea
          name="content"
          onChange={handleChange}
          value={note.content}
          placeholder="Napisz notatkę..."
          rows="3"
          disabled={isSubmitting}
        />
        <button 
          type="submit" 
          disabled={isSubmitting}
          style={{
            opacity: isSubmitting ? 0.6 : 1,
            cursor: isSubmitting ? 'not-allowed' : 'pointer'
          }}
        >
          {isSubmitting ? '...' : 'Add'}
        </button>
      </form>
    </div>
  );
}

export default CreateArea;
