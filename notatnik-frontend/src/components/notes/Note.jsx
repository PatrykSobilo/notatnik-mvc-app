import React from "react";

function Note(props) {
  function handleDelete() {
    if (window.confirm('Czy na pewno chcesz usunąć tę notatkę?')) {
      props.onDelete(props.id);
    }
  }

  function handleEdit() {
    props.onEdit(props.id);
  }

  function handleCoachChat() {
    if (props.onCoachChat) {
      props.onCoachChat({
        id: props.id,
        title: props.title,
        content: props.content
      });
    }
  }

  return (
    <div className="note">
      <div className="note-content">
        <h1>{props.title}</h1>
        <p>{props.content}</p>
      </div>
      
      <div className="note-actions">
        {/* Coach AI Button */}
        <button 
          onClick={handleCoachChat}
          className="coach-ai-btn"
          title="Porozmawiaj z AI Coach o tej notatce"
        >
          Coach AI
        </button>
        
        <div className="note-buttons">
          <button 
            onClick={handleEdit}
            className="edit-btn"
            title="Edytuj notatkę"
          >
            ✏️
          </button>
          <button 
            onClick={handleDelete}
            className="delete-btn"
            title="Usuń notatkę"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
}

export default Note;
