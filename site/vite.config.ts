import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      // server.ts runs Vite in middleware mode, which opens the HMR WebSocket on its own
      // port (default 24678). Pin it so this app and my-prompt-library can run side by side.
      hmr: process.env.DISABLE_HMR === 'true' ? false : { port: 24679 },
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      // Vite answers 403 to any Host but localhost, middleware mode included. ALLOWED_HOSTS
      // (site/.env) lets in the names a proxy such as `tailscale serve` forwards unchanged.
      allowedHosts: process.env.ALLOWED_HOSTS?.split(',').map((h) => h.trim()).filter(Boolean),
    },
  };
});
