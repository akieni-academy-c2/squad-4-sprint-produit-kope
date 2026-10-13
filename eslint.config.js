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
    // Règles de dépôt.
    //
    // Ces quatre contrôles vivaient dans des tests qui lisaient le code source
    // pour y chercher des chaînes. Ils vérifiaient que le fichier **contenait**
    // un texte, pas que l'écran produisait le bon résultat - et ils ne
    // s'exécutaient qu'au moment de la suite, donc après coup.
    //
    // Un contrôle statique appartient au linter : il tourne à l'enregistrement,
    // il donne une position sur la ligne fautive, et il n'occupe aucun temps de
    // test. Aucun test ne les perd : ils n'en étaient pas.
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
    // Les tests sont rangés comme le code qu'ils vérifient : ce qui touche au
    // serveur s'exécute avec les globales Node, ce qui touche à l'interface
    // avec celles du navigateur. Un `.test.jsx` sous `tests/server/` est donc
    // aussi un signal que le test est rangé du mauvais côté.
    files: ['tests/src/**/*.js'],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
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
