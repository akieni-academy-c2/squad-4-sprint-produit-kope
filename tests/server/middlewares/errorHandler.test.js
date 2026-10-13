import { describe, it, expect, vi } from 'vitest';
import { errorHandler } from '@server/middlewares/errorHandler.js';
import { ApiError } from '@server/utils/ApiError.js';

function mockRes() {
  const res = {};
  res.headersSent = false;
  res.status = vi.fn(() => res);
  res.json = vi.fn(() => res);
  return res;
}

describe('errorHandler', () => {
  it('mappe les erreurs PG unique_violation vers 409', () => {
    const res = mockRes();
    errorHandler({ code: '23505' }, {}, res, vi.fn());
    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json.mock.calls[0][0].message).toMatch(/existe déjà/);
  });

  it('mappe les erreurs de connexion DB vers 503 explicite', () => {
    const res = mockRes();
    errorHandler({ code: 'ECONNREFUSED', message: 'connect ECONNREFUSED' }, {}, res, vi.fn());
    expect(res.status).toHaveBeenCalledWith(503);
    expect(res.json.mock.calls[0][0].message).toMatch(/Base de données indisponible/);
  });

  it('mappe le timeout pg pool vers 503', () => {
    const res = mockRes();
    errorHandler(new Error('timeout expired'), {}, res, vi.fn());
    expect(res.status).toHaveBeenCalledWith(503);
  });

  it('mappe LIMIT_FILE_SIZE vers 400', () => {
    const res = mockRes();
    errorHandler({ code: 'LIMIT_FILE_SIZE' }, {}, res, vi.fn());
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('conserve le statut ApiError et le message métier', () => {
    const res = mockRes();
    errorHandler(ApiError.conflict('Déjà inscrit'), {}, res, vi.fn());
    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json.mock.calls[0][0].message).toBe('Déjà inscrit');
  });

  it('masque le détail d une erreur 500 interne', () => {
    const res = mockRes();
    errorHandler(new Error('détail sensible'), {}, res, vi.fn());
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json.mock.calls[0][0].message).toBe('Erreur interne du serveur');
  });

  it('délègue si les headers sont déjà envoyés', () => {
    const res = mockRes();
    res.headersSent = true;
    const next = vi.fn();
    errorHandler(new Error('x'), {}, res, next);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });
});
