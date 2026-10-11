import { describe, expect, it } from 'vitest';
import {
  categorySchema,
  citySchema,
  createAdminSchema,
  listProfessionalsQuerySchema,
  listReviewsQuerySchema,
  listUsersQuerySchema,
  reorderSchema,
  tradeItemSchema,
  userBlockedSchema,
  zoneItemSchema,
} from '../server/modules/admin/admin.schemas.js';
import {
  MOCK_CITIES,
  MOCK_TRADES,
  MOCK_TRADE_CATEGORIES,
  MOCK_ZONES,
  mockAdminProfessionals,
  mockAdminUsers,
  mockCreateAdmin,
  mockCreateCity,
  mockCreateTrade,
  mockCreateTradeCategory,
  mockCreateZone,
  mockDeleteCity,
  mockDeleteTradeCategory,
  mockListCities,
  mockListTradeCategories,
  mockListTrades,
  mockListZones,
  mockReorderCities,
  mockReorderTradeCategories,
  mockReorderTrades,
  mockSetUserBlocked,
  mockUpdateTrade,
  mockUpdateTradeCategory,
  mockUpdateZone,
} from '../src/shared/mocks/appMock.js';

describe('admin schemas', () => {
  it('listProfessionalsQuerySchema accepte les filtres optionnels', () => {
    expect(listProfessionalsQuerySchema.safeParse({}).success).toBe(true);
    expect(listProfessionalsQuerySchema.safeParse({ q: 'abel', status: 'published', sort: 'recent' }).success).toBe(true);
    expect(listProfessionalsQuerySchema.safeParse({ status: 'incomplete' }).success).toBe(true);
    expect(listProfessionalsQuerySchema.safeParse({ status: 'inconnu' }).success).toBe(false);
  });

  it('listProfessionalsQuerySchema accepte la ville', () => {
    const parsed = listProfessionalsQuerySchema.safeParse({ city: 'Brazzaville' });
    expect(parsed.success).toBe(true);
    expect(parsed.data.city).toBe('Brazzaville');
    expect(listProfessionalsQuerySchema.safeParse({ city: '' }).data.city).toBeUndefined();
  });

  it('listProfessionalsQuerySchema ignore le filtre pays, retiré', () => {
    // Zod retire les clés inconnues plutôt que de rejeter : `country` ne peut
    // donc plus atteindre le repository.
    const parsed = listProfessionalsQuerySchema.safeParse({ country: 'Congo' });
    expect(parsed.success).toBe(true);
    expect(parsed.data.country).toBeUndefined();
  });

  it('listReviewsQuerySchema convertit le filtre hidden', () => {
    expect(listReviewsQuerySchema.safeParse({}).data.hidden).toBeUndefined();
    expect(listReviewsQuerySchema.safeParse({ hidden: 'true' }).data.hidden).toBe(true);
    expect(listReviewsQuerySchema.safeParse({ hidden: 'false' }).data.hidden).toBe(false);
    expect(listReviewsQuerySchema.safeParse({ q: 'plombier' }).success).toBe(true);
  });

  it('listUsersQuerySchema borne le rôle', () => {
    expect(listUsersQuerySchema.safeParse({ role: 'client' }).success).toBe(true);
    expect(listUsersQuerySchema.safeParse({ role: 'professional' }).success).toBe(true);
    expect(listUsersQuerySchema.safeParse({ role: 'admin' }).success).toBe(true);
    expect(listUsersQuerySchema.safeParse({ role: 'root' }).success).toBe(false);
  });

  it('tradeItemSchema exige un nom non vide', () => {
    expect(tradeItemSchema.safeParse({ name: '  Carreleur  ' }).data.name).toBe('Carreleur');
    expect(tradeItemSchema.safeParse({ name: '' }).success).toBe(false);
    expect(tradeItemSchema.safeParse({}).success).toBe(false);
  });

  it('tradeItemSchema accepte une catégorie optionnelle', () => {
    const parsed = tradeItemSchema.safeParse({ name: 'Carreleur', categoryId: 2 });
    expect(parsed.success).toBe(true);
    expect(parsed.data.categoryId).toBe(2);
    expect(tradeItemSchema.safeParse({ name: 'Carreleur' }).data.categoryId).toBeUndefined();
    expect(tradeItemSchema.safeParse({ name: 'Carreleur', categoryId: 'abc' }).success).toBe(false);
  });

  it('zoneItemSchema valide la ville', () => {
    const parsed = zoneItemSchema.safeParse({ name: 'Makélékélé', cityId: 1 });
    expect(parsed.success).toBe(true);
    expect(parsed.data.cityId).toBe(1);
    expect(zoneItemSchema.safeParse({ name: 'Djiri' }).data.cityId).toBeUndefined();
    expect(zoneItemSchema.safeParse({ name: 'Djiri', cityId: 0 }).success).toBe(false);
  });

  it('categorySchema et citySchema exigent un nom non vide', () => {
    expect(categorySchema.safeParse({ name: '  Menuiserie  ' }).data.name).toBe('Menuiserie');
    expect(citySchema.safeParse({ name: '  Owando  ' }).data.name).toBe('Owando');
    expect(citySchema.safeParse({ name: '   ' }).success).toBe(false);
    expect(categorySchema.safeParse({}).success).toBe(false);
  });

  it('userBlockedSchema exige un booléen', () => {
    expect(userBlockedSchema.safeParse({ blocked: true }).data.blocked).toBe(true);
    expect(userBlockedSchema.safeParse({ blocked: false }).success).toBe(true);
    expect(userBlockedSchema.safeParse({ blocked: 'oui' }).success).toBe(false);
    expect(userBlockedSchema.safeParse({}).success).toBe(false);
  });

  it('createAdminSchema valide les identifiants', () => {
    const base = { firstName: 'Ada', lastName: 'Kopé', phone: '+242061234567', password: 'Motdepasse1' };
    expect(createAdminSchema.safeParse(base).success).toBe(true);
    expect(createAdminSchema.safeParse({ ...base, firstName: '  ' }).success).toBe(false);
    expect(createAdminSchema.safeParse({ ...base, phone: '123' }).success).toBe(false);
    expect(createAdminSchema.safeParse({ ...base, password: 'Court1' }).success).toBe(false);
  });

  it('createAdminSchema exige un nom de personne réel', () => {
    const base = { firstName: 'Ada', lastName: 'Kopé', phone: '+242061234567', password: 'Motdepasse1' };
    // Chiffres et symboles refusés dans un nom de personne.
    expect(createAdminSchema.safeParse({ ...base, firstName: 'Ada123' }).success).toBe(false);
    expect(createAdminSchema.safeParse({ ...base, firstName: '<script>' }).success).toBe(false);
    expect(createAdminSchema.safeParse({ ...base, lastName: '@@@' }).success).toBe(false);
    // Tirets et apostrophes acceptés, accents tolérés.
    expect(createAdminSchema.safeParse({ ...base, firstName: 'Jean-Pierre' }).success).toBe(true);
    expect(createAdminSchema.safeParse({ ...base, lastName: "O'Brien" }).success).toBe(true);
    expect(createAdminSchema.safeParse({ ...base, lastName: 'Kopé' }).success).toBe(true);
  });

  it('reorderSchema exige une liste d’identifiants', () => {
    expect(reorderSchema.safeParse({ ids: [1, 2, 3] }).success).toBe(true);
    expect(reorderSchema.safeParse({ ids: [] }).success).toBe(false);
    expect(reorderSchema.safeParse({ ids: ['2'] }).data.ids).toEqual([2]);
    expect(reorderSchema.safeParse({}).success).toBe(false);
  });
});

