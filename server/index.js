import ViteExpress from 'vite-express';
import app from './app.js';
import { env } from './config/env.js';
import { pool } from './db/pool.js';

const server = ViteExpress.listen(app, env.PORT, () => (
  console.log(`server running on http://localhost:${env.PORT}`)
));

/**
 * Arrêt propre.
 *
 * Sur un redéploiement, le processus reçoit un `SIGTERM` puis est tué. Sans
 * drainage, une requête en cours est interrompue au milieu d'une transaction :
 * la session reste ouverte, l'écriture à moitié appliquée. `server.close()`
 * cesse d'accepter de nouvelles connexions et laisse les requêtes en vol se
 * terminer ; `pool.end()` rend les connexions restantes au PostgreSQL.
 */
let shuttingDown = false;

// `forEach` et non `for...of` : la règle `curly` du projet retire les accolades
// après `for`, et un `if` seul sous `for` se lit comme une faute.
['SIGTERM', 'SIGINT'].forEach((signal) => {
  process.on(signal, () => {
    // Un second `SIGTERM` pendant l'arrêt - le superviseur qui n'obtient pas
    // de réponse - doit accélérer la sortie, pas relancer le drainage.
    if (shuttingDown) {
      console.warn(`${signal} reçu deux fois : arrêt immédiat`);
      process.exit(1);
    }
    shuttingDown = true;
    console.log(`${signal} reçu, arrêt en cours…`);

    server.close(async () => {
      await pool.end().catch((err) => console.error('[shutdown] pool non fermé', err));
      process.exit(0);
    });

    // Filet de sécurité : une connexion tenue ouverte par un client ne doit
    // pas empêcher l'arrêt indéfiniment.
    setTimeout(() => {
      console.error('[shutdown] délai dépassé, arrêt forcé');
      process.exit(1);
    }, 10_000).unref();
  });
});

// Une promesse rejetée sans gestionnaire laisse un processus dans un état
// indéfini : selon la version de Node, il continue de tourner en ignorant
// l'erreur, ou s'arrête sans libérer le pool. Dans les deux cas, mieux vaut le
// voir mourir ici, avec la raison, que continuer à répondre en dégradé.
process.on('unhandledRejection', (reason) => {
  console.error('[unhandledRejection]', reason);
  process.exit(1);
});