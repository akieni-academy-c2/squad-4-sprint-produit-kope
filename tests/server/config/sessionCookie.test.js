import { describe, it, expect, afterAll } from "vitest";
import express from "express";
import session from "express-session";
import http from "node:http";
import { env } from "@server/config/env.js";

/**
 * Reproduit les options de `server/config/session.js`. `secure` est passé en
 * paramètre pour comparer les deux réglages sur le même banc.
 * @param {boolean|string} secure valeur passée à `cookie.secure`
 * @returns {import("express").RequestHandler} middleware de session
 */
function sessionWith(secure) {
  return session({
    name: "sid",
    secret: "x".repeat(40),
    resave: false,
    saveUninitialized: false,
    proxy: true,
    cookie: { httpOnly: true, sameSite: "lax", secure, maxAge: 60_000 },
  });
}

const servers = [];

/**
 * Demande une page qui touche la session, et rend le `Set-Cookie` reçu.
 * @param {boolean|string} secure valeur passée à `cookie.secure`
 * @param {string|null} forwardedProto en-tête `X-Forwarded-Proto`, ou null
 * @returns {Promise<string|null>} l'en-tête brut, ou null si aucun cookie
 */
async function probe(secure, forwardedProto) {
  const app = express();
  app.use(sessionWith(secure));
  app.get("/x", (req, res) => {
    req.session.touched = true;
    res.end("ok");
  });
  const server = http.createServer(app);
  servers.push(server);
  await new Promise((resolve) => server.listen(0, resolve));

  const headers = forwardedProto ? { "X-Forwarded-Proto": forwardedProto } : {};
  const raw = await new Promise((resolve, reject) => {
    http
      .get({ port: server.address().port, path: "/x", headers }, (res) => {
        res.resume();
        resolve(res.headers["set-cookie"]?.[0] ?? null);
      })
      .on("error", reject);
  });
  return raw;
}

afterAll(async () => {
  await Promise.all(servers.map((s) => new Promise((r) => s.close(r))));
});

describe("cookie de session", () => {
  it("vaut 'auto' par défaut, et non une valeur déduite de NODE_ENV", () => {
    expect(env.COOKIE_SECURE).toBe("auto");
  });

  /**
   * Un `bun start` local est servi en HTTP simple. Un cookie marqué `Secure`
   * n'y est jamais renvoyé par le navigateur : la connexion répond 200 puis tout
   * le reste répond 401. C'est le symptôme que ce réglage évite.
   */
  it("envoie le cookie en HTTP simple quand il suit le protocole", async () => {
    const cookie = await probe("auto", null);
    expect(cookie, "aucun cookie envoyé en HTTP simple").toBeTruthy();
    expect(cookie).not.toContain("Secure");
  });

  it("marque le cookie Secure dès que la connexion est en TLS", async () => {
    const cookie = await probe("auto", "https");
    expect(cookie).toContain("Secure");
  });

  it("n'envoie aucun cookie si Secure est imposé hors TLS", async () => {
    expect(await probe(true, null)).toBeNull();
  });
});