describe('admin mock - blocage et administrateurs', () => {
  it('bloque puis débloque un utilisateur', () => {
    const target = mockAdminUsers({ pageSize: 50 }).items.find((u) => u.role === 'client');
    expect(target.blockedAt).toBeNull();

    mockSetUserBlocked(1, target.id, true);
    const blocked = mockAdminUsers({ pageSize: 50 }).items.find((u) => u.id === target.id);
    expect(blocked.blockedAt).not.toBeNull();

    mockSetUserBlocked(1, target.id, false);
    const unblocked = mockAdminUsers({ pageSize: 50 }).items.find((u) => u.id === target.id);
    expect(unblocked.blockedAt).toBeNull();
  });

  it('refuse de bloquer son propre compte', () => {
    const admin = mockAdminUsers({ pageSize: 50 }).items.find((u) => u.role === 'admin');
    expect(() => mockSetUserBlocked(admin.id, admin.id, true)).toThrow();
  });

  it('crée un administrateur et refuse un numéro déjà utilisé', () => {
    const created = mockCreateAdmin({ firstName: 'Ada', lastName: 'Kopé', phone: '+242069999999' });
    expect(created.role).toBe('admin');
    expect(
      mockAdminUsers({ pageSize: 50, role: 'admin' }).items.some((u) => u.phone === '+242069999999'),
    ).toBe(true);
    expect(() => mockCreateAdmin({ firstName: 'Ada', lastName: 'Kopé', phone: '+242069999999' })).toThrow();
  });
});

