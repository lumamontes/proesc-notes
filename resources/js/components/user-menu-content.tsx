import { DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { UserInfo } from '@/components/user-info';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { type User } from '@/types';
import { Link, router } from '@inertiajs/react';
import { LogOut, Settings } from 'lucide-react';
import AppearanceTabs from '@/components/appearance-tabs';

interface UserMenuContentProps {
    user: User;
}

export function UserMenuContent({ user }: UserMenuContentProps) {
    const cleanup = useMobileNavigation();

    const handleLogout = () => {
        cleanup();
        router.flushAll();
    };

    return (
        <>
            <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <UserInfo user={user}  />
                </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
          <DropdownMenuGroup>
                <div className="px-2 py-1.5">
                    <div className="mb-1 text-xs font-medium text-neutral-500 dark:text-neutral-400">
                        Appearance
                    </div>
                    <AppearanceTabs className="w-full" />
                </div>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
                <Link className="block w-full" method="post" href={route('logout')} as="button" onClick={handleLogout}>
                    <LogOut className="mr-2" />
                    Sair
                </Link>
            </DropdownMenuItem> 
        </>
    );
}
