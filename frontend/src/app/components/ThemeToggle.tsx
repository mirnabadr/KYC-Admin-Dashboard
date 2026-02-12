import { useState, useRef, useEffect } from 'react';
import { Sun, Moon, SunMoon, Check } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

type ThemeOption = 'system' | 'light' | 'dark';

const themeOptions: { value: ThemeOption; label: string; icon: typeof Sun }[] = [
  { value: 'system', label: 'System', icon: SunMoon },
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
];

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    if (!open) return;

    function handleClickOutside(e: MouseEvent) {
      if (
        menuRef.current && !menuRef.current.contains(e.target as Node) &&
        buttonRef.current && !buttonRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function handleEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [open]);

  const handleSelect = (value: ThemeOption) => {
    setTheme(value);
    setOpen(false);
  };

  return (
    <div className="relative">
      {/* Trigger button */}
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen(!open)}
        className="h-9 w-9 flex items-center justify-center rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        aria-label="Toggle theme"
        aria-haspopup="true"
      >
        {resolvedTheme === 'dark' ? (
          <Moon className="h-4 w-4 text-slate-300" />
        ) : (
          <Sun className="h-4 w-4 text-slate-700" />
        )}
      </button>

      {/* Dropdown menu */}
      {open && (
        <div
          ref={menuRef}
          className="absolute right-0 top-full mt-1 w-44 rounded-md border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 shadow-lg z-[100] py-1"
        >
          <div className="px-3 py-1.5 text-xs text-slate-500 dark:text-slate-400">
            Color Scheme
          </div>
          <div className="h-px bg-slate-200 dark:bg-slate-700 mx-1 my-1" />
          {themeOptions.map((option) => {
            const Icon = option.icon;
            const isActive = theme === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className="w-full flex items-center justify-between px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                  {option.label}
                </span>
                {isActive && <Check className="h-4 w-4 text-slate-900 dark:text-slate-100" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
