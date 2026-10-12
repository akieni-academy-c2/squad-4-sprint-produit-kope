// Données mock Utilisées quand le backend/DB est indisponible
import what1 from '@/shared/assets/what1.png';
import what2 from '@/shared/assets/what2.png';
import what3 from '@/shared/assets/what3.png';
import user1 from '@/shared/assets/user1.png';
import user2 from '@/shared/assets/user2.png';
import hero from '@/shared/assets/hero.png';
import { personas as PERSONA_DATA } from './personas.json';

const IMAGES = [what1, what2, what3, user1, user2, hero];

/**
 * Identités et portraits de démonstration, générés par `npm run mock:personas`.
 *
 * Le catalogue est figé dans le dépôt : l'application reste déterministe et ne
 * contacte aucun service tiers à l'exécution. Repli sur `FALLBACK_NAMES` si le
 * fichier n'a pas encore été généré.
 */
const PERSONAS = PERSONA_DATA ?? [];

// Palettes des visuels de réalisation : une par quadruple, pour que deux
// professionnels différents n'affichent jamais les mêmes photos.
const WORK_PALETTES = [
  ['#eef4f1', '#2d5c4a'], ['#f7f1e4', '#8b6b2f'], ['#fbeae3', '#a45e3a'],
  ['#e8ecfa', '#3e4c8a'], ['#f1ecf6', '#5b3f7a'], ['#e9f3f6', '#276b7d'],
  ['#f6ece9', '#8c4033'], ['#edf5e8', '#4a7327'], ['#fdf3e0', '#96601a'],
  ['#eaf6f0', '#1f6b57'], ['#f5eef4', '#7a3566'], ['#eef1f7', '#334a72'],
];

