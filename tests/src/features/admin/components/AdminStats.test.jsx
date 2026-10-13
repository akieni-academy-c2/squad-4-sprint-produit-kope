import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';

/**
 * Vue d'ensemble de l'administration.
 *
 * L'aperçu ne sert à rien s'il ne mène pas au travail en attente : ces tests
 * verrouillent l'ordre (le bloc « À traiter » d'abord), les groupes par thème,
 * et le fait que chaque KPI est un vrai bouton.
 */

vi.mock('@/shared/context/NotificationContext.jsx', () => ({
  useNotification: () => ({ toast: vi.fn() }),
}));
vi.mock('@/shared/context/AuthContext.jsx', () => ({ useAuthContext: () => ({ user: null }) }));

const { AdminOverview } = await import('@/features/admin/components/AdminStats.jsx');
const { AdminReviewsTable } = await import('@/features/admin/components/AdminReviewsTable.jsx');
const { AdminUsersTable } = await import('@/features/admin/components/AdminUsersTable.jsx');

const STATS = {
  users: 42,
  clients: 20,
  professionals: 15,
  published: 9,
  hidden: 2,
  incomplete: 4,
  reviews: 30,
  reviewsHidden: 1,
  ratingAverage: 4.2,
  contacts: 7,
  reportsPending: 3,
  usersBlocked: 4,
  usersSuspended: 1,
  recentProfessionals: [
    {
      id: 3,
      displayName: 'Atelier Kengo',
      trade: 'Menuiserie',
      phone: '+242061234567',
      avatarUrl: null,
      createdAt: '2026-10-01T10:00:00.000Z',
    },
    {
      id: 4,
      displayName: 'Plomberie Kope',
      trade: 'Plombier',
      phone: '+242069876543',
      avatarUrl: null,
      createdAt: '2026-09-28T10:00:00.000Z',
    },
    {
      id: 5,
      displayName: 'Briques du Sud',
      trade: 'Maçon',
      phone: '+242065551234',
      avatarUrl: null,
      createdAt: '2026-09-25T10:00:00.000Z',
    },
    {
      id: 6,
      displayName: 'Cuisine Mabanga',
      trade: 'Ébéniste',
      phone: '+242061112233',
      avatarUrl: null,
      createdAt: '2026-09-22T10:00:00.000Z',
    },
    {
      id: 7,
      displayName: 'Atelier Lumière',
      trade: 'Électricien',
      phone: '+242064445566',
      avatarUrl: null,
      createdAt: '2026-09-19T10:00:00.000Z',
    },
  ],
};

const render = (element) => renderToStaticMarkup(<MemoryRouter>{element}</MemoryRouter>);

describe('Vue d’ensemble - mise en page', () => {
  const html = render(<AdminOverview stats={STATS} />);

  it('met le travail en attente avant les chiffres', () => {
    expect(html.indexOf('À traiter')).toBeLessThan(html.indexOf('Plateforme'));
    expect(html).toContain('Signalements en attente');
    expect(html).toContain('Profils incomplets');
    expect(html).toContain('Avis masqués');
  });

  it('remplace le panneau Qualité par un panneau Clients, sans perdre les autres thèmes', () => {
    expect(html).toContain('Plateforme');
    expect(html).toContain('Modération');
    expect(html).toContain('Clients');
    expect(html).not.toContain('Qualité');
    expect(html).toContain('Avis laissés');
    expect(html).toContain('Demandes de contact');
    expect(html).toContain('Note moyenne');
  });

  it('affiche les nouveaux compteurs de modération', () => {
    // Comptes bloqués (4) et comptes suspendus (1) étaient invisibles avant.
    expect(html).toContain('4');
    expect(html).toContain('Comptes bloqués');
    expect(html).toContain('suspendu');
  });

  it('rend chaque indicateur sous forme de bouton', () => {
    const buttons = html.split('<button type="button"').length - 1;

    // 3 cartes « à traiter » + les KPI cliquables des groupes.
    expect(buttons).toBeGreaterThanOrEqual(10);
  });

  it('calcule le taux de publication', () => {
    expect(html).toContain('60%');
    expect(html).toContain('9 profil');
  });

  it('affiche les quatre derniers professionnels inscrits, en cartes utilisateur', () => {
    const list = html.slice(html.indexOf('Derniers professionnels inscrits'));

    // Quatre items, pas cinq.
    expect(list).toContain('Atelier Kengo');
    expect(list).toContain('Plomberie Kope');
    expect(list).toContain('Briques du Sud');
    expect(list).toContain('Cuisine Mabanga');
    expect(list).not.toContain('Atelier Lumière');
    expect((list.match(/<article /g) || []).length).toBe(4);

    // Carte utilisateur : avatar, métier + téléphone, badge de rôle et date.
    expect(list).toContain('h-10 w-10');
    expect(list).toContain('Menuiserie');
    expect(list).toContain('+242061234567');
    expect(list).toContain('Professionnel');
    expect(list).toContain('Inscrit le');
    expect(list).toContain('aria-label="Voir la fiche publique de Atelier Kengo"');
    expect(list).toContain('Voir tous les professionnels');
  });

  it('ordonne les cartes des derniers inscrits en colonne sur mobile puis en ligne à partir de sm', () => {
    const list = html.slice(html.indexOf('Derniers professionnels inscrits'));

    // Par défaut (mobile) : pile verticale ; à partir de sm : ligne comme avant.
    expect(list).toContain('flex flex-col gap-3');
    expect(list).toContain('sm:flex-row sm:items-center');
    // L'avatar et le bloc badge/date restent alignés à gauche en mobile.
    expect(list).toContain('self-start');
    expect(list).toContain('items-start gap-1 sm:items-end');
  });

  it('laisse les panneaux sans teinte et les cartes de valeur blanches', () => {
    // Les teintes ont été retirées des panneaux : tous les groupes partagent
    // le même style neutre, les cartes de valeur restent blanches.
    expect(html).toContain('border-[#e2e8e5] bg-white');
    expect(html).not.toContain('text-white');
    expect((html.match(/bg-white/g) || []).length).toBeGreaterThan(5);
  });
});

describe('Vue d’ensemble - navigation filtrée', () => {
  it('pré-applique le filtre « avis masqués » sur la modération des avis', () => {
    const html = render(<AdminReviewsTable initialFilters={{ hidden: 'true' }} />);

    expect(html).toContain('Masqués');
  });

  it('pré-applique le filtre « comptes bloqués » sur la liste des utilisateurs', () => {
    const html = render(<AdminUsersTable initialFilters={{ blocked: 'true' }} />);

    expect(html).toContain('Bloqués');
  });
});
