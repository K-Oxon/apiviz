import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['@duckdb/duckdb-wasm'],
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          duckdb: ['@duckdb/duckdb-wasm'],
        },
      },
    },
  },
  server: {
    port: 3000,
  },
  base: '/apiviz/',
});
