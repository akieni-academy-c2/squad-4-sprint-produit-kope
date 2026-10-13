import { repoPath } from '@test/support/repoRoot.js';
import { readdir, readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PublicationStatus } from '@/features/professionals/components/PublicationStatus.jsx';

const { findOwnProfile, listPhotos } = vi.hoisted(() => ({
  findOwnProfile: vi.fn(),
  listPhotos: vi.fn(),
}));

vi.mock('@server/modules/professionals/professionals.repository.js', () => ({
  findOwnProfile,
}));
vi.mock('@server/modules/photos/photos.service.js', () => ({
  listPhotos,
}));

import { getOwnProfile } from '@server/modules/professionals/professionals.service.js';

describe('US-06 - statut de publication du profil', () => {
  beforeEach(() => {
    findOwnProfile.mockReset();
    listPhotos.mockReset();
  });

  it('affiche Incomplet et la liste précise des six critères RG-04 manquants', async () => {
    findOwnProfile.mockResolvedValue({
      id: 42,
      displayName: '',
      tradeId: null,
      tradeName: '',
      phone: '',
      description: null,
      zones: [],
      photoCount: 0,
      isPublished: false,
      isHidden: false,
    });
    listPhotos.mockResolvedValue([]);

    const profile = await getOwnProfile(42);

    expect(profile.status).toBe('incomplete');
    expect(profile.missing.map(({ code }) => code)).toEqual([
      'displayName',
      'trade',
      'zones',
      'phone',
      'description',
      'photos',
    ]);

    const html = renderToStaticMarkup(
      <PublicationStatus status={profile.status} missing={profile.missing} />,
    ).replaceAll('&#x27;', "'");
    expect(html).toContain('Incomplet');
    expect(html).toContain('Renseignez le nom affiché');
    expect(html).toContain('Choisissez un métier');
    expect(html).toContain("Choisissez au moins une zone d'intervention");
    expect(html).toContain('Renseignez un numéro de téléphone');
    expect(html).toContain('Ajoutez une description (30 caractères minimum)');
    expect(html).toContain('Ajoutez au moins une photo de réalisation');
  });

  it('affiche Publié sans checklist quand tous les critères RG-04 sont remplis', async () => {
    findOwnProfile.mockResolvedValue({
      id: 42,
      displayName: 'Awa Artisan',
      tradeId: 1,
      tradeName: 'Menuisière',
      phone: '+242060000001',
      description: 'Description complète et suffisamment longue pour le profil.',
      yearsExperience: 5,
      zones: [{ id: 1, name: 'Bacongo' }],
      photoCount: 1,
      isPublished: true,
      isHidden: false,
    });
    listPhotos.mockResolvedValue([{ id: 1, url: '/photo.jpg' }]);

    const profile = await getOwnProfile(42);

    expect(profile.status).toBe('published');
    expect(profile.missing).toEqual([]);
    expect(
      renderToStaticMarkup(
        <PublicationStatus status={profile.status} missing={profile.missing} />,
      ),
    ).toContain('Publié');
  });

  it.each([
    ['nom affiché', { displayName: ' ' }, 'displayName'],
    ['métier', { tradeId: null, tradeName: '' }, 'trade'],
    ['zone', { zones: [] }, 'zones'],
    ['téléphone', { phone: ' ' }, 'phone'],
    ['description de moins de 30 caractères', { description: 'Description trop courte.' }, 'description'],
    ['dernière photo supprimée', { photoCount: 0 }, 'photos'],
  ])('repasse à Incomplet si RG-04 perd son critère « %s »', async (_criterion, changed, missingCode) => {
    findOwnProfile.mockResolvedValue({
      id: 42,
      displayName: 'Awa Artisan',
      tradeId: 1,
      tradeName: 'Menuisière',
      phone: '+242060000001',
      description: 'Description complète et suffisamment longue pour le profil.',
      yearsExperience: null,
      zones: [{ id: 1, name: 'Bacongo' }],
      photoCount: 1,
      isPublished: false,
      isHidden: false,
      ...changed,
    });
    listPhotos.mockResolvedValue(changed.photoCount === 0 ? [] : [{ id: 1, url: '/photo.jpg' }]);

    const profile = await getOwnProfile(42);

    expect(profile.status).toBe('incomplete');
    expect(profile.missing.map(({ code }) => code)).toContain(missingCode);
  });

  it('garde le statut Masqué prioritaire et ne présente pas un profil masqué comme incomplet', async () => {
    findOwnProfile.mockResolvedValue({
      id: 42,
      displayName: '',
      tradeId: null,
      tradeName: '',
      phone: '',
      description: null,
      zones: [],
      photoCount: 0,
      isPublished: false,
      isHidden: true,
    });
    listPhotos.mockResolvedValue([]);

    const profile = await getOwnProfile(42);

    expect(profile.status).toBe('hidden');
    expect(profile.missing).toEqual([]);
  });

  it('calcule le statut et les recherches avec la vue RG-04 de la base', async () => {
    const professionalsRepository = await vi.importActual(
      '@server/modules/professionals/professionals.repository.js',
    );
    const searchRepository = await vi.importActual('@server/modules/search/search.repository.js');
    const db = { query: vi.fn().mockResolvedValue({ rows: [] }) };

    await professionalsRepository.findOwnProfile(42, db);
    expect(db.query.mock.calls[0][0]).toContain(
      'EXISTS (SELECT 1 FROM published_professionals v WHERE v.user_id = p.user_id)',
    );
    expect(db.query.mock.calls[0][0]).toContain(
      '(SELECT COUNT(*) FROM photos ph WHERE ph.professional_id = p.user_id)',
    );

    await searchRepository.searchPublished(
      { tradeId: 1, zoneId: null, limit: 10, offset: 0 },
      db,
    );
    expect(db.query.mock.calls[1][0]).toContain('FROM published_professionals p');

    // La vue est redéfinie par plusieurs migrations : il faut lire la DERNIÈRE
    // définition, sinon le test passe alors que la vue réelle a changé.
    const dir = pathToFileURL(`${repoPath('server/db/migrations')}/`);
    const files = (await readdir(dir)).filter((f) => f.endsWith('.sql')).sort();
    const definitions = [];

    for (const file of files) {
      const content = await readFile(new URL(file, dir), 'utf8');
      const up = content.split('-- Down Migration')[0];
      const view = up.match(/(?:CREATE OR REPLACE VIEW|CREATE VIEW) published_professionals AS([\s\S]*)/i);
      if (view) definitions.push(view[1]);
    }

    expect(definitions.length).toBeGreaterThan(0);
    const publicationView = definitions[definitions.length - 1];

    expect(publicationView).toContain('char_length(btrim(p.display_name)) > 0');
    expect(publicationView).toContain('char_length(btrim(t.name)) > 0');
    expect(publicationView).toContain('EXISTS (SELECT 1 FROM professional_zones');
    expect(publicationView).toContain('char_length(btrim(u.phone)) > 0');
    expect(publicationView).toContain('char_length(btrim(p.description)) >= 30');
    expect(publicationView).toContain('EXISTS (SELECT 1 FROM photos');
    expect(publicationView).toContain('WHERE NOT p.is_hidden');
    // Un compte suspendu ne doit jamais rester dans l'annuaire public.
    expect(publicationView).toContain('u.suspended_at IS NULL');
  });
});
