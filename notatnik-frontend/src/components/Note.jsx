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

  return (
    <div className="note">
      <h1>{props.title}</h1>
      <p>{props.content}</p>
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
  );
}

export default Note;
