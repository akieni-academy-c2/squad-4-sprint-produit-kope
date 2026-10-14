import { defineConfig } from 'vitest/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      '@server': path.resolve(__dirname, 'server'),
      '@test': path.resolve(__dirname, 'tests'),
      '@': path.resolve(__dirname, 'src'),
    },
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.js', 'tests/**/*.spec.js', 'tests/**/*.test.jsx'],
    setupFiles: ['./tests/setup.js'],
    clearMocks: true,
    reporters: ['default'],
  },
});