describe('admin mock - filtres professionnels', () => {
  it('filtre par ville', () => {
    const all = mockAdminProfessionals({ pageSize: 50 });
    expect(all.total).toBeGreaterThan(0);

    // Les profils viennent du catalogue de personas, dont les villes varient.
    // Le filtre doit discriminer sans que le test dépende d'une ville précise :
    // le catalogue est régénérable et sa répartition change.
    const cities = [...new Set(all.items.map((p) => p.city))];
    expect(cities.length).toBeGreaterThan(1);

    for (const city of cities) {
      const filtered = mockAdminProfessionals({ pageSize: 50, city });

      expect(filtered.total).toBeGreaterThan(0);
      expect(filtered.items.every((p) => p.city === city)).toBe(true);
    }

    // Une ville absente du catalogue ne renvoie rien.
    expect(mockAdminProfessionals({ pageSize: 50, city: 'Ville-Inexistante' }).total).toBe(0);
  });

  it('couvre tous les profils par la somme des villes', () => {
    const all = mockAdminProfessionals({ pageSize: 50 });
    const cities = [...new Set(all.items.map((p) => p.city))];

    const covered = cities.reduce(
      (sum, city) => sum + mockAdminProfessionals({ pageSize: 50, city }).total,
      0,
    );

    expect(covered).toBe(all.total);
  });

  it('filtre par statut et trie par nom', () => {
    const published = mockAdminProfessionals({ pageSize: 50, status: 'published' });
    expect(published.items.every((p) => p.status === 'published')).toBe(true);

    const sorted = mockAdminProfessionals({ pageSize: 50, sort: 'name' });
    const names = sorted.items.map((p) => p.displayName);
    expect([...names].sort((a, b) => a.localeCompare(b))).toEqual(names);
  });
});

describe('admin mock - catalogue', () => {
  it('crée un métier dans la catégorie demandée', () => {
    const created = mockCreateTrade({ name: 'Vitrier', categoryId: 3 });
    expect(created.name).toBe('Vitrier');
    expect(created.categoryId).toBe(3);
    const listed = mockListTrades().items.find((t) => t.id === created.id);
    expect(listed.category).toBe('Bois & finitions');
  });

  it('met à jour le nom et la catégorie', () => {
    const [first] = MOCK_TRADES;
    const updated = mockUpdateTrade(first.id, { name: 'Plomberie', categoryId: 4 });
    expect(updated.name).toBe('Plomberie');
    expect(updated.categoryId).toBe(4);
  });

  it('réordonne les métiers selon la liste fournie', () => {
    const ids = MOCK_TRADES.map((t) => t.id);
    mockReorderTrades([...ids].reverse());
    expect(MOCK_TRADES.map((t) => t.id)).toEqual([...ids].reverse());
  });

  it('gère le cycle de vie des catégories', () => {
    const created = mockCreateTradeCategory({ name: 'Menuiserie' });
    expect(mockListTradeCategories().items.some((c) => c.id === created.id)).toBe(true);
    expect(() => mockCreateTradeCategory({ name: 'menuiserie' })).toThrow();

    const renamed = mockUpdateTradeCategory(created.id, { name: 'Menuiserie fine' });
    expect(renamed.name).toBe('Menuiserie fine');

    expect(mockDeleteTradeCategory(created.id)).toEqual({ id: created.id });
  });

  it('refuse de supprimer une catégorie utilisée', () => {
    const used = MOCK_TRADE_CATEGORIES[0];
    expect(() => mockDeleteTradeCategory(used.id)).toThrow();
  });

  it('réordonne les catégories', () => {
    const ids = MOCK_TRADE_CATEGORIES.map((c) => c.id);
    mockReorderTradeCategories([...ids].reverse());
    expect(MOCK_TRADE_CATEGORIES.map((c) => c.id)).toEqual([...ids].reverse());
  });
});

describe('admin mock - villes et arrondissements', () => {
  it('range les arrondissements sous leur ville', () => {
    const cities = mockListCities().items;
    const brazza = cities.find((c) => c.name === 'Brazzaville');
    expect(brazza.zones).toBe(MOCK_ZONES.filter((z) => z.cityId === brazza.id).length);

    const zones = mockListZones().items;
    expect(zones.find((z) => z.name === 'Makélékélé').city).toBe('Brazzaville');
  });

  it('crée un arrondissement dans une ville', () => {
    const brazza = MOCK_CITIES[0];
    const created = mockCreateZone({ name: 'Ndjanvi', cityId: brazza.id });
    expect(created.cityId).toBe(brazza.id);
    expect(mockListZones().items.some((z) => z.id === created.id)).toBe(true);
  });

  it('déplace un arrondissement vers une autre ville', () => {
    const zone = MOCK_ZONES[0];
    const [, other] = MOCK_CITIES;
    const updated = mockUpdateZone(zone.id, { name: zone.name, cityId: other.id });
    expect(updated.cityId).toBe(other.id);
  });

  it('gère le cycle de vie des villes', () => {
    const created = mockCreateCity({ name: 'Impfondo' });
    expect(mockListCities().items.some((c) => c.id === created.id)).toBe(true);
    expect(() => mockCreateCity({ name: 'impfondo' })).toThrow();
    expect(mockDeleteCity(created.id)).toEqual({ id: created.id });
  });

  it('refuse de supprimer une ville qui contient des arrondissements', () => {
    const used = MOCK_CITIES.find((c) => MOCK_ZONES.some((z) => z.cityId === c.id));
    expect(() => mockDeleteCity(used.id)).toThrow();
  });

  it('réordonne les villes', () => {
    const ids = MOCK_CITIES.map((c) => c.id);
    mockReorderCities([...ids].reverse());
    expect(MOCK_CITIES.map((c) => c.id)).toEqual([...ids].reverse());
  });
});
