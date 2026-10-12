import { useMemo, useState } from 'react';
import { Phone, Users } from 'lucide-react';
import { useAsyncData } from '@/shared/hooks/useAsyncData.js';
import { getMyContacts } from '../services/contacts.service.js';
import { Card } from '@/shared/components/ui/Card.jsx';
import { CustomSelect } from '@/shared/components/ui/CustomSelect.jsx';
import { SearchInput } from '@/shared/components/ui/SearchInput.jsx';
import { DataState } from '@/shared/components/ui/DataState.jsx';
import { EmptyState } from '@/shared/components/ui/EmptyState.jsx';
import { UserAvatar } from '@/shared/components/ui/UserAvatar.jsx';
import { Badge } from '@/shared/components/ui/Badge.jsx';
import { AccountSectionLayout } from '@/pages/dashboard/components/AccountSectionLayout.jsx';
import { AdminFilterGroup, AdminFilterPanel } from '@/features/admin/components/AdminSectionLayout.jsx';
import { formatPhoneFR } from '@/shared/utils';

const SORT_OPTIONS = [
  { value: 'recent', label: 'Du plus récent' },
  { value: 'name', label: 'Nom (A → Z)' },
];

function ContactRow({ contact }) {
  const name = contact.displayName || 'Utilisateur';
  return (
    <li>
      <Card className="p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <UserAvatar
              user={{ firstName: contact.firstName, lastName: contact.lastName }}
              src={contact.avatarUrl}
              name={name}
              className="h-11 w-11"
            />
            <div className="min-w-0">
              <p className="truncate font-semibold text-gray-900">{name}</p>
              <p className="truncate text-xs text-gray-500">
                {contact.tradeName || (contact.role === 'professional' ? 'Professionnel' : 'Client')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={contact.outgoing ? 'info' : 'primary'} size="sm">
              {contact.outgoing ? 'Contacté' : 'Vous a contacté'}
            </Badge>
            {!contact.outgoing && contact.status === 'new' && (
              <Badge variant="warning" size="sm">Nouveau</Badge>
            )}
          </div>
        </div>

        {contact.message && (
          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-gray-600">{contact.message}</p>
        )}

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-3">
          <p className="text-xs text-gray-400">
            {new Date(contact.createdAt).toLocaleDateString('fr-FR')}
          </p>
          {contact.phone && (
            <a
              href={`tel:${contact.phone}`}
              className="inline-flex items-center gap-2 text-xs font-semibold text-primary-700 hover:underline"
            >
              <Phone size={14} aria-hidden /> {formatPhoneFR(contact.phone)}
            </a>
          )}
        </div>
      </Card>
    </li>
  );
}

export function ContactsSection({ rightContainer = null }) {
  const { data: itemsData, loading, error } = useAsyncData(async () => {
    const data = await getMyContacts();
    return data.items || [];
  }, []);
  // Mémoïsé : sans cela, `itemsData ?? []` crée un nouveau tableau à chaque
// rendu, et le useMemo des filtres se recalculerait en boucle.
const items = useMemo(() => itemsData ?? [], [itemsData]);

  const [q, setQ] = useState('');
  const [sort, setSort] = useState('recent');

  // « Réinitialiser » remet la recherche et le tri par défaut ; le tri seul
  // ne restreint pas la liste, mais il reste réversible.
  const dirty = Boolean(q || sort !== 'recent');

  const resetFilters = () => {
    setQ('');
    setSort('recent');
  };

  // Filtre et tri côté client : la liste du compte tient en quelques lignes,
  // inutile d'aller le refaire demander au serveur à chaque frappe.
  const visible = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const matched = needle
      ? items.filter(
          (c) =>
            (c.displayName || '').toLowerCase().includes(needle) ||
            (c.tradeName || '').toLowerCase().includes(needle) ||
            (c.phone || '').toLowerCase().includes(needle),
        )
      : items;

    return [...matched].sort((a, b) =>
      sort === 'name'
        ? (a.displayName || '').localeCompare(b.displayName || '', 'fr')
        : new Date(b.createdAt) - new Date(a.createdAt),
    );
  }, [items, q, sort]);

  const filters = (searchId) => (
    <AdminFilterPanel dirty={dirty} onReset={resetFilters}>
      <div className="divide-y divide-gray-100">
        <AdminFilterGroup title="Recherche">
          <SearchInput
            id={searchId}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onClear={() => setQ('')}
            placeholder="Nom, métier ou téléphone..."
            aria-label="Rechercher dans mes contacts"
          />
        </AdminFilterGroup>

        <AdminFilterGroup title="Trier par">
          <CustomSelect
            value={sort}
            onChange={setSort}
            options={SORT_OPTIONS}
            className="w-full"
            aria-label="Trier les contacts"
          />
        </AdminFilterGroup>
      </div>
    </AdminFilterPanel>
  );

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-extrabold tracking-tight text-gray-900">Mes contacts</h2>
        <p className="mt-1 text-sm text-gray-600">
          Les professionnels que vous avez appelés ou écrits.
        </p>
      </div>

      <AccountSectionLayout
        ariaLabel="de mes contacts"
        rightContainer={rightContainer}
        searchId="my-contacts-search"
        filters={filters}
      >
        <DataState loading={loading} error={error} errorPrefix="Impossible de charger vos contacts">
          {visible.length === 0 ? (
            <EmptyState
              icon={Users}
              title={items.length === 0 ? 'Aucun contact pour le moment' : 'Aucun résultat'}
              description={
                items.length === 0
                  ? 'Les clients et les professionnels que vous contactez apparaîtront ici.'
                  : 'Aucun contact ne correspond à cette recherche.'
              }
            />
          ) : (
            <ul className="space-y-3">
              {visible.map((c) => (
                <ContactRow key={c.id} contact={c} />
              ))}
            </ul>
          )}
        </DataState>
      </AccountSectionLayout>
    </div>
  );
}
