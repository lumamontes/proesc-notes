import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import NotesList from '@/components/notes-list';
import { useNotes } from '@/hooks/use-notes';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarGroup, SidebarGroupLabel, SidebarGroupContent } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { BookOpen, Folder, LayoutGrid, RefreshCw } from 'lucide-react';
import AppLogo from './app-logo';
import { Button } from '@/components/ui/button';

const mainNavItems: NavItem[] = [
    {
        title: 'Minhas anotações',
        href: '/dashboard',
        icon: BookOpen,
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Repositório',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: Folder,
    },
    {
        title: 'Documentação',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    const { notes, loading, syncing, syncNotes, deleteNote } = useNotes();

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
                
                <SidebarGroup>
                    <SidebarGroupLabel className="flex items-center justify-between">
                        <span>Minhas Anotações</span>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={syncNotes}
                            disabled={syncing}
                            className="h-6 w-6 p-0"
                        >
                            <RefreshCw className={`h-3 w-3 ${syncing ? 'animate-spin' : ''}`} />
                        </Button>
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        {loading ? (
                            <div className="p-4 text-sm text-muted-foreground">
                                Carregando anotações...
                            </div>
                        ) : (
                            <NotesList 
                                notes={notes} 
                                onDeleteNote={deleteNote}
                            />
                        )}
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
