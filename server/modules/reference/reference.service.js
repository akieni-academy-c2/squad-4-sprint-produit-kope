import * as repository from "./reference.repository.js";
import { cached } from "../../utils/cache.js";
import { env } from "../../config/env.js";

const TTL = env.REFERENCE_CACHE_TTL_MS;

/**
 * Les listes de référence sont relues à chaque page servie, par tous les
 * visiteurs, et changent rarement : un administrateur les modifie, rien d'autre.
 * Les garder en mémoire évite une connexion base par visiteur.
 */
export const listTrades = () =>
  cached("reference:trades", TTL, () => repository.listTrades());

export const listZones = () =>
  cached("reference:zones", TTL, () => repository.listZones());

/**
 * Les villes listées sont celles qui possèdent au moins un quartier : créer ou
 * supprimer un quartier change donc cette liste. L'invalidation est faite par
 * l'écriture du catalogue, pas par la lecture.
 */
export const listCities = () =>
  cached("reference:cities", TTL, () => repository.listCities());
