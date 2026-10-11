import bcrypt from 'bcryptjs';
import { ApiError } from '../../utils/ApiError.js';
import { offsetOf, paginateSafely } from '../../utils/pagination.js';
import * as repository from './admin.repository.js';
import * as catalogRepository from './catalog.repository.js';
import { env } from '../../config/env.js';


export async function listProfessionals(query) {
  const rows = await repository.listProfessionals({
    limit: query.pageSize,
    offset: offsetOf(query),
    q: query.q,
    status: query.status,
    sort: query.sort,
    city: query.city,
  });
  return paginateSafely(rows, query, () =>
    repository.countProfessionals({ q: query.q, status: query.status, city: query.city }),
  );
}

export async function listReviews(query) {
  const rows = await repository.listReviews({
    limit: query.pageSize,
    offset: offsetOf(query),
    hidden: query.hidden,
    q: query.q,
  });
  return paginateSafely(rows, query, () => repository.countReviews({ hidden: query.hidden, q: query.q }));
}

export async function listUsers(query) {
  const rows = await repository.listUsers({
    limit: query.pageSize,
    offset: offsetOf(query),
    role: query.role,
    q: query.q,
  });
  return paginateSafely(rows, query, () => repository.countUsers({ role: query.role, q: query.q }));
}

export async function setUserBlocked(actorId, id, blocked) {
  if (Number(actorId) === Number(id)) throw ApiError.badRequest('Vous ne pouvez pas bloquer votre propre compte');

  const target = blocked ? await repository.findUserById(id) : null;
  if (blocked && !target) throw ApiError.notFound('Utilisateur introuvable');
  if (blocked && target.role === 'admin' && (await repository.countActiveAdmins(id)) === 0)
    throw ApiError.badRequest('Impossible de bloquer le dernier administrateur actif');

  const updated = await repository.setUserBlocked(id, blocked);
  if (!updated) throw ApiError.notFound('Utilisateur introuvable');
  // La session est conservée : `loadActiveUser` refusera chaque requête avec
  // un 403 motivé, ce qui est plus clair pour l'utilisateur qu'une déconnexion.
  return updated;
}

/** Lève ou applique la suspension d'un compte. */
export async function setUserSuspended(actorId, id, suspended) {
  if (Number(actorId) === Number(id)) throw ApiError.badRequest('Vous ne pouvez pas suspendre votre propre compte');

  const target = await repository.findUserById(id);
  if (!target) throw ApiError.notFound('Utilisateur introuvable');
  if (suspended && target.role === 'admin' && (await repository.countActiveAdmins(id)) === 0)
    throw ApiError.badRequest('Impossible de suspendre le dernier administrateur actif');

  const updated = await repository.setUserSuspended(id, suspended);
  if (!updated) throw ApiError.notFound('Utilisateur introuvable');
  // Une suspension imply le blocage ; lever la suspension redonne aussi l'accès.
  await repository.setUserBlocked(id, suspended);
  return updated;
}

export async function createAdmin({ firstName, lastName, phone, password }) {
  const passwordHash = await bcrypt.hash(password, env.BCRYPT_ROUNDS);
  try {
    return await repository.createAdminUser({ firstName, lastName, phone, passwordHash });
  } catch (err) {
    if (err?.code === '23505') throw ApiError.conflict('Ce numéro est déjà utilisé');
    throw err;
  }
}

export async function getStats() {
  const stats = await repository.countStats();
  const recent = await repository.listRecentProfessionals(5);
  // `published` et `hidden` sont disjoints (la vue exclut les profils masqués) :
  // le solde correspond aux profils incomplets.
  const incomplete = Math.max(0, stats.total - stats.published - stats.hidden);
  return {
    users: stats.users,
    clients: stats.clients,
    professionals: stats.professionals,
    published: stats.published,
    hidden: stats.hidden,
    incomplete,
    reviews: stats.reviews,
    reviewsHidden: stats.reviewsHidden,
    ratingAverage: stats.ratingAverage,
    contacts: stats.contacts,
    recentProfessionals: recent,
  };
}

