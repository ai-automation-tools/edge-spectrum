/** What vite.config.ts passes in per build; absent when a script imports the module under tsx. */
interface ImportMetaEnv {
  readonly VITE_SITE_URL?: string;
  readonly VITE_ORG_URL?: string;
}
interface ImportMeta {
  readonly env?: ImportMetaEnv;
}

/** Stylesheets are side-effect imports Vite handles; TypeScript 6+ checks them (noUncheckedSideEffectImports). */
declare module '*.css';
