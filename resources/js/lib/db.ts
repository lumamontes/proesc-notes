import Dexie, { type EntityTable } from 'dexie';
import type { Note } from '@/types';

interface NotesDB extends Dexie {
  notes: EntityTable<Note, 'id'>;
}

export const db = new Dexie('NotesDB') as NotesDB;

db.version(1).stores({
  notes: 'id, title, content, created_at, updated_at, synced, user_id',
});

// Notes service for offline operations
export class NotesService {
  // Get all notes for the current user, sorted by updated_at descending
  static async getAllNotes(userId?: number): Promise<Note[]> {
    if (userId) {
      const notes = await db.notes
        .where('user_id')
        .equals(userId)
        .toArray();
      return notes.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
    }
    const notes = await db.notes.toArray();
    return notes.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
  }

  // Get a specific note by ID
  static async getNote(id: string): Promise<Note | undefined> {
    return await db.notes.get(id);
  }

  // Create a new note
  static async createNote(note: Omit<Note, 'id' | 'created_at' | 'updated_at' | 'synced'>): Promise<Note> {
    const now = new Date().toISOString();
    const newNote: Note = {
      id: crypto.randomUUID(),
      ...note,
      created_at: now,
      updated_at: now,
      synced: false,
    };
    
    await db.notes.add(newNote);
    return newNote;
  }

  // Update an existing note
  static async updateNote(id: string, updates: Partial<Omit<Note, 'id' | 'created_at'>>): Promise<Note | undefined> {
    const existingNote = await db.notes.get(id);
    if (!existingNote) return undefined;

    const updatedNote: Note = {
      ...existingNote,
      ...updates,
      updated_at: new Date().toISOString(),
      synced: false,
    };

    await db.notes.update(id, updatedNote);
    return updatedNote;
  }

  // Delete a note
  static async deleteNote(id: string): Promise<void> {
    await db.notes.delete(id);
  }

  // Delete a note from both local and backend
  static async deleteNoteFromBackend(id: string): Promise<void> {
    try {
      // Delete from backend first
      const response = await fetch(`/api/notes/${id}`, {
        method: 'DELETE',
        credentials: 'same-origin',
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRF-TOKEN': this.getCsrfToken(),
        },
      });

      if (response.ok) {
        // Delete from local database
        await this.deleteNote(id);
        console.log('Note deleted from backend and local storage');
      } else {
        const errorText = await response.text();
        console.error('Failed to delete note from backend:', response.status, errorText);
        throw new Error(`Failed to delete note: ${response.status}`);
      }
    } catch (error) {
      console.error('Delete note failed:', error);
      throw error;
    }
  }

  // Get unsynced notes (for sync with backend)
  static async getUnsyncedNotes(): Promise<Note[]> {
    return await db.notes.filter(note => !note.synced).toArray();
  }

  // Mark notes as synced
  static async markAsSynced(noteIds: string[]): Promise<void> {
    await db.notes.where('id').anyOf(noteIds).modify({ synced: true });
  }

  // Clear all notes (useful for logout)
  static async clearNotes(): Promise<void> {
    await db.notes.clear();
  }

  // Get CSRF token from meta tag
  private static getCsrfToken(): string {
    const metaTag = document.querySelector('meta[name="csrf-token"]');
    return metaTag ? metaTag.getAttribute('content') || '' : '';
  }

  // Sync notes with backend
  static async syncWithBackend(userId: number): Promise<void> {
    try {
      console.log('Starting sync with backend...');
      
      // Get unsynced notes
      const unsyncedNotes = await this.getUnsyncedNotes();
      console.log('Unsynced notes:', unsyncedNotes.length);
      
      // Send unsynced notes to backend
      if (unsyncedNotes.length > 0) {
        console.log('Sending unsynced notes to backend...');
        
        const response = await fetch('/api/notes/sync', {
          method: 'POST',
          credentials: 'same-origin',
          headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRF-TOKEN': this.getCsrfToken(),
          },
          body: JSON.stringify({ notes: unsyncedNotes }),
        });

        console.log('Sync response status:', response.status);
        
        if (response.ok) {
          const result = await response.json();
          console.log('Sync result:', result);
          
          // Mark as synced
          await this.markAsSynced(unsyncedNotes.map(note => note.id));
          console.log('Notes marked as synced');
        } else {
          const errorText = await response.text();
          console.error('Sync failed with status:', response.status, errorText);
        }
      }

      // Fetch latest notes from backend
      console.log('Fetching notes from backend...');
      const response = await fetch('/api/notes', {
        credentials: 'same-origin',
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRF-TOKEN': this.getCsrfToken(),
        },
      });
      
      console.log('Fetch response status:', response.status);
      
      if (response.ok) {
        const backendNotes: Note[] = await response.json();
        console.log('Backend notes received:', backendNotes.length);
        
        // Update local database with backend notes
        for (const note of backendNotes) {
          const localNote = await db.notes.get(note.id);
          if (!localNote || new Date(note.updated_at) > new Date(localNote.updated_at)) {
            await db.notes.put({ ...note, synced: true });
            console.log('Updated local note:', note.id);
          }
        }
      } else {
        const errorText = await response.text();
        console.error('Fetch failed with status:', response.status, errorText);
      }
      
      console.log('Sync completed');
    } catch (error) {
      console.error('Sync failed:', error);
    }
  }
} 