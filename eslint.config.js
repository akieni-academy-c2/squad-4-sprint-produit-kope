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
      'no-empty': ['error', { allowEmptyCatch: true }],
    },
  },
  {
    files: ['src/**/*.jsx'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: "JSXAttribute[name.name='className'] > Literal[value=/\\$\\{/]",
          message:
            "Un attribut className=\"…\" est une chaîne simple : ${…} y est du texte, pas une interpolation. Utilise className={`…`} ou cn(…).",
        },
        {
          selector: "CallExpression[callee.name='cn'] > Literal.arguments[0][value=/\\$\\{/]",
          message:
            "cn('…') reçoit une chaîne simple : ${…} y est du texte. cn(STICKY_TOP, …) n'interpole pas non plus.",
        },
        {
          selector: "Literal[value=/lg:top-\\(--header-height\\)/]",
          message:
            "Ce décalage est déclaré une seule fois, dans STICKY_TOP (ou STICKY_BAND). Une recopie diverge à la première retouche.",
        },
        {
          selector: "Literal[value=/inputMode=[\\\"']tel[\\\"']|type=[\\\"']tel[\\\"']|T.l.phon \\(0|\\+242 06 000/]",
          message:
            "Une saisie de numéro passe par PhoneInput, seul endroit où l'indicatif +242 et son séparateur sont posés.",
        },
      ],
    },
  },
  {
    files: [
      'server/**/*.js',
      'vite.config.js',
      'vitest.config.js',
      'scripts/**/*.mjs',
      'tests/setup.js',
      'tests/support/**/*.js',
      'tests/server/**/*.js',
      'tests/sql-live.test.js',
    ],
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    files: ['tests/src/**/*.js'],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
  },
  {
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
