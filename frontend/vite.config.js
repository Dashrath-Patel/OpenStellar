import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  root: '',
  build: {
    outDir: './build'
  },
  define: {
    'global': 'globalThis',
    'Buffer': ['buffer', 'Buffer'],
  },
  resolve: {
    alias: {
      'global': 'globalThis',
      'buffer': 'buffer/',
    }
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis'
      }
    }
  }
});
