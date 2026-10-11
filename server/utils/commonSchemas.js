import { z } from 'zod';
import { normalizePhone } from './phone.js';

/** Texte non vide, pour les libellés de référentiel (métier, ville, zone). */
export const requiredText = (max, message = 'Ce champ est obligatoire') =>
  z
    .string({ error: message })
    .trim()
    .min(1, message)
    .max(max, `${max} caractères maximum`);

/**
 * Nom de personne réel : lettres (accents autorisés), espaces, tirets et
 * apostrophes - « Jean-Pierre », « O'Brien », « Mbarga ». Refuse les chiffres,
 * les symboles et les noms purement décoratifs.
 */
export const personNameSchema = z
  .string({ error: 'Le nom est obligatoire' })
  .trim()
  .min(3, 'Le nom doit contenir au moins 3 caractères')
  .max(50, 'Le nom ne doit pas dépasser 50 caractères')
  .regex(/^[\p{L}][\p{L}\p{Zs}'-]*$/u, 'Lettres, espaces, tirets et apostrophes uniquement');

/**
 * Nom d'affichage / pseudonyme : plus libre qu'un nom réel car c'est une
 * raison commerciale, mais toujours lisible. L'unicité est garantie en base
 * (migration professionals_display_name_unique).
 */
export const displayNameSchema = z
  .string({ error: 'Le nom affiché est obligatoire' })
  .trim()
  .min(3, 'Le nom affiché doit contenir au moins 3 caractères')
  .max(100, 'Le nom affiché ne doit pas dépasser 100 caractères')
  .regex(
    /^[\p{L}\p{N}][\p{L}\p{N}\s.'&/+_-]*$/u,
    'Lettres, chiffres et la ponctuation . \' & / + _ - uniquement',
  );

/**
 * Identifiant numérique
 *
 * Borné à 32767 : trades, zones, villes et catégories sont des `smallint`.
 * Sans cette borne, `?trade=99999` passait la validation et PostgreSQL
 * échouait sur le cast en 22003 - un 500 sur une route publique, là où la
 * seule réponse correcte est « aucun résultat ».
 */
export const idSchema = (message = 'Identifiant invalide') =>
  z.coerce.number({ error: message }).int(message).positive(message).max(32767, message);

/** Numéro de téléphone  */
export const phoneSchema = z
  .string({ error: 'Le numéro de téléphone est obligatoire' })
  .trim()
  .transform((value, ctx) => {
    const normalized = normalizePhone(value);
    if (!normalized) {
      ctx.addIssue({ code: 'custom', message: 'Numéro de téléphone invalide' });
      return z.NEVER;
    }
    return normalized;
  });

export const passwordSchema = z
  .string({ error: 'Le mot de passe est obligatoire' })
  .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
  // 72 octets = limite de bcrypt : au-delà, le hash est silencieusement tronqué.
  .max(72, 'Le mot de passe ne doit pas dépasser 72 caractères')
  .regex(
    /[a-zà-ÿ]/u,
    'Le mot de passe doit contenir au moins une minuscule',
  )
  .regex(
    /[A-ZÀ-Ÿ]/u,
    'Le mot de passe doit contenir au moins une majuscule',
  )
  // Un chiffre OU un caractère spécial : l'un des deux suffit.
  .regex(
    /[^A-Za-zÀ-ÿ\s]/,
    'Le mot de passe doit contenir au moins un chiffre ou caractère spécial',
  );

export const consentSchema = z
  .boolean({ error: 'Le consentement est obligatoire' })
  .refine((value) => value === true, 'Le consentement est obligatoire');

export const zoneIdsSchema = z
  .array(idSchema('Zone invalide'), { error: 'Choisissez au moins une zone' })
  .min(1, 'Choisissez au moins une zone')
  .transform((ids) => [...new Set(ids)]);

export const idParamSchema = z.object({ id: idSchema() });

export const paginationSchema = z.object({
  // `page` est bornée : OFFSET vaut (page - 1) * pageSize. Sans plafond,
  // `?page=1000000` impose à PostgreSQL de parcourir puis jeter 100 millions
  // de lignes avant d'en renvoyer 20.
  page: z.coerce.number().int().min(1).max(1000, 'Page trop élevée').default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});
