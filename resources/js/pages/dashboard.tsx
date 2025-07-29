import { Button } from '@/components/ui/button';
import NoteEditor from '@/components/note-editor';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { useNotes } from '@/hooks/use-notes';
import { useState } from 'react';
import type { Note } from '@/types';
import PWAInstallPrompt from '@/components/pwa-install-prompt';

const breadcrumbs: BreadcrumbItem[] = [
    {
        href: '/dashboard',
        title: '',
    },
];

interface DashboardProps {
    user: {
        id: number;
        name: string;
        email: string;
    };
}

export default function Dashboard({ user }: DashboardProps) {
    const { createNote } = useNotes();
    const [currentNote, setCurrentNote] = useState<Note | undefined>();
    const [isCreatingNote, setIsCreatingNote] = useState(false);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    const handleCreateNote = async (data: { title: string; content: string }) => {
        if (!data.title.trim() && !data.content.trim()) {
            return;
        }

        try {
            setIsCreatingNote(true);
            const newNote = await createNote(data.title, data.content);
            
            // Navigate to the new note
            router.visit(`/notes/${newNote.id}`);
        } catch (error) {
            console.error('Failed to create note:', error);
        } finally {
            setIsCreatingNote(false);
        }
    };

    const handleTitleChange = (newTitle: string) => {
        setTitle(newTitle);
    };

    const handleContentChange = (newContent: string) => {
        setContent(newContent);
    };

    const handleSave = () => {
        handleCreateNote({ title, content });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Minhas anotações" />
            <PWAInstallPrompt />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
                <div className="flex items-center justify-end">
                    <Button
                        onClick={handleSave}
                        disabled={isCreatingNote || (!title.trim() && !content.trim())}
                    >
                        {isCreatingNote ? 'Criando...' : 'Salvar'}
                    </Button>
                </div>

                <NoteEditor
                    note={currentNote}
                    onSave={handleCreateNote}
                    onTitleChange={handleTitleChange}
                    onContentChange={handleContentChange}
                    className="flex-1"
                    disableAutoSave={true}
                />
            </div>
        </AppLayout>
    );
}