/** Visuel de réalisation généré, unique par professionnel et par photo. */
function workImage(proIndex, photoIndex, label) {
  // Pas de 5 (premier avec 12) : les 3 photos d'un même pro jamais la même teinte.
  const [bg, fg] = WORK_PALETTES[(proIndex + photoIndex * 5) % WORK_PALETTES.length];
  const a = 30 + ((proIndex * 17 + photoIndex * 29) % 40);
  const b = 90 + ((proIndex * 11 + photoIndex * 23) % 70);
  const c = 150 + ((proIndex * 7 + photoIndex * 19) % 90);
  const text = String(label || '').slice(0, 22);
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300'>` +
    `<rect width='400' height='300' fill='${bg}'/>` +
    `<rect x='${20 + a}' y='${40 + b / 2}' width='${120 - a / 2}' height='${160 - b / 2}' rx='10' fill='${fg}' opacity='0.75'/>` +
    `<rect x='${170 - a / 3}' y='${70 + c / 3}' width='${190 - a / 3}' height='${120 - c / 4}' rx='10' fill='${fg}' opacity='0.45'/>` +
    `<circle cx='${330 - a}' cy='${250 - b}' r='${26 + (photoIndex % 3) * 8}' fill='${fg}' opacity='0.6'/>` +
    `<text x='20' y='276' font-family='system-ui,sans-serif' font-size='20' font-weight='700' fill='${fg}'>${text}</text>` +
    `</svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export const MOCK_TRADE_CATEGORIES = [
  { id: 1, name: 'Bâtiment & gros œuvre' },
  { id: 2, name: 'Électricité & plomberie' },
  { id: 3, name: 'Bois & finitions' },
  { id: 4, name: 'Services & entretien' },
  { id: 5, name: 'Autre' },
];

export const MOCK_TRADES = [
  { id: 1, name: 'Plombier', categoryId: 2, createdAt: '2025-11-04T09:15:00.000Z' },
  { id: 2, name: 'Électricien', categoryId: 2, createdAt: '2025-12-18T14:40:00.000Z' },
  { id: 3, name: 'Maçon', categoryId: 1, createdAt: '2026-01-22T08:05:00.000Z' },
  { id: 4, name: 'Menuisier', categoryId: 3, createdAt: '2026-02-09T17:30:00.000Z' },
];

export const MOCK_CITIES = [
  { id: 1, name: 'Brazzaville' },
  { id: 2, name: 'Pointe-Noire' },
  { id: 3, name: 'Dolisie' },
  { id: 4, name: 'Nkayi' },
];

export const MOCK_ZONES = [
  { id: 1, name: 'Makélékélé', cityId: 1, createdAt: '2025-10-02T08:00:00.000Z' },
  { id: 2, name: 'Bacongo', cityId: 1, createdAt: '2025-10-02T08:05:00.000Z' },
  { id: 3, name: 'Poto-Poto', cityId: 1, createdAt: '2025-10-02T08:10:00.000Z' },
  { id: 4, name: 'Moungali', cityId: 1, createdAt: '2025-10-02T08:15:00.000Z' },
  { id: 5, name: 'Ouenzé', cityId: 1, createdAt: '2025-10-02T08:20:00.000Z' },
  { id: 6, name: 'Talangaï', cityId: 1, createdAt: '2025-10-02T08:25:00.000Z' },
  { id: 7, name: 'Mfilou', cityId: 1, createdAt: '2025-10-02T08:30:00.000Z' },
  { id: 8, name: 'Madibou', cityId: 1, createdAt: '2025-10-02T08:35:00.000Z' },
  { id: 9, name: 'Djiri', cityId: 1, createdAt: '2025-10-02T08:40:00.000Z' },
  { id: 10, name: 'Koundzi', cityId: 2, createdAt: '2026-01-12T10:00:00.000Z' },
  { id: 11, name: 'Maya-Maya', cityId: 2, createdAt: '2026-01-12T10:10:00.000Z' },
];

/** Repli si le catalogue de personas n'a pas été généré. */
const FALLBACK_NAMES = [
  ['Julien', 'Morel'], ['Thomas', 'Rivière'], ['Sarah', 'Le Goff'],
  ['Moussa', 'Okamba'], ['Amina', 'Itoua'], ['David', 'Malonga'],
  ['Grace', 'Mpassi'], ['Patrick', 'Kengue'], ['Clarisse', 'Loufoua'],
  ['Jean', 'Makaya'], ['Rod', 'Ngoma'], ['Ruth', 'Okou'],
];

/** Source unique d'identités : personas si disponibles, sinon le repli. */
const NAMES = PERSONAS.length
  ? PERSONAS.map((p) => [p.firstName, p.lastName])
  : FALLBACK_NAMES;

const FIRST = NAMES.map(([first]) => first);
const LAST = NAMES.map(([, last]) => last);

function nameAt(offset) {
  return NAMES[((offset % NAMES.length) + NAMES.length) % NAMES.length];
}

/**
 * Répartition des professionnels de démonstration.
 *
 * Les femmes restent minoritaires dans ces métiers — c'est la réalité du
 * terrain — sauf en maçonnerie, où elles sont nombreuses et plutôt jeunes.
 * Le catalogue de personas fournit donc deux réserves distinctes.
 */
const ROSTER = [
  { tradeId: 1, gender: 'male' },
  { tradeId: 2, gender: 'male' },
  { tradeId: 3, gender: 'female' },
  { tradeId: 4, gender: 'male' },
  { tradeId: 1, gender: 'male' },
  { tradeId: 2, gender: 'male' },
  { tradeId: 3, gender: 'female' },
  { tradeId: 4, gender: 'male' },
  { tradeId: 1, gender: 'female' },
  { tradeId: 2, gender: 'male' },
  { tradeId: 3, gender: 'female' },
  { tradeId: 4, gender: 'female' },
];

const MALE_POOL = PERSONAS.filter((p) => p.gender !== 'female');
// Tri par âge : la maçonnerie prend les plus jeunes, les autres métiers
// prennent les premières disponibles.
const FEMALE_POOL = PERSONAS.filter((p) => p.gender === 'female').sort((a, b) => a.age - b.age);

/** Âge d'entrée dans la profession pour un apprenti du bâtiment. */
const CAREER_START = 18;

/**
 * Ancienneté cohérente avec l'âge.
 *
 * Personne ne peut avoir exercé plus longtemps que la durée écoulée depuis
 * ses 18 ans, et un artisan plus âgé a fait une carrière plus longue. La
 * valeur suit donc l'âge — entre 45 et 70 % de la carrière possible, pour que
 * deux professionnels du même âge n'aient pas la même ancienneté.
 */
function careerYears(age, seed) {
  const elapsed = Math.max(0, age - CAREER_START);
  const share = 0.45 + ((seed * 13) % 26) / 100;

  return Math.min(elapsed, Math.round(elapsed * share));
}

/**
 * Visuels de démonstration.
 *
 * Les portraits du service externe sont réalistes mais imposent un appel
 * réseau à chaque affichage. On alterne donc portraits et visuels du projet :
 * la démonstration reste utilisable hors ligne.
 *
 * L'index décale de 2 par professional : sans cela, le pas de 2 sur
 * l'alternance et le pas de 6 sur le stock se synchronisent, et trois visuels
 * seulement reviennent deux fois chacun.
 */
const PORTRAIT_SHARE = 2;

function portraitFor(persona, index) {
  if (persona && index % PORTRAIT_SHARE !== 1) return persona.portrait;
  // Index entier du compteur asset (0, 1, 2…) : les positions asset sont
  // 1, 3, 5… et un index flotté donnerait un accès hors tableau.
  const assetIndex = Math.floor(index / PORTRAIT_SHARE);
  return IMAGES[assetIndex % IMAGES.length];
}

function makePro(i) {
  const slot = ROSTER[i % ROSTER.length];
  const wantsFemale = slot.gender === 'female';
  const pool = wantsFemale ? FEMALE_POOL : MALE_POOL;
  const persona = pool.shift() ?? PERSONAS[i % Math.max(1, PERSONAS.length)] ?? null;
  const [firstName, lastName] = persona
    ? [persona.firstName, persona.lastName]
    : nameAt(i);
  const trade = MOCK_TRADES.find((t) => t.id === slot.tradeId) ?? MOCK_TRADES[i % MOCK_TRADES.length];
  const zoneIds = [(i % MOCK_ZONES.length) + 1, ((i + 3) % MOCK_ZONES.length) + 1];
  const zones = MOCK_ZONES.filter((z) => zoneIds.includes(z.id));
  const ratingCount = (i * 3) % 14;
  const yearsExperience = careerYears(persona?.age ?? 40, i);
  return {
    id: i + 1,
    displayName: persona.fullName || `${firstName} ${lastName}`,
    firstName,
    lastName,
    gender: slot.gender,
    trade: trade.name,
    tradeId: trade.id,
    tradeName: trade.name,
    zones,
    yearsExperience,
    isAvailable: i % 3 !== 0,
    isHidden: false,
    city: persona.city || 'Brazzaville',
    country: 'Congo',
    description:
      'Artisan expérimenté basé à Brazzaville. Devis gratuit, travail soigné et garantie sur les interventions réalisées dans votre quartier.',
    phone: persona.phone || `+24206${String(1000000 + i * 137913).slice(0, 7)}`,
    whatsapp: null,
    image: portraitFor(persona, i),
    avatarUrl: portraitFor(persona, i),
    ratingAverage: ratingCount ? Math.round((3.5 + ((i * 7) % 15) / 10) * 10) / 10 : null,
    ratingCount,
    photos: [0, 1, 2].map((k) => ({
      id: i * 10 + k + 1,
      url: workImage(i, k, trade.name),
      thumbUrl: workImage(i, k, trade.name),
      caption: k === 0 ? 'Chantier récent' : k === 1 ? 'Réalisation' : 'Prestation',
      title: k === 0 ? 'Chantier récent' : k === 1 ? 'Réalisation' : 'Prestation',
      description:
        k === 0
          ? 'Intervention complète réalisée en une journée, avec nettoyage du chantier et contrôle final.'
          : k === 1
            ? 'Prestation réalisée dans les règles de l\'art, client satisfait et recommandation reçue.'
            : 'Installation soignée et mise en service, avec conseils d\'entretien remis au client.',
      createdAt: new Date(Date.now() - (i + k) * 86400000).toISOString(),
    })),
  };
}

export const MOCK_PROS = Array.from({ length: ROSTER.length }, (_, i) => makePro(i));

const REVIEWS_POOL = [
  { rating: 5, comment: 'Un échange clair et une intervention soignée. Julien a pris le temps de m\'expliquer l\'origine de la fuite.' },
  { rating: 5, comment: 'Très bon contact pour le remplacement de ma robinetterie. Travail propre et conseils utiles.' },
  { rating: 4, comment: 'Punctuel, efficace et courtois. Je recommande.' },
  { rating: 5, comment: 'Devis détaillé, respect des délais, résultat impeccable.' },
];

/**
 * Avis masqués par un administrateur, par identifiant.
 *
 * `mockReviewsFor` régénère la liste à chaque lecture : sans ce registre, un
 * avis masqué réapparaîtrait aussitôt et le filtre « Masqués » resterait vide.
 */
const MOCK_HIDDEN_REVIEWS = new Set();

export function mockReviewsFor(proId) {
  return REVIEWS_POOL.map((r, i) => ({
    id: proId * 100 + i,
    rating: r.rating,
    comment: r.comment,
    isHidden: MOCK_HIDDEN_REVIEWS.has(proId * 100 + i),
    createdAt: new Date(Date.now() - (proId + i) * 86400000 * 3).toISOString(),
    client: {
      firstName: FIRST[(proId + i) % FIRST.length],
      lastName: LAST[(proId + i + 2) % LAST.length],
      avatarUrl: IMAGES[(proId + i + 5) % IMAGES.length],
    },
  }));
}

export function mockSetReviewHidden(id, hidden) {
  const numeric = Number(id);
  const belongsToKnownPro = MOCK_PROS.some((p) => Math.floor(numeric / 100) === p.id);
  if (!belongsToKnownPro || numeric % 100 >= REVIEWS_POOL.length)
    throw new Error('Avis introuvable');

  if (hidden) MOCK_HIDDEN_REVIEWS.add(numeric);
  else MOCK_HIDDEN_REVIEWS.delete(numeric);
  return { id: numeric, hidden: Boolean(hidden) };
}

export function toSearchItem(p) {
  return {
    id: p.id,
    displayName: p.displayName,
    trade: p.trade,
    zones: p.zones.map((z) => z.name),
    yearsExperience: p.yearsExperience,
    isAvailable: p.isAvailable,
    rating: { average: p.ratingAverage, count: p.ratingCount },
    image: p.image,
  };
}

export function searchMock({ trade, zone, q, available, minRating, minExperience, page = 1, pageSize = 10 } = {}) {
  let rows = MOCK_PROS.filter((p) => !p.isHidden);
  if (trade) rows = rows.filter((p) => String(p.tradeId) === String(trade));
  if (zone) rows = rows.filter((p) => p.zones.some((z) => String(z.id) === String(zone)));
  if (typeof available === 'boolean') rows = rows.filter((p) => p.isAvailable === available);
  if (minExperience != null) rows = rows.filter((p) => (p.yearsExperience ?? 0) >= Number(minExperience));
  if (minRating != null) rows = rows.filter((p) => (p.ratingAverage ?? 0) >= Number(minRating));
  if (q) {
    const qNorm = String(q).trim().toLowerCase();
    rows = rows.filter((p) =>
      p.displayName.toLowerCase().includes(qNorm) ||
      p.trade.toLowerCase().includes(qNorm) ||
      p.zones.some((z) => z.name.toLowerCase().includes(qNorm)),
    );
  }
  rows = [...rows].sort((a, b) => Number(b.isAvailable) - Number(a.isAvailable) || (b.ratingAverage ?? 0) - (a.ratingAverage ?? 0));
  const total = rows.length;
  const items = rows.slice((page - 1) * pageSize, page * pageSize).map(toSearchItem);
  return { items, total, page, pageSize };
}

export function getProDetailMock(id) {
  const p = MOCK_PROS.find((x) => String(x.id) === String(id));
  if (!p) return null;
  const tagsByTrade = {
    1: ['Recherche de fuites', 'Robinetterie', 'Salle de bains'],
    2: ['Installation de tableaux', 'Mise en sécurité', 'Luminaires'],
    3: ['Béton', 'Fondations', 'Ravalement'],
    4: ['Menuiseries sur mesure', 'Rangements', 'Volets'],
  };
  return {
    profile: {
      id: p.id,
      displayName: p.displayName,
      trade: { id: p.tradeId, name: p.tradeName },
      description: p.description,
      yearsExperience: p.yearsExperience,
      isAvailable: p.isAvailable,
      phone: p.phone,
      avatarUrl: p.avatarUrl,
      whatsapp: p.whatsapp ?? p.phone,
      zones: p.zones,
      tags: tagsByTrade[p.tradeId] ?? [],
      createdAt: new Date(Date.now() - (p.id + 2) * 86400000 * 11).toISOString(),
      updatedAt: new Date(Date.now() - p.id * 86400000).toISOString(),
    },
    photos: p.photos,
    rating: { average: p.ratingAverage ?? 0, count: p.ratingCount },
  };
}

// ---------- Contacts mock ----------

/**
 * Contacts du client : une ligne par contact pris, canal compris.
 *
 * Le même professionnel apparaît deux fois (9003 et 9004) — un appel puis un
 * WhatsApp. C'est le cas normal : la contrainte d'unicité sur la paire a été
 * levée en migration, et le regroupement par professionnel s'appuie dessus.
 */
let MOCK_MY_CONTACTS = [
  {
    id: 9001,
    channel: 'message',
    message: 'Bonjour, je recherche un devis pour une rénovation de salle de bain.',
    status: 'new',
    outgoing: false,
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    userId: 42,
    role: 'client',
    phone: '+242061234567',
    avatarUrl: null,
    firstName: 'Abel',
    lastName: 'Bouanga',
    displayName: 'Abel Bouanga',
    tradeName: null,
  },
  {
    id: 9002,
    channel: 'call',
    message: null,
    status: 'seen',
    outgoing: true,
    createdAt: new Date(Date.now() - 9 * 86400000).toISOString(),
    userId: 7,
    role: 'professional',
    phone: '+242069876543',
    avatarUrl: null,
    firstName: null,
    lastName: null,
    displayName: 'Atelier Kengo',
    tradeName: 'Menuiserie',
  },
  {
    id: 9003,
    channel: 'call',
    message: null,
    status: 'seen',
    outgoing: true,
    createdAt: new Date(Date.now() - 21 * 86400000).toISOString(),
    userId: 8,
    role: 'professional',
    phone: '+242061112233',
    avatarUrl: null,
    firstName: null,
    lastName: null,
    displayName: 'Dépannage Express',
    tradeName: 'Plomberie',
  },
  {
    id: 9004,
    channel: 'whatsapp',
    message: null,
    status: 'seen',
    outgoing: true,
    createdAt: new Date(Date.now() - 47 * 86400000).toISOString(),
    userId: 8,
    role: 'professional',
    phone: '+242061112233',
    avatarUrl: null,
    firstName: null,
    lastName: null,
    displayName: 'Dépannage Express',
    tradeName: 'Plomberie',
  },
  {
    id: 9005,
    channel: 'call',
    message: null,
    status: 'seen',
    outgoing: true,
    createdAt: new Date(Date.now() - 63 * 86400000).toISOString(),
    userId: 9,
    role: 'professional',
    phone: '+242065554433',
    avatarUrl: null,
    firstName: null,
    lastName: null,
    displayName: 'Atelier Kengo',
    tradeName: 'Menuiserie',
  },
];

export function mockMyContacts({ page = 1, pageSize = 20 } = {}) {
  return paginateMock(MOCK_MY_CONTACTS, page, pageSize);
}

/** Un clic sur Appeler ou WhatsApp ajoute une ligne, comme le serveur. */
export function mockLogContact(toUserId, channel) {
  const counterpart = MOCK_MY_CONTACTS.find((c) => String(c.userId) === String(toUserId));
  MOCK_MY_CONTACTS = [
    {
      ...(counterpart ?? { userId: toUserId, displayName: 'Contact', role: 'professional', tradeName: null }),
      id: 9100 + MOCK_MY_CONTACTS.length,
      channel,
      message: null,
      status: 'seen',
      outgoing: true,
      createdAt: new Date().toISOString(),
    },
    ...MOCK_MY_CONTACTS,
  ];
  return null;
}

// ---------- Admin mock ----------

const MOCK_CLIENTS = Array.from({ length: 6 }, (_, i) => ({
  id: 100 + i,
  role: 'client',
  firstName: FIRST[(i + 2) % FIRST.length],
  lastName: LAST[(i + 5) % LAST.length],
  displayName: null,
  avatarUrl: i % 2 ? null : IMAGES[(i + 2) % IMAGES.length],
  phone: `+24206${String(5000000 + i * 321654).slice(0, 7)}`,
  createdAt: new Date(Date.now() - (i + 1) * 86400000 * 5).toISOString(),
  blockedAt: null,
}));

function paginateMock(items, page = 1, pageSize = 20) {
  const start = (page - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    total: items.length,
    page,
    pageSize,
    totalPages: Math.ceil(items.length / pageSize) || 1,
  };
}

function proStatus(p) {
  if (p.isHidden) return 'hidden';
  const complete = p.description && p.zones?.length && p.photos?.length;
  return complete ? 'published' : 'incomplete';
}

export function mockAdminProfessionals({ page = 1, pageSize = 20, query = '', status, sort, city } = {}) {
  const q = String(query || '').trim().toLowerCase();
  let rows = MOCK_PROS.map((p) => ({
    id: p.id,
    displayName: p.displayName,
    trade: p.trade,
    phone: p.phone,
    avatarUrl: p.avatarUrl,
    city: p.city,
    country: p.country,
    status: proStatus(p),
    createdAt: new Date(Date.now() - (p.id + 1) * 86400000).toISOString(),
  }));
  if (q) rows = rows.filter((p) => p.displayName.toLowerCase().includes(q) || (p.trade || '').toLowerCase().includes(q) || p.phone.includes(q));
  if (status) rows = rows.filter((p) => p.status === status);
  if (city) rows = rows.filter((p) => p.city === city);
  rows = [...rows].sort((a, b) =>
    sort === 'recent'
      ? new Date(b.createdAt) - new Date(a.createdAt)
      : a.displayName.localeCompare(b.displayName),
  );
  return paginateMock(rows, page, pageSize);
}

const MOCK_REPORTERS = [
  { id: 901, firstName: 'Nadeige', lastName: 'B.', avatarUrl: null },
  { id: 902, firstName: 'Herve', lastName: 'M.', avatarUrl: null },
  { id: 903, firstName: 'Chantal', lastName: 'K.', avatarUrl: null },
];

let MOCK_REPORTS = [
  {
    id: 1,
    professionalId: MOCK_PROS[2].id,
    reporterId: MOCK_REPORTERS[0].id,
    reason: 'fake_profile',
    message: 'Les photos de cette fiche ne correspondent pas du tout au métier annoncé.',
    status: 'pending',
    resolvedAt: null,
    createdAt: '2026-09-28T09:12:00.000Z',
    reporter: MOCK_REPORTERS[0],
  },
  {
    id: 2,
    professionalId: MOCK_PROS[5].id,
    reporterId: MOCK_REPORTERS[1].id,
    reason: 'spam',
    message: 'Envoie des messages promotionnels dès la prise de contact.',
    status: 'pending',
    resolvedAt: null,
    createdAt: '2026-09-24T16:40:00.000Z',
    reporter: MOCK_REPORTERS[1],
  },
  {
    id: 3,
    professionalId: MOCK_PROS[1].id,
    reporterId: MOCK_REPORTERS[2].id,
    reason: 'other',
    message: 'Informations professionnelles incomplètes.',
    status: 'resolved',
    resolvedAt: '2026-09-20T11:05:00.000Z',
    createdAt: '2026-09-18T08:30:00.000Z',
    reporter: MOCK_REPORTERS[2],
  },
];

const withProName = (r) => {
  const pro = MOCK_PROS.find((p) => String(p.id) === String(r.professionalId));
  return {
    ...r,
    professionalName: pro?.displayName ?? `Pro #${r.professionalId}`,
    professionalAvatarUrl: pro?.avatarUrl ?? null,
    professionalBlockedAt: pro?.blockedAt ?? null,
    professionalSuspendedAt: pro?.suspendedAt ?? null,
  };
};

