import { format, isToday, isYesterday, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { FileText, Clock, Trash2 } from 'lucide-react';
import { router } from '@inertiajs/react';
import type { Note } from '@/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface NotesListProps {
  notes: Note[];
  currentNoteId?: string;
  onNoteSelect?: (note: Note) => void;
  onDeleteNote?: (noteId: string) => Promise<void>;
  className?: string;
}

function getDateGroup(date: string): string {
  const noteDate = new Date(date);
  
  if (isToday(noteDate)) {
    return 'Hoje';
  }
  
  if (isYesterday(noteDate)) {
    return 'Ontem';
  }
  
  return format(noteDate, 'dd/MM/yyyy', { locale: ptBR });
}

function groupNotesByDate(notes: Note[]) {
  const groups: Record<string, Note[]> = {};
  
  notes.forEach(note => {
    const group = getDateGroup(note.updated_at);
    if (!groups[group]) {
      groups[group] = [];
    }
    groups[group].push(note);
  });
  
  return groups;
}

export default function NotesList({ notes, currentNoteId, onNoteSelect, onDeleteNote, className }: NotesListProps) {
  const groupedNotes = groupNotesByDate(notes);
  
  const handleNoteClick = (note: Note) => {
    if (onNoteSelect) {
      onNoteSelect(note);
    } else {
      router.visit(`/notes/${note.id}`);
    }
  };

  const handleDeleteNote = async (noteId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    
    if (!onDeleteNote) return;
    
    const confirmed = window.confirm('Tem certeza que deseja excluir esta anotação?');
    if (!confirmed) return;

    try {
      await onDeleteNote(noteId);
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  };

  if (notes.length === 0) {
    return (
      <div className={cn("p-4 text-center text-muted-foreground", className)}>
        <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">Nenhuma anotação ainda</p>
        <p className="text-xs mt-1">Comece criando sua primeira nota!</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {Object.entries(groupedNotes).map(([dateGroup, groupNotes]) => (
        <div key={dateGroup}>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-2">
            {dateGroup}
          </h3>
          <div className="space-y-1">
            {groupNotes.map(note => (
              <div
                key={note.id}
                className={cn(
                  "group relative w-full text-left p-3 rounded-lg transition-colors cursor-pointer",
                  "hover:bg-accent hover:text-accent-foreground",
                  "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                  currentNoteId === note.id && "bg-accent text-accent-foreground"
                )}
                onClick={() => handleNoteClick(note)}
              >
                <div className="space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-medium text-sm line-clamp-1 flex-1">
                      {note.title || 'Sem título'}
                    </h4>
                    <div className="flex items-center gap-1">
                      {!note.synced && (
                        <div className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0" />
                      )}
                      {onDeleteNote && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleDeleteNote(note.id, e)}
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {note.content && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {note.content.replace(/<[^>]*>/g, '').substring(0, 100)}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>
                      {formatDistanceToNow(new Date(note.updated_at), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
} 