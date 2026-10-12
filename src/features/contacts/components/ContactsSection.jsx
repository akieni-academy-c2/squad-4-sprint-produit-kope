import { useMemo, useState } from 'react';
import { MessageCircle, Phone, Users } from 'lucide-react';
import { useAsyncData } from '@/shared/hooks/useAsyncData.js';
import { getMyContacts } from '../services/contacts.service.js';
import { Button } from '@/shared/components/ui/Button.jsx';
import { Card } from '@/shared/components/ui/Card.jsx';
import { CustomSelect } from '@/shared/components/ui/CustomSelect.jsx';
import { SearchInput } from '@/shared/components/ui/SearchInput.jsx';
import { DataState } from '@/shared/components/ui/DataState.jsx';
import { EmptyState } from '@/shared/components/ui/EmptyState.jsx';
import { UserAvatar } from '@/shared/components/ui/UserAvatar.jsx';
import { Badge } from '@/shared/components/ui/Badge.jsx';
import { useNotification } from '@/shared/context/NotificationContext.jsx';
import { AccountSectionLayout } from '@/pages/dashboard/components/AccountSectionLayout.jsx';
import { AdminFilterGroup, AdminFilterPanel } from '@/features/admin/components/AdminSectionLayout.jsx';
import { logContact } from '../services/contacts.service.js';
import { formatDateFr } from '@/shared/utils';

const SORT_OPTIONS = [
  { value: 'recent', label: 'Du plus récent' },
  { value: 'name', label: 'Nom (A → Z)' },
];

const CHANNELS = {
  call: { label: 'Appel', icon: Phone },
  whatsapp: { label: 'WhatsApp', icon: MessageCircle },
  message: { label: 'Message', icon: MessageCircle },
};

function ContactRow({ contact, onReach }) {
  const name = contact.displayName || 'Utilisateur';
  const { toast } = useNotification();

  // Un contact est un événement : le canal dit comment, la date dit quand.
  const ChannelIcon = CHANNELS[contact.channel]?.icon ?? MessageCircle;
  const channelLabel = CHANNELS[contact.channel]?.label ?? 'Message';

  /**
   * Ouvre le canal puis note le contact.
   *
   * Le lien s'ouvre d'abord : `window.open` peut être bloqué par le navigateur
   * s'il arrive trop tard après le clic asynchrone. L'enregistrement suit, et
   * son échec est seulement toasted — un professionnel injoignable pour cause de
   * base de données serait pire que la ligne manquante dans l'historique.
   */
  const reach = (channel, href, newTab) => {
    if (newTab) window.open(href, '_blank', 'noopener,noreferrer');
    else window.location.href = href;

    logContact(contact.userId, channel)
      .then(() => onReach())
      .catch((err) =>
        toast({ message: err?.message || 'Contact non enregistré.', type: 'error' }),
      );
  };

  const tel = contact.phone ? `tel:${contact.phone}` : null;
  const wa = contact.phone
    ? `https://wa.me/${String(contact.phone).replace(/[^\d]/g, '')}`
    : null;

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

        {/* Un contact n'est pas une conversation : seuls l'interlocuteur et la
            date du dernier échange sont utiles ici. Le message d'origine
            alourdissait chaque ligne sans rien apprendre de plus. */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-3">
          <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
            <ChannelIcon size={13} aria-hidden className="shrink-0 text-gray-400" />
            {channelLabel}
            <span aria-hidden>·</span>
            {formatDateFr(contact.createdAt)}
          </span>
          {contact.phone && (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-primary-700 hover:bg-primary-50"
                onClick={() => reach('call', tel, false)}
              >
                <Phone size={14} aria-hidden /> Appeler
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-primary-700 hover:bg-primary-50"
                onClick={() => reach('whatsapp', wa, true)}
              >
                <MessageCircle size={14} aria-hidden /> WhatsApp
              </Button>
            </div>
          )}
        </div>
      </Card>
    </li>
  );
}

export function ContactsSection({ rightContainer = null }) {
  const [reload, setReload] = useState(0);
  const { data: itemsData, loading, error } = useAsyncData(async () => {
    const data = await getMyContacts();
    return data.items || [];
  }, [reload]);
  // Mémoïsé : sans cela, `itemsData ?? []` crée un nouveau tableau à chaque
// rendu, et le useMemo des filtres se recalculerait en boucle.
const items = useMemo(() => itemsData ?? [], [itemsData]);

  // Un contact vient d'être pris : la liste doit refléter l'événement, sans
  // rechargement complet de la page.
  const refresh = () => setReload((n) => n + 1);

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
                <ContactRow key={c.id} contact={c} onReach={refresh} />
              ))}
            </ul>
          )}
        </DataState>
      </AccountSectionLayout>
    </div>
  );
}
