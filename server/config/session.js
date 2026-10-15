import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { pool } from "../db/pool.js";
import { env, isProduction } from "./env.js";

export const SESSION_COOKIE = "sid";

const PgStore = connectPgSimple(session);

/**
 * `secure: "auto"` suit le protocole réel de la requête plutôt que
 * `NODE_ENV` : le cookie n'est marqué `Secure` que sur une connexion TLS. Un
 * `bun start` local en HTTP garde ainsi une session utilisable, et un
 * déploiement HTTPS reste protégé.
 *
 * `proxy` est indispensable à ce mécanisme : sans lui, `express-session` ignore
 * `app.set("trust proxy")` et lit `req.connection.encrypted`, toujours faux
 * derrière un proxy. La valeur est alignée sur celle posée dans `app.js`.
 * @returns {import("express").RequestHandler} middleware de session
 */
export const sessionMiddleware = session({
  store: new PgStore({ pool, tableName: env.SESSION_TABLE }),
  name: SESSION_COOKIE,
  secret: env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  proxy: isProduction,
  cookie: {
    httpOnly: true,
    sameSite: "lax",
    secure: env.COOKIE_SECURE,
    maxAge: env.SESSION_MAX_AGE_MS,
  },
});