// ---------- Compte client mock ----------
//
// Ce que voit le client connecté en démo. Les listes sont mutables : corriger,
// masquer ou retirer un avis doit tenir jusqu'au rechargement, sinon la
// démonstration d'une action ne montre rien. Placé après `MOCK_REPORTS`,
// `withProName` et `paginateMock`, tous deux déclarés plus haut.

/** Avis déposés par le client. */
let MOCK_MY_REVIEWS = [
  {
    id: 8001,
    professionalId: MOCK_PROS[0].id,
    professionalName: MOCK_PROS[0].displayName,
    rating: 5,
    comment: REVIEWS_POOL[0].comment,
    isHidden: false,
    createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
  },
  {
    id: 8002,
    professionalId: MOCK_PROS[1].id,
    professionalName: MOCK_PROS[1].displayName,
    rating: 4,
    comment: REVIEWS_POOL[2].comment,
    isHidden: false,
    createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
  },
  {
    id: 8003,
    professionalId: MOCK_PROS[2].id,
    professionalName: MOCK_PROS[2].displayName,
    rating: 3,
    comment: 'Le travail est correct mais le rendez-vous a été repoussé deux fois.',
    // Présent dès l'ouverture : le filtre « Masqués seulement » a du contenu.
    isHidden: true,
    createdAt: new Date(Date.now() - 40 * 86400000).toISOString(),
  },
];

