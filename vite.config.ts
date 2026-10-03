import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages: relative base works at USERNAME.github.io/REPOSITORY/ and locally.
// Do not hard-code the repository name.
export default defineConfig({
  plugins: [react()],
  base: './',
});
