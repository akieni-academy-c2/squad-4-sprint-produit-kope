import { env } from '../config/env.js';

const PG_ERRORS = {
  '23505': [409, 'Cette valeur existe déjà'],
  '23503': [400, 'Référence invalide (métier, zone…)'],
  '23514': [400, 'Données invalides'],'22003': [400, 'Valeur hors limites'],
  '22P02': [400, 'Format de donnée invalide'],
  '22001': [400, 'Valeur trop longue'],
};

const UPLOAD_ERRORS = {
  LIMIT_FILE_SIZE: () =>
    `La photo dépasse ${Math.round(env.MAX_FILE_SIZE_BYTES / (1024 * 1024))} Mo`,
  LIMIT_UNEXPECTED_FILE: () => 'Envoyez une seule photo dans le champ « photo »',
  LIMIT_FILE_COUNT: () => 'Envoyez une seule photo dans le champ « photo »',
  LIMIT_FIELD_COUNT: () => 'Trop de champs dans le formulaire',
  LIMIT_PART_COUNT: () => 'Trop de segments dans la requête',
  LIMIT_FIELD_KEY: () => 'Nom de champ trop long',
  LIMIT_FIELD_VALUE: () => 'Valeur de champ trop longue',
  LIMIT_HEADER_PAIRS: () => 'Trop d’en-têtes',
};

export function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  let status = err.status ?? 500;
  let message = err.message;
  let errors = err.errors;

  const uploadMessage = UPLOAD_ERRORS[err.code]?.();
  if (uploadMessage) {
    status = 400;
    message = uploadMessage;
    errors = { photo: uploadMessage };
  } else if (err.type === 'entity.parse.failed') {
    status = 400;
    message = 'JSON invalide';
  } else if (
    err.code === 'ECONNREFUSED' ||
    err.code === 'ECONNRESET' ||
    err.code === 'ETIMEDOUT' ||
    /timeout expired/i.test(String(err.message ?? ''))
  ) {
    status = 503;
    message = 'Base de données indisponible';
    errors = undefined;
  } else if (PG_ERRORS[err.code]) [status, message] = PG_ERRORS[err.code];

  if (status >= 500) {
    console.error('[error]', {
      code: err.code,
      constraint: err.constraint,
      table: err.table,
      detail: undefined,
      message: err.message,
    });
    if (status !== 503) {
      message = 'Erreur interne du serveur';
      errors = undefined;
    }
  }
  res.status(status).json({ message, ...(errors && { errors }) });
}