const MY_REVIEWS_VISIBILITY = {
  visible: (r) => !r.isHidden,
  hidden: (r) => r.isHidden,
  all: () => true,
};

export function mockMyReviews({ page = 1, pageSize = 20, q, rating, visibility = 'all' } = {}) {
  const needle = String(q || '').trim().toLowerCase();
  let rows = MOCK_MY_REVIEWS.filter(MY_REVIEWS_VISIBILITY[visibility] ?? MY_REVIEWS_VISIBILITY.all);

  if (rating) rows = rows.filter((r) => String(r.rating) === String(rating));
  if (needle)
    rows = rows.filter(
      (r) =>
        r.professionalName.toLowerCase().includes(needle) ||
        (r.comment || '').toLowerCase().includes(needle),
    );

  return paginateMock(rows, page, pageSize);
}

export function mockUpdateMyReview(id, { rating, comment }) {
  const review = MOCK_MY_REVIEWS.find((r) => String(r.id) === String(id));
  if (!review) throw new Error('Avis introuvable');
  review.rating = rating;
  review.comment = comment;
  return review;
}

export function mockSetMyReviewHidden(id, isHidden) {
  const review = MOCK_MY_REVIEWS.find((r) => String(r.id) === String(id));
  if (!review) throw new Error('Avis introuvable');
  review.isHidden = Boolean(isHidden);
  return review;
}

