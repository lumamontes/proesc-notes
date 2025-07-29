import { Appearance, useAppearance } from '@/hooks/use-appearance';
import { cn } from '@/lib/utils';
import { LucideIcon, Monitor, Moon, Sun } from 'lucide-react';
import { HTMLAttributes } from 'react';

export default function AppearanceToggleTab({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
    const { appearance, updateAppearance } = useAppearance();

    const tabs: { value: Appearance; icon: LucideIcon; label: string }[] = [
        { value: 'light', icon: Sun, label: 'Light' },
        { value: 'dark', icon: Moon, label: 'Dark' },
    ];

    return (
        <div 
            className={cn(
                'flex w-full gap-0.5 rounded-lg bg-neutral-100 p-1 dark:bg-neutral-800',
                // Mobile: full width with minimal spacing
                'sm:inline-flex sm:gap-1 sm:w-auto',
                className
            )} 
            {...props}
        >
            {tabs.map(({ value, icon: Icon, label }) => (
                <button
                    key={value}
                    onClick={() => updateAppearance(value)}
                    className={cn(
                        'flex flex-1 items-center justify-center rounded-md px-2 py-2 transition-colors',
                        'sm:flex-none sm:justify-start sm:px-3.5 sm:py-1.5',
                        appearance === value
                            ? 'bg-white shadow-xs dark:bg-neutral-700 dark:text-neutral-100'
                            : 'text-neutral-500 hover:bg-neutral-200/60 hover:text-black dark:text-neutral-400 dark:hover:bg-neutral-700/60',
                    )}
                >
                    <Icon className={cn(
                        'h-4 w-4',
                        'sm:-ml-1'
                    )} />
                    <span className={cn(
                        'text-sm font-medium',
                        'sr-only sm:not-sr-only sm:ml-1.5',
                    )}>
                        {label}
                    </span>
                </button>
            ))}
        </div>
    );
}