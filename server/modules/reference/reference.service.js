import * as repository from './reference.repository.js';

/**
 * Référentiel de lecture : métiers et zones d'intervention.
 *
 * Pas de schéma de validation : ces deux routes ne reçoivent ni paramètre de
 * chemin ni query string. Créer un `reference.schemas.js` vide n'apporterait
 * rien et romprait l'homogénéité apparente des modules, alors que l'absence
 * de fichier est ici justifiée.
 */

export const listTrades = () => repository.listTrades();

export const listZones = () => repository.listZones();

export const listCities = () => repository.listCities();