/** profil masqué = absent des recherches. */
export async function setProfessionalHidden(id, hidden) {
  const updated = await repository.setProfessionalHidden(id, hidden);
  if (!updated) throw ApiError.notFound('Profil introuvable');
  return { id, hidden };
}

/** avis masqué = non affiché et exclu des calculs. */
export async function setReviewHidden(id, hidden) {
  const updated = await repository.setReviewHidden(id, hidden);
  if (!updated) throw ApiError.notFound('Avis introuvable');
  return { id, hidden };
}

/**
 * Fabrique des opérations d'un catalogue : les règles (doublon, clé étrangère
 * inconnue, ressource encore utilisée) sont identiques pour les 4 entités.
 *
 * `fkLabel` active la gestion de la clé étrangère optionnelle.
 */
function makeCatalogService({ catalog, list, entity, duplicate, fkLabel, usedByProfessionals, usedByChildren }) {
  const translate = (err) => {
    if (err?.code === '23505') throw ApiError.conflict(duplicate);
    if (err?.code === '23503') throw ApiError.badRequest(fkLabel);
    throw err;
  };

  return {
    async create({ name, fkId }) {
      try {
        return await catalog.create(name, fkId);
      } catch (err) {
        translate(err);
      }
    },

    // Le contrôle « introuvable » reste hors du try : capturé par son propre
    // catch, il remontait par accident via le re-throw final.
    async update(id, { name, fkId }) {
      let updated;
      try {
        updated = await catalog.update(id, name, fkId);
      } catch (err) {
        translate(err);
      }
      if (!updated) throw ApiError.notFound(`${entity} introuvable`);
      return updated;
    },

    async remove(id) {
      if (await catalog.inUse(id)) throw ApiError.badRequest(usedByProfessionals || usedByChildren);
      const deleted = await catalog.remove(id);
      if (!deleted) throw ApiError.notFound(`${entity} introuvable`);
      return { id };
    },

    async reorder(ids) {
      await catalog.reorder(ids);
      return { ids };
    },

    list: async () => ({ items: await list() }),
  };
}

const tradeCategoryService = makeCatalogService({
  catalog: catalogRepository.tradeCategories,
  list: () => repository.listTradeCategories(),
  entity: 'Catégorie',
  duplicate: 'Cette catégorie existe déjà',
  usedByChildren: 'Déplacez les métiers de cette catégorie avant de la supprimer',
});

const tradeService = makeCatalogService({
  catalog: catalogRepository.trades,
  list: () => repository.listTrades(),
  entity: 'Métier',
  duplicate: 'Ce métier existe déjà',
  fkLabel: 'Catégorie inconnue',
  usedByProfessionals: 'Ce métier est utilisé par des professionnels',
});

const cityService = makeCatalogService({
  catalog: catalogRepository.cities,
  list: () => repository.listCities(),
  entity: 'Ville',
  duplicate: 'Cette ville existe déjà',
  usedByChildren: 'Déplacez les arrondissements de cette ville avant de la supprimer',
});

const zoneService = makeCatalogService({
  catalog: catalogRepository.zones,
  list: () => repository.listZones(),
  entity: 'Zone',
  duplicate: 'Cette zone existe déjà',
  fkLabel: 'Ville inconnue',
  usedByProfessionals: 'Cette zone est utilisée par des professionnels',
});

export const listTradeCategories = tradeCategoryService.list;
export const createTradeCategory = tradeCategoryService.create;
export const updateTradeCategory = tradeCategoryService.update;
export const deleteTradeCategory = tradeCategoryService.remove;
export const reorderTradeCategories = tradeCategoryService.reorder;

export const listTrades = tradeService.list;
export const createTrade = tradeService.create;
export const updateTrade = tradeService.update;
export const deleteTrade = tradeService.remove;
export const reorderTrades = tradeService.reorder;

export const listCities = cityService.list;
export const createCity = cityService.create;
export const updateCity = cityService.update;
export const deleteCity = cityService.remove;
export const reorderCities = cityService.reorder;

export const listZones = zoneService.list;
export const createZone = zoneService.create;
export const updateZone = zoneService.update;
export const deleteZone = zoneService.remove;
export const reorderZones = zoneService.reorder;
