import Dexie, { type EntityTable } from 'dexie';
import type { Note } from '@/types';

interface NotesDB extends Dexie {
  notes: EntityTable<Note, 'id'>;
}

export const db = new Dexie('NotesDB') as NotesDB;

db.version(1).stores({
  notes: 'id, title, content, created_at, updated_at, synced, user_id',
});

export class NotesService {
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

  static async getNote(id: string): Promise<Note | undefined> {
    return await db.notes.get(id);
  }

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

  static async deleteNote(id: string): Promise<void> {
    await db.notes.delete(id);
  }

  static async deleteNoteFromBackend(id: string): Promise<void> {
    try {
      const response = await fetch(`/api/notes/${id}`, {
        method: 'DELETE',
        credentials: 'same-origin',
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRF-TOKEN': this.getCsrfToken(),
        },
      });

      if (response.ok) {
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

  static async getUnsyncedNotes(): Promise<Note[]> {
    return await db.notes.filter(note => !note.synced).toArray();
  }

  static async markAsSynced(noteIds: string[]): Promise<void> {
    await db.notes.where('id').anyOf(noteIds).modify({ synced: true });
  }

  static async clearNotes(): Promise<void> {
    await db.notes.clear();
  }

  private static getCsrfToken(): string {
    const metaTag = document.querySelector('meta[name="csrf-token"]');
    return metaTag ? metaTag.getAttribute('content') || '' : '';
  }

  static async syncWithBackend(userId: number): Promise<void> {
    try {
      console.log('Starting sync with backend...');
      
      const unsyncedNotes = await this.getUnsyncedNotes();
      console.log('Unsynced notes:', unsyncedNotes.length);
      
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