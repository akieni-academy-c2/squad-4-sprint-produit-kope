import { defineConfig } from 'vitest/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      // Les tests miroitent `src/` et `server/` : un fichier placé dans
      // `tests/src/features/admin/components/catalog/` importe son sujet par
      // `@/features/admin/...`. Sans alias, la profondeur d'un test ferait
      // varier le nombre de `../` d'un fichier à l'autre — et le déplacer
      // casserait ses imports pour une raison étrangère au code testé.
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