export function mockDeleteMyReview(id) {
  const before = MOCK_MY_REVIEWS.length;
  MOCK_MY_REVIEWS = MOCK_MY_REVIEWS.filter((r) => String(r.id) !== String(id));
  if (MOCK_MY_REVIEWS.length === before) throw new Error('Avis introuvable');
  return null;
}

/** Signalements du client : les mêmes lignes que l'administration reçoit. */
export function mockMyReports({ page = 1, pageSize = 20, q, status } = {}) {
  const needle = String(q || '').trim().toLowerCase();
  let rows = MOCK_REPORTS.map(withProName);

  if (status) rows = rows.filter((r) => r.status === status);
  if (needle)
    rows = rows.filter(
      (r) =>
        r.professionalName.toLowerCase().includes(needle) ||
        (r.message || '').toLowerCase().includes(needle),
    );

  return paginateMock(rows, page, pageSize);
}

export function mockDeleteMyReport(id) {
  const target = MOCK_REPORTS.find((r) => String(r.id) === String(id));
  // Même refus que le serveur : un signalement traité n'est pas retirable.
  if (!target || target.status !== 'pending') throw new Error('Signalement introuvable');
  MOCK_REPORTS = MOCK_REPORTS.filter((r) => String(r.id) !== String(id));
  return null;
}

export const MOCK_AUTO_BLOCK_THRESHOLD = 3;
export const MOCK_AUTO_SUSPEND_THRESHOLD = 5;

