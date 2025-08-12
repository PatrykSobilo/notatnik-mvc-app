import { useState, useEffect, useRef } from 'react';
import NotesAPI from '../services/notesAPI';

function useNotes(isLoggedIn) {
  const [notes, setNotes] = useState([]);
  const [displayedNotes, setDisplayedNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingNote, setEditingNote] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  
  const abortControllerRef = useRef(null);

  // Załaduj notatki gdy użytkownik się zaloguje
  useEffect(() => {
    if (isLoggedIn && !hasLoadedOnce) {
      reloadNotes();
      setHasLoadedOnce(true);
    }
  }, [isLoggedIn, hasLoadedOnce]);

  // Wyczyść dane gdy użytkownik się wyloguje
  useEffect(() => {
    if (!isLoggedIn) {
      setNotes([]);
      setDisplayedNotes([]);
      setEditingNote(null);
      setIsSearching(false);
      setHasLoadedOnce(false);
      setError(null);
    }
  }, [isLoggedIn]);

  const reloadNotes = async () => {
    if (!isLoggedIn) return;
    
    try {
      setLoading(true);
      setError(null);
      
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      const notesData = await NotesAPI.getAllNotes();
      setNotes(notesData);
      setDisplayedNotes(notesData);
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Błąd ładowania notatek:', error);
        setError('Nie udało się załadować notatek');
      }
    } finally {
      setLoading(false);
    }
  };

  const addNote = async (newNote) => {
    try {
      setLoading(true);
      await NotesAPI.createNote(newNote);
      await reloadNotes();
    } catch (error) {
      console.error('Błąd dodawania notatki:', error);
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
      setEditingNote(null);
      await reloadNotes();
    } catch (error) {
      console.error('Błąd aktualizacji notatki:', error);
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
      await reloadNotes();
    } catch (error) {
      console.error('Błąd usuwania notatki:', error);
      setError('Nie udało się usunąć notatki');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const editNote = (id) => {
    const noteToEdit = notes.find(note => note.id === id);
    if (noteToEdit) {
      setEditingNote(noteToEdit);
    }
  };

  const cancelEdit = () => {
    setEditingNote(null);
  };

  const searchNotes = async (query) => {
    if (!query.trim()) {
      setDisplayedNotes(notes);
      setIsSearching(false);
      return;
    }

    try {
      setLoading(true);
      setIsSearching(true);
      
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();
      
      const searchResults = await NotesAPI.searchNotes(query, { 
        signal: abortControllerRef.current.signal 
      });
      
      setDisplayedNotes(searchResults);
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Błąd wyszukiwania:', error);
        setError('Błąd wyszukiwania notatek');
      }
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setDisplayedNotes(notes);
    setIsSearching(false);
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  return {
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
    clearSearch,
    reloadNotes
  };
}

export default useNotes;
