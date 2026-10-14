import { describe, expect, it } from 'vitest';
import * as adminApi from '@/features/admin/services/admin.service.js';
import * as authApi from '@/features/auth/services/auth.service.js';
import * as prosApi from '@/features/professionals/services/professionals.service.js';
import * as photosApi from '@/features/photos/services/photos.service.js';
import * as reviewsApi from '@/features/reviews/services/reviews.service.js';
import * as contactsApi from '@/features/contacts/services/contacts.service.js';
import * as referenceApi from '@/features/reference/services/reference.service.js';
import { searchProfessionals } from '@/features/search/hooks/useSearch.js';



const unique = (prefix) => `${prefix} ${Date.now()}${Math.floor(Math.random() * 1000)}`;
const blockable = (user) => user.role === 'client' || user.role === 'professional';

async function findByRole(role) {
  const { items } = await adminApi.listUsers({ role, pageSize: 200 });
  expect(items.length).toBeGreaterThan(0);
  return items;
}

describe('audit - actions utilisateur', () => {
  describe('compte', () => {
    it('inscrit un client', async () => {
      const user = await authApi.registerClient({
        firstName: 'Ada',
        lastName: 'Audit',
        phone: '+242060000001',
        password: 'motdepasse',
      });
      expect(user.role).toBe('client');
      expect(user.phone).toBe('+242060000001');
    });

    it('inscrit un professionnel', async () => {
      const user = await authApi.registerProfessional({
        displayName: unique('Atelier'),
        phone: '+242060000002',
        password: 'motdepasse',
        tradeId: 1,
        zoneIds: [1],
      });
      expect(user.role).toBe('professional');
      expect(user.displayName).toBeTruthy();
    });

    it('se connecte', async () => {
      const user = await authApi.login({ phone: '+242060000001', password: 'motdepasse' });
      expect(user.role).toBe('client');
    });

    it('se déconnecte', async () => {
      await expect(authApi.logout()).resolves.toBeDefined();
    });

    it('devient professionnel', async () => {
      const user = await authApi.becomeProfessional({
        displayName: unique('Nouveau pro'),
        tradeId: 1,
        zoneIds: [1],
        description: 'x'.repeat(40),
        yearsExperience: 3,
      });
      expect(user.role).toBe('professional');
    });

    it('met à jour son compte', async () => {
      await expect(
        authApi.updateAccount({ firstName: 'Ada', lastName: 'Auditée', phone: '+242060000003' }),
      ).resolves.toBeDefined();
    });

    it('change son mot de passe', async () => {
      await expect(
        authApi.changePassword({ currentPassword: 'motdepasse', newPassword: 'motdepasse2' }),
      ).resolves.toBeDefined();
    });

    it('téléverse un avatar', async () => {
      const file = new Blob(['image'], { type: 'image/png' });
      const url = await authApi.uploadAvatar(file);
      expect(typeof url).toBe('string');
      expect(url.length).toBeGreaterThan(0);
    });
  });

  describe('espace professionnel', () => {
    it('lit mon profil', async () => {
      const profile = await prosApi.getMyProfile();
      expect(profile.displayName).toBeTruthy();
      expect(Array.isArray(profile.photos)).toBe(true);
      expect(profile.status).toBeTruthy();
    });

    it('met à jour mon profil', async () => {
      const displayName = unique('Atelier mis à jour');
      const profile = await prosApi.updateMyProfile({
        displayName,
        tradeId: 1,
        zoneIds: [1, 2],
        description: 'Description de audit suffisamment longue pour etre valide.',
        yearsExperience: 7,
      });
      expect(profile.displayName).toBe(displayName);
      expect(profile.tradeName).toBe('Plombier');
    });

    it('bascule ma disponibilité', async () => {
      await expect(prosApi.setAvailability(false)).resolves.toBe(false);
      await expect(prosApi.setAvailability(true)).resolves.toBe(true);
    });
  });

  describe('fiche publique', () => {
    it('lit une fiche publiée avec ses photos et sa note', async () => {
      const detail = await prosApi.getPublishedDetail(1);
      expect(detail.profile.displayName).toBeTruthy();
      expect(Array.isArray(detail.photos)).toBe(true);
      expect(detail.rating).toBeDefined();
    });

    it('indique si l’utilisateur peut noter', async () => {
      await expect(prosApi.canReview(1)).resolves.toBe(true);
    });

    it('signale un profil', async () => {
      const report = await prosApi.reportProfessional(2, { reason: 'spam', message: 'Audit.' });
      expect(report.status).toBe('pending');
      expect(report.professionalId).toBe(2);
    });
  });

  describe('photos', () => {
    it('ajoute, renomme puis supprime une photo', async () => {
      const before = await photosApi.listPhotos();
      const added = await photosApi.addPhoto(new Blob(['photo'], { type: 'image/png' }), {
        title: 'Audit',
      });
      expect(added.id).toBeTruthy();
      expect((await photosApi.listPhotos()).length).toBe(before.length + 1);

      const updated = await photosApi.updatePhoto(added.id, { title: 'Audit renommé' });
      expect(updated.title).toBe('Audit renommé');

      await photosApi.deletePhoto(added.id);
      expect((await photosApi.listPhotos()).length).toBe(before.length);
    });
  });

  describe('avis', () => {
    it('liste les avis d’un professionnel avec le résumé', async () => {
      const data = await reviewsApi.listReviews(2, { pageSize: 2 });
      expect(data.items.length).toBeGreaterThan(0);
      expect(data.summary.count).toBeGreaterThan(0);
      expect(data.total).toBe(data.summary.count);
    });

    it('crée un avis', async () => {
      const review = await reviewsApi.createReview(2, { rating: 5, comment: 'Audit.' });
      expect(review.rating).toBe(5);
    });

    it('liste mes avis', async () => {
      const data = await reviewsApi.getMyReviews();
      expect(Array.isArray(data.items)).toBe(true);
      expect(data).toHaveProperty('total');
    });

    it('liste les avis d’un client', async () => {
      const data = await reviewsApi.getClientReviews(902);
      expect(Array.isArray(data.items)).toBe(true);
    });
  });

  describe('contacts et référentiel', () => {
    it('liste mes contacts', async () => {
      const { items, total } = await contactsApi.getMyContacts();
      expect(items.length).toBeGreaterThan(0);
      expect(total).toBeGreaterThan(0);
    });

    it('envoie une demande de contact', async () => {
      const contact = await contactsApi.createContact({
        toUserId: 2,
        message: 'Bonjour, je souhaite un devis pour une rénovation complète.',
      });
      expect(contact.id).toBeTruthy();
      expect(contact.status).toBe('new');
    });

    it('charge les métiers, zones et villes', async () => {
      expect((await referenceApi.listTrades()).length).toBeGreaterThan(0);
      expect((await referenceApi.listZones()).length).toBeGreaterThan(0);
      expect((await referenceApi.listCities()).length).toBeGreaterThan(0);
    });

    it('recherche des professionnels', async () => {
      const results = await searchProfessionals({});
      expect(results.total).toBeGreaterThan(0);
      expect(results.items.length).toBeGreaterThan(0);
    });
  });
});

