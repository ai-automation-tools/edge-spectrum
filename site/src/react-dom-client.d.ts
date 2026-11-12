// react-dom ships no types and @types/react-dom is not installed. This declares the one call the app
// makes, so `strict` holds without a new dependency.
// ponytail: hand-written. Install @types/react-dom and delete this file if a second react-dom API is used.
declare module 'react-dom/client' {
  import type { ReactNode } from 'react';
  export function createRoot(container: Element): { render(children: ReactNode): void; unmount(): void };
}
