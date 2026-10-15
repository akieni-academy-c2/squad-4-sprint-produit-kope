import { env } from "../config/env.js";

const PALETTE = {
  ok: "\u001b[32m",
  redirect: "\u001b[36m",
  clientError: "\u001b[33m",
  serverError: "\u001b[31m",
  reset: "\u001b[0m",
  dim: "\u001b[2m",
};

/**
 * Classe un statut pour lui choisir une couleur. Isolé du reste pour être
 * testé sans avoir à décoder des séquences ANSI.
 * @param {number} status statut HTTP renvoyé
 * @returns {"ok"|"redirect"|"clientError"|"serverError"} le ton correspondant
 */
export function statusTone(status) {
  if (status >= 500) return "serverError";
  if (status >= 400) return "clientError";
  if (status >= 300) return "redirect";
  return "ok";
}

/**
 * La couleur n'est utile que sur un terminal. Redirigée vers un fichier, elle
 * n'y/met que des caractères parasites ; `NO_COLOR` est la convention admise
 * pour la désactiver explicitement.
 * @returns {boolean} vrai si l'on peut écrire des codes ANSI
 */
export function colorsEnabled() {
  if (process.env.NO_COLOR) return false;
  return process.stdout.isTTY === true;
}

/**
 * Compose la ligne journalisée, avec la couleur du statut si le terminal
 * l'accepte.
 * @param {{method: string, path: string}} req méthode et chemin de la requête
 * @param {number} status statut renvoyé
 * @param {number} ms durée de traitement en millisecondes
 * @param {boolean} [color] écrit des codes ANSI si vrai
 * @returns {string} ligne prête à journaliser
 */
export function formatRequestLine({ method, path }, status, ms, color = false) {
  const verb = `[${method}]`;
  const tail = ` ${ms.toFixed(1)}ms`;
  if (!color) return `${verb} ${path} ${status}${tail}`;
  const { dim, reset } = PALETTE;
  const tone = PALETTE[statusTone(status)];
  return `${tone}${verb}${reset}${dim} ${path} ${reset}${tone}${status}${reset}${dim}${tail}${reset}`;
}

/**
 * Une ligne par requête servie : méthode, chemin, statut, durée, colorée selon
 * le statut - vert, cyan, jaune, rouge. Sans elle, le gestionnaire d'erreurs dit
 * ce qui a cassé sans dire quelle requête.
 * La chaîne de requête n'est pas journalisée : elle porte des données
 * personnelles (numéros, recherches, identifiants).
 * @param {import("express").Request} req requête entrante
 * @param {import("express").Response} res réponse, observée à la clôture
 * @param {import("express").NextFunction} next relais
 * @returns {void} rien : l'écriture se fait à la clôture
 */
export function requestLogger(req, res, next) {
  const path = req.originalUrl.split("?")[0];
  if (path === "/api/health") return next();

  const startedAt = process.hrtime.bigint();
  res.on("finish", () => {
    const ms = Number(process.hrtime.bigint() - startedAt) / 1e6;
    const status = res.statusCode;
    const color = colorsEnabled();
    const line = formatRequestLine(
      { method: req.method, path },
      status,
      ms,
      color,
    );
    if (status >= 500) console.error(line);
    else if (status >= 400) console.warn(line);
    else if (env.NODE_ENV !== "test") console.log(line);
  });

  next();
}