describe('audit - actions administration', () => {
  describe('statistiques', () => {
    it('renvoie des compteurs numériques', async () => {
      const stats = await adminApi.getStats();
      for (const key of [
        'users',
        'clients',
        'professionals',
        'published',
        'hidden',
        'incomplete',
        'reviews',
        'reviewsHidden',
        'contacts',
        'reportsPending',
        'usersBlocked',
        'usersSuspended',
      ])
        expect(typeof stats[key], key).toBe('number');
      expect(Array.isArray(stats.recentProfessionals)).toBe(true);
    });

    it('tient compte des comptes bloqués et des signalements en attente', async () => {
      const stats = await adminApi.getStats();

      const blocked = await adminApi.listUsers({ blocked: true, pageSize: 200 });
      expect(stats.usersBlocked).toBe(blocked.total);

      const { items } = await adminApi.listReports({ status: 'pending', pageSize: 200 });
      const pending = items.reduce((sum, group) => sum + group.reports.length, 0);
      expect(stats.reportsPending).toBe(pending);
    });
  });

  describe('utilisateurs', () => {
    it('liste chaque compte sous un identifiant unique', async () => {
      const { items, total } = await adminApi.listUsers({ pageSize: 200 });
      expect(total).toBeGreaterThan(0);
      expect(items.length).toBe(total);
      expect(new Set(items.map((u) => u.id)).size).toBe(items.length);
    });

    it('filtre par rôle, par recherche et par statut', async () => {
      const clients = await findByRole('client');
      expect(clients.every((u) => u.role === 'client')).toBe(true);

      const searched = await adminApi.listUsers({ query: clients[0].phone, pageSize: 200 });
      expect(searched.items.some((u) => u.id === clients[0].id)).toBe(true);

      const active = await adminApi.listUsers({ blocked: false, pageSize: 200 });
      expect(active.items.every((u) => !u.blockedAt)).toBe(true);
    });

    it('bloque puis débloque un client', async () => {
      const target = (await findByRole('client')).find(blockable);
      const blocked = await adminApi.setUserBlocked(901, target.id, true);
      expect(blocked.blockedAt).toBeTruthy();

      const blockedIds = (await adminApi.listUsers({ blocked: true, pageSize: 200 })).items.map((u) => u.id);
      expect(blockedIds).toContain(target.id);
      const activeIds = (await adminApi.listUsers({ blocked: false, pageSize: 200 })).items.map((u) => u.id);
      expect(activeIds).not.toContain(target.id);

      await adminApi.setUserBlocked(901, target.id, false);
      const after = (await adminApi.listUsers({ blocked: true, pageSize: 200 })).items.map((u) => u.id);
      expect(after).not.toContain(target.id);
    });

    it('bloque puis débloque un professionnel', async () => {
      const target = (await findByRole('professional'))[0];
      const blocked = await adminApi.setUserBlocked(901, target.id, true);
      expect(blocked.blockedAt).toBeTruthy();

      const blockedIds = (await adminApi.listUsers({ blocked: true, pageSize: 200 })).items.map((u) => u.id);
      expect(blockedIds).toContain(target.id);

      await adminApi.setUserBlocked(901, target.id, false);
      const after = (await adminApi.listUsers({ blocked: true, pageSize: 200 })).items.map((u) => u.id);
      expect(after).not.toContain(target.id);
    });

    it('suspend un professionnel (bloqué + suspendu), puis lève la suspension', async () => {
      const target = (await findByRole('professional'))[1];

      const suspended = await adminApi.setUserSuspended(901, target.id, true);
      expect(suspended.suspendedAt).toBeTruthy();
      expect(suspended.blockedAt).toBeTruthy();

      await adminApi.setUserSuspended(901, target.id, false);
      const blockedIds = (await adminApi.listUsers({ blocked: true, pageSize: 200 })).items.map((u) => u.id);
      expect(blockedIds).not.toContain(target.id);
    });

    it('crée un administrateur qui apparaît dans la liste', async () => {
      const phone = `+2420699${String(Math.floor(Math.random() * 100000)).padStart(5, '0')}`;
      const created = await adminApi.createAdmin({
        firstName: 'Ada',
        lastName: 'Kouba',
        phone,
        password: 'motdepasse',
      });
      expect(created.role).toBe('admin');
      const admins = await findByRole('admin');
      expect(admins.some((u) => u.id === created.id)).toBe(true);
    });

    it('refuse de bloquer son propre compte', async () => {
      const admin = (await findByRole('admin'))[0];
      await expect(adminApi.setUserBlocked(admin.id, admin.id, true)).rejects.toThrow();
      await expect(adminApi.setUserSuspended(admin.id, admin.id, true)).rejects.toThrow();
    });
  });

  describe('professionnels', () => {
    it('masque puis réactive un profil', async () => {
      const published = await adminApi.listPros({ status: 'published', pageSize: 200 });
      const target = published.items[0];
      expect(target).toBeTruthy();

      await adminApi.setProHidden(target.id, true);
      const hidden = await adminApi.listPros({ status: 'hidden', pageSize: 200 });
      expect(hidden.items.some((p) => p.id === target.id)).toBe(true);

      await adminApi.setProHidden(target.id, false);
      const restored = await adminApi.listPros({ status: 'published', pageSize: 200 });
      expect(restored.items.some((p) => p.id === target.id)).toBe(true);
    });
  });

  describe('avis', () => {
    it('masque un avis puis le rétablit', async () => {
      const all = await adminApi.listReviews({ pageSize: 200 });
      expect(all.items.length).toBeGreaterThan(0);
      const target = all.items[0];

      await adminApi.setReviewHidden(target.id, true);
      const hidden = await adminApi.listReviews({ hidden: true, pageSize: 200 });
      expect(hidden.items.some((r) => r.id === target.id)).toBe(true);

      const visible = await adminApi.listReviews({ hidden: false, pageSize: 200 });
      expect(visible.items.some((r) => r.id === target.id)).toBe(false);

      await adminApi.setReviewHidden(target.id, false);
      const restored = await adminApi.listReviews({ hidden: false, pageSize: 200 });
      expect(restored.items.some((r) => r.id === target.id)).toBe(true);
    });
  });

  describe('signalements', () => {
    it('liste les signalements groupés et change leur statut', async () => {
      const { items } = await adminApi.listReports({ pageSize: 50 });
      expect(items.length).toBeGreaterThan(0);
      const group = items[0];
      expect(group.reports.length).toBeGreaterThan(0);

      const target = group.reports[0];
      const updated = await adminApi.setReportStatus(target.id, 'resolved');
      expect(updated.status).toBe('resolved');

      await adminApi.setReportStatus(target.id, 'pending');
    });

    it('débloque un professionnel signalé', async () => {
      const { items } = await adminApi.listReports({ pageSize: 50 });
      const professionalId = items[0].professionalId;
      await adminApi.setUserBlocked(901, professionalId, false);
      const blockedIds = (await adminApi.listUsers({ blocked: true, pageSize: 200 })).items.map((u) => u.id);
      expect(blockedIds).not.toContain(professionalId);
    });
  });

  describe('catalogue - métiers', () => {
    it('crée, renomme, réordonne et supprime un métier', async () => {
      const name = unique('Métier');
      const created = await adminApi.createTrade({ name, categoryId: 1 });
      expect((await adminApi.listTrades()).items.some((t) => t.id === created.id)).toBe(true);

      const renamed = unique('Métier renommé');
      const updated = await adminApi.updateTrade(created.id, { name: renamed, categoryId: 2 });
      expect(updated.name).toBe(renamed);

      await adminApi.reorderTrades([created.id]);
      await adminApi.deleteTrade(created.id);
      expect((await adminApi.listTrades()).items.some((t) => t.id === created.id)).toBe(false);
    });
  });

  describe('catalogue - catégories', () => {
    it('crée, renomme, réordonne et supprime une catégorie', async () => {
      const created = await adminApi.createTradeCategory({ name: unique('Catégorie') });
      await adminApi.updateTradeCategory(created.id, { name: unique('Catégorie renommée') });
      await adminApi.reorderTradeCategories([created.id]);
      await adminApi.deleteTradeCategory(created.id);
      expect((await adminApi.listTradeCategories()).items.some((c) => c.id === created.id)).toBe(false);
    });
  });

  describe('catalogue - villes et arrondissements', () => {
    it('crée, renomme, réordonne et supprime une ville', async () => {
      const created = await adminApi.createCity({ name: unique('Ville') });
      await adminApi.updateCity(created.id, { name: unique('Ville renommée') });
      await adminApi.reorderCities([created.id]);
      await adminApi.deleteCity(created.id);
      expect((await adminApi.listCities()).items.some((c) => c.id === created.id)).toBe(false);
    });

    it('crée, déplace, réordonne et supprime un arrondissement', async () => {
      const [cityA, cityB] = (await adminApi.listCities()).items;
      const created = await adminApi.createZone({ name: unique('Quartier'), cityId: cityA.id });
      await adminApi.updateZone(created.id, { name: unique('Quartier renommé'), cityId: cityB.id });
      await adminApi.reorderZones([created.id]);
      await adminApi.deleteZone(created.id);
      expect((await adminApi.listZones()).items.some((z) => z.id === created.id)).toBe(false);
    });
  });
});