export function mockReportProfessional({ professionalId, reporterId = 901, reason, message = null }) {
  const pro = MOCK_PROS.find((p) => String(p.id) === String(professionalId));
  if (!pro) throw new Error('Profil introuvable');
  if (String(pro.id) === String(reporterId)) throw new Error('Vous ne pouvez pas signaler votre propre profil');
  if (MOCK_REPORTS.some((r) => String(r.professionalId) === String(pro.id) && String(r.reporterId) === String(reporterId)))
    throw new Error('Vous avez déjà signalé ce profil');

  const created = {
    id: Math.max(0, ...MOCK_REPORTS.map((r) => r.id)) + 1,
    professionalId: pro.id,
    reporterId: Number(reporterId),
    reason,
    message: message || null,
    status: 'pending',
    resolvedAt: null,
    createdAt: new Date().toISOString(),
    reporter: MOCK_REPORTERS.find((u) => String(u.id) === String(reporterId)) ?? {
      id: Number(reporterId),
      firstName: 'Client',
      lastName: '',
      avatarUrl: null,
    },
  };
  MOCK_REPORTS = [created, ...MOCK_REPORTS];

  // Traitement automatique au seuil, comme le service serveur.
  const reportCount = MOCK_REPORTS.filter((r) => String(r.professionalId) === String(pro.id)).length;
  const autoBlocked = MOCK_AUTO_BLOCK_THRESHOLD > 0 && reportCount >= MOCK_AUTO_BLOCK_THRESHOLD;
  const autoSuspended = MOCK_AUTO_SUSPEND_THRESHOLD > 0 && reportCount >= MOCK_AUTO_SUSPEND_THRESHOLD;
  if (autoBlocked) pro.blockedAt = pro.blockedAt || new Date().toISOString();
  if (autoSuspended) pro.suspendedAt = pro.suspendedAt || new Date().toISOString();

  return { ...withProName(created), reportCount, autoBlocked, autoSuspended };
}

export function mockAdminReports({ page = 1, pageSize = 20, status, query = '' } = {}) {
  const q = String(query || '').trim().toLowerCase();
  let rows = MOCK_REPORTS.map(withProName);
  if (status) rows = rows.filter((r) => r.status === status);
  if (q)
    rows = rows.filter((r) => {
      const reporter = `${r.reporter?.firstName || ''} ${r.reporter?.lastName || ''}`.toLowerCase();
      return (
        (r.professionalName || '').toLowerCase().includes(q) ||
        String(r.message || '').toLowerCase().includes(q) ||
        reporter.includes(q)
      );
    });

  // Regroupement par professionnel : un seul item par profil signalé.
  const groups = [...rows.reduce((acc, r) => acc.set(String(r.professionalId), [...(acc.get(String(r.professionalId)) || []), r]), new Map()).entries()]
    .map(([professionalId, reports]) => {
      const sorted = [...reports].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      const pendingCount = sorted.filter((r) => r.status === 'pending').length;
      return {
        professionalId: Number(professionalId),
        professionalName: sorted[0].professionalName,
        professionalAvatarUrl: sorted[0].professionalAvatarUrl,
        professionalBlockedAt: sorted[0].professionalBlockedAt,
        professionalSuspendedAt: sorted[0].professionalSuspendedAt,
        reportCount: sorted.length,
        pendingCount,
        latestAt: sorted[0].createdAt,
        reports: sorted,
      };
    })
    .sort(
      (a, b) => b.pendingCount - a.pendingCount || new Date(b.latestAt) - new Date(a.latestAt),
    );

  return paginateMock(groups, page, pageSize);
}

export function mockResolveReport(id, status) {
  const report = MOCK_REPORTS.find((r) => String(r.id) === String(id));
  if (!report) throw new Error('Signalement introuvable');
  report.status = status;
  report.resolvedAt = new Date().toISOString();
  return withProName(report);
}

export function mockAdminReviews({ page = 1, pageSize = 20, hidden, query = '' } = {}) {
  const q = String(query || '').trim().toLowerCase();
  let all = MOCK_PROS.flatMap((p) =>
    mockReviewsFor(p.id).map((r) => ({
      ...r,
      professional: {
        id: p.id,
        displayName: p.displayName,
        firstName: p.firstName,
        lastName: p.lastName,
        avatarUrl: p.avatarUrl,
      },
    })),
  );
  if (typeof hidden === 'boolean') all = all.filter((r) => r.isHidden === hidden);
  if (q) {
    const rows = all.filter((r) => {
      const client = `${r.client?.firstName || ''} ${r.client?.lastName || ''}`.toLowerCase();
      return (
        client.includes(q) ||
        (r.professional?.displayName || '').toLowerCase().includes(q) ||
        String(r.comment || '').toLowerCase().includes(q)
      );
    });
    return paginateMock(rows, page, pageSize);
  }
  return paginateMock(all, page, pageSize);
}

const MOCK_ADMINS = [
  {
    // 901 et non 1 : les professionnels occupent déjà les identifiants 1..N et
    // deux comptes de même identifiant rendaient le blocage ambigu (l'action
    // visait l'administrateur au lieu du professionnel).
    id: 901,
    role: 'admin',
    firstName: 'Admin',
    lastName: 'Kopé',
    displayName: null,
    phone: '+242060000000',
    avatarUrl: null,
    createdAt: new Date(Date.now() - 365 * 86400000).toISOString(),
    blockedAt: null,
  },
];

export function mockAdminUsers({ page = 1, pageSize = 20, role, query = '', blocked } = {}) {
  const pros = MOCK_PROS.map((p) => ({
    id: p.id,
    role: 'professional',
    firstName: null,
    lastName: null,
    displayName: p.displayName,
    avatarUrl: p.avatarUrl,
    phone: p.phone,
    createdAt: new Date(Date.now() - (p.id + 1) * 86400000 * 3).toISOString(),
    // Lu sur le professionnel : un compte bloqué (à la main ou par le seuil de
    // signalements) doit apparaître bloqué dans la liste des utilisateurs.
    blockedAt: p.blockedAt ?? null,
  }));
  let rows = [...pros, ...MOCK_CLIENTS, ...MOCK_ADMINS].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  );
  const q = String(query || '').trim().toLowerCase();
  if (role) rows = rows.filter((u) => u.role === role);
  if (typeof blocked === 'boolean') rows = rows.filter((u) => Boolean(u.blockedAt) === blocked);
  if (q)
    rows = rows.filter((u) =>
      [u.firstName, u.lastName, u.displayName, u.phone].filter(Boolean).some((v) => String(v).toLowerCase().includes(q)),
    );
  return paginateMock(rows, page, pageSize);
}

function findMockUser(id) {
  const target = Number(id);
  if (MOCK_ADMINS.some((u) => u.id === target)) return MOCK_ADMINS.find((u) => u.id === target);
  const pro = MOCK_PROS.find((p) => p.id === target);
  if (pro) return { ...pro, firstName: null, lastName: null, role: 'professional' };
  const client = MOCK_CLIENTS.find((c) => c.id === target);
  return client ? { ...client, role: 'client' } : null;
}

