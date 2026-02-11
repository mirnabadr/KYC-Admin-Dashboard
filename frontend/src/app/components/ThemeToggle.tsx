import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { Button } from './ui/button';
import { cn } from './ui/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-9 w-9 px-0 relative hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label="Toggle theme"
        >
          <Sun className={`h-4 w-4 transition-all duration-300 text-slate-700 dark:text-slate-300 ${resolvedTheme === 'dark' ? 'rotate-90 scale-0 absolute opacity-0' : 'rotate-0 scale-100 opacity-100'}`} />
          <Moon className={`h-4 w-4 transition-all duration-300 text-slate-700 dark:text-slate-300 ${resolvedTheme === 'dark' ? 'rotate-0 scale-100 opacity-100' : 'rotate-90 scale-0 absolute opacity-0'}`} />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem 
          onClick={() => handleThemeChange('light')}
          className={cn(
            'cursor-pointer',
            theme === 'light' && 'bg-accent font-medium'
          )}
        >
          <Sun className="mr-2 h-4 w-4 text-slate-700 dark:text-slate-300" />
          <span className="text-slate-900 dark:text-slate-100">Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleThemeChange('dark')}
          className={cn(
            'cursor-pointer',
            theme === 'dark' && 'bg-accent font-medium'
          )}
        >
          <Moon className="mr-2 h-4 w-4 text-slate-700 dark:text-slate-300" />
          <span className="text-slate-900 dark:text-slate-100">Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleThemeChange('system')}
          className={cn(
            'cursor-pointer',
            theme === 'system' && 'bg-accent font-medium'
          )}
        >
          <Monitor className="mr-2 h-4 w-4 text-slate-700 dark:text-slate-300" />
          <span className="text-slate-900 dark:text-slate-100">System</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
