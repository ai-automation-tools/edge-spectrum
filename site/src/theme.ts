import { useSyncExternalStore } from 'react';

export type Theme = 'light' | 'dark';

/**
 * Shared with the static visualizer (public/spectrum/index.html), so a choice made on
 * either page carries to the other.
 */
export const THEME_KEY = 'edge-spectrum.theme';

/**
 * The hub shipped dark-only, so dark stays the default for anyone who never clicks the
 * switch; the OS preference is deliberately not followed. The pre-paint scripts in
 * index.html and public/spectrum/index.html hard-code the same fallback — change all
 * three together or the first frame disagrees with the app.
 */
export const DEFAULT_THEME: Theme = 'dark';

/** `<meta name="theme-color">` per theme: the page background of each. */
const THEME_COLOR: Record<Theme, string> = { dark: '#060606', light: '#f6f6f7' };

const listeners = new Set<() => void>();

/** The pre-paint script has already stamped the class, so the DOM is the source of truth. */
function current(): Theme {
  return document.documentElement.classList.contains('light') ? 'light' : DEFAULT_THEME;
}

export function setTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.remove('light', 'dark');
  root.classList.add(theme);
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLOR[theme]);
  try { localStorage.setItem(THEME_KEY, theme); } catch { /* storage blocked: the choice lasts for this page only */ }
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => { listeners.delete(l); };
}

/** The active theme; re-renders when the switch is flipped. */
export function useTheme(): Theme {
  return useSyncExternalStore(subscribe, current, () => DEFAULT_THEME);
}
