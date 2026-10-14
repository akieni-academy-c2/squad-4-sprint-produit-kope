import ViteExpress from 'vite-express';
import app from './app.js';
import { env } from './config/env.js';
import { pool } from './db/pool.js';

const server = ViteExpress.listen(app, env.PORT, () => (
  console.log(`server running on http://localhost:${env.PORT}`)
));


let shuttingDown = false;

['SIGTERM', 'SIGINT'].forEach((signal) => {
  process.on(signal, () => {
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

    setTimeout(() => {
      console.error('[shutdown] délai dépassé, arrêt forcé');
      process.exit(1);
    }, 10_000).unref();
  });
});

process.on('unhandledRejection', (reason) => {
  console.error('[unhandledRejection]', reason);
  process.exit(1);
});