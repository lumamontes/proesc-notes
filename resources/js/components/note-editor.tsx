import { useState, useEffect, useCallback } from 'react'
import { Save, Wifi, WifiOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import TipTap from '@/components/ui/tip-tap'
import type { Note } from '@/types'

interface NoteEditorProps {
  note?: Note;
  onSave: (data: { title: string; content: string }) => Promise<void>;
  onTitleChange?: (title: string) => void;
  onContentChange?: (content: string) => void;
  className?: string;
  disableAutoSave?: boolean;
}

export default function NoteEditor({ note, onSave, onTitleChange, onContentChange, className, disableAutoSave = false }: NoteEditorProps) {
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [saving, setSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setHasUnsavedChanges(false);
    }
  }, [note]);

  const handleTitleChange = useCallback((newTitle: string) => {
    setTitle(newTitle);
    setHasUnsavedChanges(true);
    onTitleChange?.(newTitle);
  }, [onTitleChange]);

  const handleContentChange = useCallback((newContent: string) => {
    setContent(newContent);
    setHasUnsavedChanges(true);
    onContentChange?.(newContent);
  }, [onContentChange]);

  const handleSave = useCallback(async () => {
    if (saving || (!title.trim() && !content.trim())) return;

    try {
      setSaving(true);
      await onSave({ 
        title: title.trim() || 'Sem título', 
        content: content.trim() || '' 
      });
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Failed to save note:', error);
    } finally {
      setSaving(false);
    }
  }, [onSave, title, content, saving]);

  useEffect(() => {
    if (!hasUnsavedChanges || saving || !note || disableAutoSave) return;

    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
    }

    const timeoutId = setTimeout(() => {
      handleSave();
    }, 3000);

    setAutoSaveTimeout(timeoutId);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [hasUnsavedChanges, handleSave, saving, note, disableAutoSave]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleSave]);

  return (
    <div className={className}>
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Input
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Título da anotação"
            className="text-lg font-semibold border-none shadow-none px-0 focus-visible:ring-0"
          />
          <div className="flex items-center gap-2">
            {isOnline ? (
              <Wifi className="h-4 w-4 text-green-500" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-500" />
            )}
            {note && (
              <Button
                onClick={handleSave}
                disabled={saving || !hasUnsavedChanges || (!title.trim() && !content.trim())}
                size="sm"
              >
                <Save className="h-4 w-4 mr-1" />
                {saving ? 'Salvando...' : hasUnsavedChanges ? 'Salvar' : 'Salvo'}
              </Button>
            )}
          </div>
        </div>

        <div className="border border-border rounded-lg overflow-hidden">
          <TipTap 
            initialContent={content}
            onContentChange={handleContentChange}
          />
        </div>
      </div>
    </div>
  );
} 