export function mockSetUserBlocked(actorId, id, blocked) {
  if (Number(actorId) === Number(id)) throw new Error('Vous ne pouvez pas bloquer votre propre compte');
  const user = findMockUser(id);
  if (!user) throw new Error('Utilisateur introuvable');

  // `findMockUser` renvoie une copie pour un professionnel : l'écriture doit
  // viser la collection d'origine, sinon le blocage est perdu au rechargement.
  const store = user.role === 'admin' ? MOCK_ADMINS : user.role === 'client' ? MOCK_CLIENTS : MOCK_PROS;
  const target = store.find((u) => u.id === Number(id));
  if (!target) throw new Error('Utilisateur introuvable');

  if (blocked && user.role === 'admin') {
    const others = MOCK_ADMINS.filter((a) => a.id !== Number(id) && !a.blockedAt);
    if (others.length === 0) throw new Error('Impossible de bloquer le dernier administrateur actif');
  }
  target.blockedAt = blocked ? new Date().toISOString() : null;
  return { id: Number(id), role: user.role, blockedAt: target.blockedAt };
}

export function mockSetUserSuspended(actorId, id, suspended) {
  if (Number(actorId) === Number(id)) throw new Error('Vous ne pouvez pas suspendre votre propre compte');
  const user = findMockUser(id);
  if (!user) throw new Error('Utilisateur introuvable');

  const store = user.role === 'admin' ? MOCK_ADMINS : user.role === 'client' ? MOCK_CLIENTS : MOCK_PROS;
  const target = store.find((u) => u.id === Number(id));
  if (!target) throw new Error('Utilisateur introuvable');

  // Le serveur suspend ET bloque : une suspension implique la perte d'accès,
  // et la lever redonne l'accès.
  target.suspendedAt = suspended ? new Date().toISOString() : null;
  target.blockedAt = suspended ? new Date().toISOString() : null;
  return { id: Number(id), role: user.role, blockedAt: target.blockedAt, suspendedAt: target.suspendedAt };
}

export function mockCreateAdmin({ firstName, lastName, phone }) {
  const clean = String(phone || '').trim();
  const exists =
    MOCK_ADMINS.some((a) => a.phone === clean) ||
    MOCK_CLIENTS.some((c) => c.phone === clean) ||
    MOCK_PROS.some((p) => p.phone === clean);
  if (exists) throw new Error('Ce numéro est déjà utilisé');

  const id = Math.max(0, ...MOCK_ADMINS.map((a) => a.id)) + 500;
  const created = {
    id,
    role: 'admin',
    firstName: String(firstName || '').trim(),
    lastName: String(lastName || '').trim(),
    displayName: null,
    phone: clean,
    avatarUrl: null,
    createdAt: new Date().toISOString(),
    blockedAt: null,
  };
  MOCK_ADMINS.push(created);
  return created;
}

export function mockAdminStats() {  const published = MOCK_PROS.filter((p) => proStatus(p) === 'published').length;
  const hidden = MOCK_PROS.filter((p) => p.isHidden).length;
  const incomplete = MOCK_PROS.length - published - hidden;
  const reviews = MOCK_PROS.flatMap((p) => mockReviewsFor(p.id));
  const ratings = reviews.filter((r) => !r.isHidden).map((r) => r.rating);
  const ratingAverage = ratings.length
    ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10
    : 0;
  return {
    users: MOCK_PROS.length + MOCK_CLIENTS.length + 1,
    clients: MOCK_CLIENTS.length,
    professionals: MOCK_PROS.length,
    published,
    hidden,
    incomplete,
    reviews: reviews.length,
    reviewsHidden: reviews.filter((r) => r.isHidden).length,
    ratingAverage,
    contacts: 2,
    reportsPending: MOCK_REPORTS.filter((r) => r.status === 'pending').length,
    usersBlocked: [MOCK_PROS, MOCK_CLIENTS, MOCK_ADMINS].flat().filter((u) => u.blockedAt).length,
    usersSuspended: [MOCK_PROS, MOCK_CLIENTS, MOCK_ADMINS].flat().filter((u) => u.suspendedAt).length,
    recentProfessionals: [...MOCK_PROS]
      .slice(-5)
      .reverse()
      .map((p) => ({
        id: p.id,
        displayName: p.displayName,
        trade: p.trade,
        phone: p.phone,
        avatarUrl: p.avatarUrl,
        createdAt: new Date(Date.now() - p.id * 86400000).toISOString(),
      })),
  };
}

export function mockListTrades() {
  return {
    items: MOCK_TRADES.map((t) => ({
      ...t,
      category: MOCK_TRADE_CATEGORIES.find((c) => c.id === t.categoryId)?.name ?? null,
      professionals: MOCK_PROS.filter((p) => p.tradeId === t.id).length,
    })),
  };
}

export function mockListTradeCategories() {
  return {
    items: MOCK_TRADE_CATEGORIES.map((c) => ({
      ...c,
      trades: MOCK_TRADES.filter((t) => t.categoryId === c.id).length,
    })),
  };
}

export function mockCreateTradeCategory(payload) {
  const { name } = payload || {};
  const clean = String(name || '').trim();
  if (MOCK_TRADE_CATEGORIES.some((c) => c.name.toLowerCase() === clean.toLowerCase()))
    throw new Error('Cette catégorie existe déjà');
  const id = Math.max(0, ...MOCK_TRADE_CATEGORIES.map((c) => c.id)) + 1;
  const item = { id, name: clean, trades: 0 };
  MOCK_TRADE_CATEGORIES.push({ id, name: clean });
  return item;
}

export function mockUpdateTradeCategory(id, payload) {
  const { name } = payload || {};
  const category = MOCK_TRADE_CATEGORIES.find((c) => c.id === Number(id));
  if (!category) throw new Error('Catégorie introuvable');
  if (name != null) category.name = String(name).trim();
  return { id: category.id, name: category.name };
}

