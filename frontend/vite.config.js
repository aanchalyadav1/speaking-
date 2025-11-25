import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist'  // Render expects this folder to serve static files
  },
  server: {
    port: 5173
  }
});
