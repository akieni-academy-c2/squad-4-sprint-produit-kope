// Variables d'environnement factices pour la suite de tests.
// `config/env.js` lève au chargement si DATABASE_URL ou SESSION_SECRET manquent :
// sans ce setup, 8 fichiers de test sur 22 échouent hors de la machine du poste.
//
// `||=` et non `=` : une variable réellement fournie l'emporte, ce qui permet
// aux tests SQL de viser la vraie base via `npm run test:db`.
process.env.DATABASE_URL ||= 'postgres://postgres:postgres@127.0.0.1:5432/kope_test';
process.env.SESSION_SECRET ||= 'test-session-secret';