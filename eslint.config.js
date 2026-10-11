import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
    globalIgnores(['dist', 'dist-check']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      'no-unused-vars': ['error', { ignoreRestSiblings: true, argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'curly': ['error', 'multi'],
    },
  },
  {
    files: ['server/**/*.js', 'vite.config.js', 'vitest.config.js', 'tests/setup.js', 'tests/sql-live.test.js', 'tests/rateLimit.test.js'],
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    // Un repository ne fait que traduire SQL. S'il importe un service, la
    // frontière s'est dissoute et le module devient impossible à tester seul.
    files: ['server/modules/**/*.repository.js'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [{
          group: ['**/*.service.js', '**/*.controller.js'],
          message: 'Un repository ne peut pas importer de service ni de controller : il appartient a la couche donnees.',
        }],
      }],
    },
  },
  {
    // Les couches ne se traversent que vers le bas : une route declare des
    // middlewares, un controller appelle un service, un service passe par un
    // repository. Sauter une couche rend le module dependant de ses voisins.
    files: ['server/modules/**/*.controller.js'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [{
          group: ['**/*.repository.js', '../../db/pool.js'],
          message: 'Un controller passe par son service, jamais directement par le repository.',
        }],
      }],
    },
  },
  {
    files: ['src/shared/**/*.{js,jsx}'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [{
          group: ['@/shared/mocks/*'],
          message: 'shared/ ne doit pas consommer les mocks : les données de demonstration sont propres aux services de feature.',
        }],
      }],
    },
  },
])