export function mockDeleteTradeCategory(id) {
  const target = Number(id);
  if (MOCK_TRADES.some((t) => t.categoryId === target))
    throw new Error('Déplacez les métiers de cette catégorie avant de la supprimer');
  const index = MOCK_TRADE_CATEGORIES.findIndex((c) => c.id === target);
  if (index < 0) throw new Error('Catégorie introuvable');
  MOCK_TRADE_CATEGORIES.splice(index, 1);
  return { id: target };
}

export function mockReorderTradeCategories(ids) {
  const order = ids.map(Number);
  MOCK_TRADE_CATEGORIES.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
  return { ids: order };
}

export function mockCreateTrade(payload) {
  const { name, categoryId = null } = payload || {};
  const clean = String(name || '').trim();
  if (MOCK_TRADES.some((t) => t.name.toLowerCase() === clean.toLowerCase()))
    throw new Error('Ce métier existe déjà');
  const id = Math.max(0, ...MOCK_TRADES.map((t) => t.id)) + 1;
  const createdAt = new Date().toISOString();
  const item = { id, name: clean, categoryId: categoryId == null ? null : Number(categoryId), createdAt, professionals: 0 };
  MOCK_TRADES.push({ id, name: item.name, categoryId: item.categoryId, createdAt });
  return item;
}

export function mockUpdateTrade(id, payload) {
  const { name, categoryId } = payload || {};
  const trade = MOCK_TRADES.find((t) => t.id === Number(id));
  if (!trade) throw new Error('Métier introuvable');
  if (name != null) trade.name = String(name).trim();
  if (categoryId !== undefined) trade.categoryId = categoryId == null ? null : Number(categoryId);
  return { id: trade.id, name: trade.name, categoryId: trade.categoryId };
}

export function mockReorderTrades(ids) {
  const order = ids.map(Number);
  MOCK_TRADES.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
  return { ids: order };
}

export function mockDeleteTrade(id) {
  const target = Number(id);
  if (MOCK_PROS.some((p) => p.tradeId === target))
    throw new Error('Ce métier est utilisé par des professionnels');
  const index = MOCK_TRADES.findIndex((t) => t.id === target);
  if (index < 0) throw new Error('Métier introuvable');
  MOCK_TRADES.splice(index, 1);
  return { id };
}

export function mockListZones() {
  return {
    items: MOCK_ZONES.map((z) => ({
      ...z,
      city: MOCK_CITIES.find((c) => c.id === z.cityId)?.name ?? null,
      professionals: MOCK_PROS.filter((p) => p.zones.some((z2) => z2.id === z.id)).length,
    })),
  };
}

export function mockListCities() {
  return {
    items: MOCK_CITIES.map((c) => ({
      ...c,
      zones: MOCK_ZONES.filter((z) => z.cityId === c.id).length,
    })),
  };
}

export function mockCreateCity(payload) {
  const { name } = payload || {};
  const clean = String(name || '').trim();
  if (MOCK_CITIES.some((c) => c.name.toLowerCase() === clean.toLowerCase()))
    throw new Error('Cette ville existe déjà');
  const id = Math.max(0, ...MOCK_CITIES.map((c) => c.id)) + 1;
  MOCK_CITIES.push({ id, name: clean });
  return { id, name: clean, zones: 0 };
}

export function mockUpdateCity(id, payload) {
  const { name } = payload || {};
  const city = MOCK_CITIES.find((c) => c.id === Number(id));
  if (!city) throw new Error('Ville introuvable');
  if (name != null) city.name = String(name).trim();
  return { id: city.id, name: city.name };
}

export function mockDeleteCity(id) {
  const target = Number(id);
  if (MOCK_ZONES.some((z) => z.cityId === target))
    throw new Error('Déplacez les arrondissements de cette ville avant de la supprimer');
  const index = MOCK_CITIES.findIndex((c) => c.id === target);
  if (index < 0) throw new Error('Ville introuvable');
  MOCK_CITIES.splice(index, 1);
  return { id: target };
}

export function mockReorderCities(ids) {
  const order = ids.map(Number);
  MOCK_CITIES.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
  return { ids: order };
}

export function mockCreateZone(payload) {
  const { name, cityId = null } = payload || {};
  const clean = String(name || '').trim();
  if (MOCK_ZONES.some((z) => z.name.toLowerCase() === clean.toLowerCase()))
    throw new Error('Cette zone existe déjà');
  const id = Math.max(0, ...MOCK_ZONES.map((z) => z.id)) + 1;
  const createdAt = new Date().toISOString();
  const item = {
    id,
    name: clean,
    cityId: cityId == null ? null : Number(cityId),
    createdAt,
  };
  MOCK_ZONES.push(item);
  return { ...item };
}

export function mockUpdateZone(id, payload) {
  const { name, cityId } = payload || {};
  const zone = MOCK_ZONES.find((z) => z.id === Number(id));
  if (!zone) throw new Error('Zone introuvable');
  if (name != null) zone.name = String(name).trim();
  if (cityId !== undefined) zone.cityId = cityId == null ? null : Number(cityId);
  return { id: zone.id, name: zone.name, cityId: zone.cityId };
}

export function mockReorderZones(ids) {
  const order = ids.map(Number);
  MOCK_ZONES.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
  return { ids: order };
}

export function mockDeleteZone(id) {
  const numeric = Number(id);
  if (MOCK_PROS.some((p) => p.zones?.some((z) => z.id === numeric)))
    throw new Error('Cette zone est utilisée par des professionnels');
  const index = MOCK_ZONES.findIndex((z) => z.id === numeric);
  if (index < 0) throw new Error('Zone introuvable');
  MOCK_ZONES.splice(index, 1);
  return { id: numeric };
}

// ---------- Session mock  ----------

const SESSION_KEY = 'kop_demo_user';

export function getDemoUser() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setDemoUser(user) {
  try {
    if (user) localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    else localStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
}
