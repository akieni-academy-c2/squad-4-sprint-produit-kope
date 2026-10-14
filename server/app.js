import express from 'express';
import { env, isProduction } from './config/env.js';
import { sessionMiddleware } from './config/session.js';
import routes from './routes.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { securityHeaders, csrfGuard } from './middlewares/securityHeaders.js';

const uploadDir = env.UPLOAD_DIR.replace(/[\\/]+$/, '');
const repoRoot = process.cwd();
const escapesRepo = (dir) => repoRoot.startsWith(`${dir}\\`) || repoRoot.startsWith(`${dir}/`);
if (uploadDir === repoRoot || escapesRepo(uploadDir))
  throw new Error(`UPLOAD_DIR (${uploadDir}) ne peut pas contenir la racine du projet`);

const app = express();
if (isProduction) app.set('trust proxy', 2);
app.disable('x-powered-by');
app.use(securityHeaders);
app.use(express.json({ limit: '100kb' }));
app.use(
  '/uploads',
  express.static(env.UPLOAD_DIR, {
    maxAge: '7d',
    dotfiles: 'deny',
    index: false,
    redirect: false,
  }),
);
app.use('/api', sessionMiddleware, csrfGuard(), routes);
app.use('/api', (req, res) => res.status(404).json({ message: 'Route introuvable' }));
app.use(errorHandler);

export default app;