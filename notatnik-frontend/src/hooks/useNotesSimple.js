import { useState } from 'react';
import NotesAPI from '../services/notesAPI';

function useNotesSimple() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadNotes = async () => {
    setLoading(true);
    setError(null);
    try {
      const notesData = await NotesAPI.getAllNotes();
      setNotes(notesData || []);
    } catch (err) {
      setError('Błąd podczas ładowania notatek');
      console.error('Błąd ładowania notatek:', err);
    } finally {
      setLoading(false);
    }
  };

  const addNote = async (newNote) => {
    try {
      setLoading(true);
      await NotesAPI.createNote(newNote);
      await loadNotes();
    } catch (error) {
      setError('Nie udało się dodać notatki');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateNote = async (id, updatedNote) => {
    try {
      setLoading(true);
      await NotesAPI.updateNote(id, updatedNote);
      await loadNotes();
    } catch (error) {
      setError('Nie udało się zaktualizować notatki');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteNote = async (id) => {
    try {
      setLoading(true);
      await NotesAPI.deleteNote(id);
      await loadNotes();
    } catch (error) {
      setError('Nie udało się usunąć notatki');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const searchNotes = (searchTerm) => {
    if (!searchTerm.trim()) {
      return notes;
    }
    return notes.filter(note => 
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  return {
    notes,
    loading,
    error,
    loadNotes,
    addNote,
    updateNote,
    deleteNote,
    searchNotes
  };
}

export default useNotesSimple;
