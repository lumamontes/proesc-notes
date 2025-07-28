import { useState, useEffect, useCallback } from 'react';
import { usePage } from '@inertiajs/react';
import type { Note, PageProps } from '@/types';
import { NotesService } from '@/lib/db';

export function useNotes() {
  const { auth } = usePage<PageProps>().props;
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  // Load notes from IndexedDB
  const loadNotes = useCallback(async () => {
    try {
      setLoading(true);
      const loadedNotes = await NotesService.getAllNotes(auth.user.id);
      setNotes(loadedNotes);
    } catch (error) {
      console.error('Failed to load notes:', error);
    } finally {
      setLoading(false);
    }
  }, [auth.user.id]);

  // Create a new note
  const createNote = useCallback(async (title: string, content: string) => {
    try {
      const newNote = await NotesService.createNote({
        title,
        content,
        user_id: auth.user.id,
      });
      setNotes(prev => [newNote, ...prev]);
      alert('Note created successfully!');
      return newNote;
    } catch (error) {
      alert('Failed to create note. Please try again.');
      console.error('Failed to create note:', error);
      throw error;
    }
  }, [auth.user.id]);

  // Update an existing note
  const updateNote = useCallback(async (id: string, updates: { title?: string; content?: string }) => {
    try {
      const updatedNote = await NotesService.updateNote(id, updates);
      if (updatedNote) {
        setNotes(prev => prev.map(note => note.id === id ? updatedNote : note));
        return updatedNote;
      }
    } catch (error) {
      console.error('Failed to update note:', error);
      throw error;
    }
  }, []);

  // Delete a note
  const deleteNote = useCallback(async (id: string) => {
    try {
      await NotesService.deleteNoteFromBackend(id);
      setNotes(prev => prev.filter(note => note.id !== id));
    } catch (error) {
      console.error('Failed to delete note:', error);
      throw error;
    }
  }, []);

  // Sync with backend
  const syncNotes = useCallback(async () => {
    try {
      setSyncing(true);
      await NotesService.syncWithBackend(auth.user.id);
      await loadNotes(); // Reload notes after sync
    } catch (error) {
      console.error('Failed to sync notes:', error);
    } finally {
      setSyncing(false);
    }
  }, [auth.user.id, loadNotes]);

  // Load notes on mount
  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  // Auto-sync when online
  useEffect(() => {
    const handleOnline = () => {
      if (navigator.onLine) {
        syncNotes();
      }
    };

    window.addEventListener('online', handleOnline);
    
    // Initial sync if online
    if (navigator.onLine) {
      syncNotes();
    }

    return () => window.removeEventListener('online', handleOnline);
  }, [syncNotes]);

  return {
    notes,
    loading,
    syncing,
    createNote,
    updateNote,
    deleteNote,
    syncNotes,
    refreshNotes: loadNotes,
  };
} 