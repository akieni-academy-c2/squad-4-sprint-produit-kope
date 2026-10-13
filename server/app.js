import express from 'express';
import { env, isProduction } from './config/env.js';
import { sessionMiddleware } from './config/session.js';
import routes from './routes.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { securityHeaders } from './middlewares/securityHeaders.js';

const app = express();
if (isProduction) app.set('trust proxy', 1);
app.disable('x-powered-by');
app.use(securityHeaders);
app.use(express.json());
// Pas d'index de dossier ni de fichiers cachés exposés dans /uploads.
app.use('/uploads', express.static(env.UPLOAD_DIR, { maxAge: '7d', dotfiles: 'deny', index: false }));
app.use('/api', sessionMiddleware, routes);
app.use('/api', (req, res) => res.status(404).json({ message: 'Route introuvable' }));
app.use(errorHandler);

export default app;