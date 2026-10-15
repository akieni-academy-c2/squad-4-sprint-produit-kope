# Frontend Architecture (React 19 + Vite)

Documentation du client frontend intégré via React 19, Tailwind CSS v4 et Vite.

---

## Tech Stack & Optimization

- **React 19:** Utilisation des nouveaux hooks et patterns modernes.
- **React Compiler:** Intégré via `babel-plugin-react-compiler`. Il mémoïse automatiquement les composants et valeurs, réduisant le besoin de `useMemo` / `useCallback` manuels.
- **Tailwind CSS v4:** Importation et configuration directe via `@tailwindcss/vite`.
- **ViteExpress:** L'application client est servie sur le même port que l'API Express en développement comme en production, évitant les problèmes de CORS.

---

## Organisation actuelle

```text
src/
├── assets/          # Images et ressources
├── components/      # Composants UI, formulaires et layout partagés
├── features/        # Fonctionnalités métier (auth, professionnels, recherche...)
├── lib/             # API, constantes et utilitaires
├── mocks/           # Données et ressources de démonstration
├── pages/           # Pages générales
├── routes/          # Définition du routage
├── shared/          # Hooks et contextes partagés
├── index.css        # Styles globaux et directives Tailwind
└── main.jsx         # Point d'entrée React DOM
```

---

## API Calls & Routing

Puisque le frontend et le backend partagent la même origine grâce à `vite-express`, tous les appels d'API vers le serveur doivent utiliser des chemins relatifs :

```javascript
import { api } from "@/lib/api.js";

const data = await api.get("/professionals");
```

---

## Styling Convention

Ce projet utilise **Tailwind CSS v4**. Privilégiez les classes utilitaires directement dans vos éléments JSX et découpez en composants réutilisables dans `src/components/` lorsque des motifs d'interface se répètent.

## Conventions JavaScript

**Comparaisons.** Utilisez `===`. La seule exception admise est `x == null`,
qui teste « absent ou non défini » en une expression - c'est utile pour les
saisies de formulaire, où un champ vide arrive en `""` et un champ non touché en
`undefined`. Cette exception est volontaire et assumee ici ; un `==` sur une
autre valeur est un défaut.

**Repli de valeur.** `??` quand le repli signifie « absent ». `||` est reserve
aux cas où une valeur falsy legitimate doit aussi tomber : un `|| []` sur un
tableau vide fait ce qu'on veut, mais `|| "Inconnu"` transformerait un `0` - un
compteur, une note - en chaîne.
