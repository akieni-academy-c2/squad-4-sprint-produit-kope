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
import { REPORT_REASON_OPTIONS } from '@/shared/constants/reports.js';
import { reportContact } from '@/features/reports/services/reports.service.js';
import { ReportDialog, ReportTrigger } from '@/features/reports/components/ReportDialog.jsx';
import { logContact } from '../services/contacts.service.js';
import { formatDateFr, toWhatsappUrl } from '@/shared/utils';

const SORT_OPTIONS = [
  { value: 'recent', label: 'Du plus récent' },
  { value: 'name', label: 'Nom (A → Z)' },
];

// « Qui a pris l'initiative » est la seule distinction qui change la lecture
// d'un contact : un professionnel qui m'a écrit et moi qui l'ai Joint ne se
// relisent pas de la même façon.
const ORIGIN_OPTIONS = [
  { value: 'all', label: 'Tous les contacts' },
  { value: 'outgoing', label: 'Contactés par moi' },
  { value: 'incoming', label: 'Qui m’ont contacté' },
];

// Le canal dit *comment* on a été joint. Il répond à une question que
// l'origine ne couvre pas : « qui ai-je déjà réussi à appeler ? » n'a rien à
// voir avec « qui m'a écrit en premier ».
const CHANNEL_OPTIONS = [
  { value: 'all', label: 'Tous les canaux' },
  { value: 'call', label: 'Appels' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'message', label: 'Messages' },
];

function ContactRow({ contact, onReach, onReport, reported }) {
  const name = contact.displayName || 'Utilisateur';
  const { toast } = useNotification();

  const reach = (channel, href, newTab) => {
    if (newTab) window.open(href, '_blank', 'noopener,noreferrer');
    else window.location.href = href;

    logContact(contact.userId, channel)
      .then(() => onReach())
      .catch((err) =>
        toast({ message: err?.message || 'Contact non enregistré.', type: 'error' }),
      );
  };

  const tel = contact.phone ? `tel:${String(contact.phone).replace(/\D/g, '')}` : null;
  const wa = toWhatsappUrl(contact.phone);

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

        
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 pt-3">
          <span className=" inline-flex items-center gap-1.5 text-xs text-gray-500">
            
            <span aria-hidden>·</span>
            {formatDateFr(contact.createdAt)}
          </span>

          {/* Un seul bouton, jamais les deux : la carte propose de reprendre contact
              par le dernier canal utilisé. Après un appel, c'est Appeler ;
              sinon c'est WhatsApp, le canal principal du site. Proposer les
              deux à la fois transforme une fiche en liste de choix. */}
          {contact.phone &&
            (contact.channel === 'call' ? (
              <Button
                variant="subtle"
                size="sm"
                onClick={() => reach('call', tel, false)}
              >
                <Phone size={14} aria-hidden /> Appeler
              </Button>
            ) : (
              <Button
                variant="subtle"
                size="sm"
                onClick={() => reach('whatsapp', wa, true)}
              >
                <MessageCircle size={14} aria-hidden /> WhatsApp
              </Button>
            ))}

          {/* Le signalement est réservé au correspondant client : c'est le seul
              cas où il manque une issue. Un professionnel signalé passe déjà
              par la fiche publique, qui porte ce geste ; le dupliquer ici
              ouvrirait deux chemins vers le même signalement. */}
          {contact.role === 'client' &&
            (reported ? (
              <span className="text-[11px] font-medium text-gray-400">Signalé</span>
            ) : (
              <ReportTrigger onClick={() => onReport(contact)} label="Signaler" />
            ))}
        </div>
      </Card>
    </li>
  );
}

export function ContactsSection({ rightContainer = null }) {
  const [reload, setReload] = useState(0);
  const [reporting, setReporting] = useState(null);
  const [reportedIds, setReportedIds] = useState([]);
  const { data: itemsData, loading, error } = useAsyncData(async () => {
    const data = await getMyContacts();
    return data.items || [];
  }, [reload]);

  const items = useMemo(() => itemsData ?? [], [itemsData]);

  const refresh = () => setReload((n) => n + 1);

  const [q, setQ] = useState('');
  const [sort, setSort] = useState('recent');
  const [origin, setOrigin] = useState('all');
  const [channel, setChannel] = useState('all');

  const dirty = Boolean(q || sort !== 'recent' || origin !== 'all' || channel !== 'all');

  const resetFilters = () => {
    setQ('');
    setSort('recent');
    setOrigin('all');
    setChannel('all');
  };

  const visible = useMemo(() => {
    const needle = q.trim().toLowerCase();
    let matched = needle
      ? items.filter(
          (c) =>
            (c.displayName || '').toLowerCase().includes(needle) ||
            (c.tradeName || '').toLowerCase().includes(needle) ||
            (c.phone || '').toLowerCase().includes(needle),
        )
      : items;

    if (origin === 'outgoing') matched = matched.filter((c) => c.outgoing);
    if (origin === 'incoming') matched = matched.filter((c) => !c.outgoing);
    if (channel !== 'all') matched = matched.filter((c) => c.channel === channel);

    return [...matched].sort((a, b) =>
      sort === 'name'
        ? (a.displayName || '').localeCompare(b.displayName || '', 'fr')
        : new Date(b.createdAt) - new Date(a.createdAt),
    );
  }, [items, q, sort, origin, channel]);

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

        <AdminFilterGroup title="Origine">
          <CustomSelect
            value={origin}
            onChange={setOrigin}
            options={ORIGIN_OPTIONS}
            className="w-full"
            aria-label="Filtrer par origine du contact"
          />
        </AdminFilterGroup>

        <AdminFilterGroup title="Canal">
          <CustomSelect
            value={channel}
            onChange={setChannel}
            options={CHANNEL_OPTIONS}
            className="w-full"
            aria-label="Filtrer par canal de contact"
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
          Les professionnels et clients que vous avez appelés ou écrits.
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
                <ContactRow
                  key={c.id}
                  contact={c}
                  onReach={refresh}
                  onReport={setReporting}
                  reported={reportedIds.includes(c.userId)}
                />
              ))}
            </ul>
          )}
        </DataState>
      </AccountSectionLayout>

      <ReportDialog
        open={reporting != null}
        onClose={() => setReporting(null)}
        title="Signaler ce contact"
        description={`Votre signalement concerne ${reporting?.displayName || 'ce contact'} et sera transmis à l’administration.`}
        reasonOptions={REPORT_REASON_OPTIONS}
        notice="Le signalement est possible uniquement pour un contact avec qui vous avez déjà échangé."
        submit={async (payload) => {
          const id = reporting?.userId;
          await reportContact(id, payload);
          setReportedIds((prev) => [...prev, id]);
        }}
      />
    </div>
  );
}
