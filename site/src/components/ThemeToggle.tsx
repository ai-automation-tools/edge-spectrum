import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { setTheme, useTheme, type Theme } from '../theme';

const OPTIONS: { mode: Theme; label: string; Icon: typeof Sun }[] = [
  { mode: 'light', label: 'Light', Icon: Sun },
  { mode: 'dark', label: 'Dark', Icon: Moon },
];

/** Two-button Light / Dark switch for the top bar (same control as Cronsole's toolbar). */
export default function ThemeToggle() {
  const theme = useTheme();
  return (
    <div role="group" aria-label="Theme" className="flex flex-none items-center gap-0.5 rounded-xl bg-zinc-800/60 p-0.5">
      {OPTIONS.map(({ mode, label, Icon }) => {
        const on = theme === mode;
        return (
          <button
            key={mode}
            type="button"
            onClick={() => setTheme(mode)}
            aria-pressed={on}
            aria-label={`${label} theme`}
            title={`${label} theme`}
            className={`theme-btn flex h-6 w-7 items-center justify-center rounded-[10px] transition-colors duration-150 ${
              on ? 'bg-(--bg) text-zinc-100 shadow-sm' : 'text-zinc-500 hover:text-zinc-100'
            }`}
          >
            <Icon size={13} aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
}
