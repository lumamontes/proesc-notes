import { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import NoteEditor from '@/components/note-editor';
import AppLayout from '@/layouts/app-layout';
import { useNotes } from '@/hooks/use-notes';
import { NotesService } from '@/lib/db';
import { Trash2, ArrowLeft } from 'lucide-react';
import type { Note, BreadcrumbItem } from '@/types';

interface NotePageProps {
    noteId: string;
}

export default function NotePage({ noteId }: NotePageProps) {
    const { updateNote, deleteNote } = useNotes();
    const [note, setNote] = useState<Note | null>(null);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        const loadNote = async () => {
            try {
                const loadedNote = await NotesService.getNote(noteId);
                setNote(loadedNote || null);
            } catch (error) {
                console.error('Failed to load note:', error);
            } finally {
                setLoading(false);
            }
        };

        loadNote();
    }, [noteId]);

    const handleSave = async (data: { title: string; content: string }) => {
        if (!note) return;

        try {
            const updatedNote = await updateNote(note.id, data);
            if (updatedNote) {
                setNote(updatedNote);
            }
        } catch (error) {
            console.error('Failed to update note:', error);
            throw error;
        }
    };

    const handleDelete = async () => {
        if (!note || deleting) return;

        const confirmed = window.confirm('Tem certeza que deseja excluir esta anotação?');
        if (!confirmed) return;

        try {
            setDeleting(true);
            await deleteNote(note.id);
            router.visit('/dashboard');
        } catch (error) {
            console.error('Failed to delete note:', error);
        } finally {
            setDeleting(false);
        }
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { href: '/dashboard', title: 'Dashboard' },
        { title: note?.title || 'Carregando...' },
    ];

    if (loading) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Carregando..." />
                <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                    <div className="flex items-center justify-center h-64">
                        <p className="text-muted-foreground">Carregando anotação...</p>
                    </div>
                </div>
            </AppLayout>
        );
    }

    if (!note) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Anotação não encontrada" />
                <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <p className="text-muted-foreground mb-4">Anotação não encontrada</p>
                            <Button onClick={() => router.visit('/dashboard')}>
                                Voltar ao Dashboard
                            </Button>
                        </div>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={note.title || 'Anotação'} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.visit('/dashboard')}
                        >
                            <ArrowLeft className="h-4 w-4 mr-1" />
                            Voltar
                        </Button>
                    </div>
                    
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleDelete}
                        disabled={deleting}
                    >
                        <Trash2 className="h-4 w-4 mr-1" />
                        {deleting ? 'Excluindo...' : 'Excluir'}
                    </Button>
                </div>

                <NoteEditor
                    note={note}
                    onSave={handleSave}
                    className="flex-1"
                />
            </div>
        </AppLayout>
    );
} 