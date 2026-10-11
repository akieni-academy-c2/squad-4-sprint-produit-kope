import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Ban, CalendarClock, EyeOff, Flag, Phone, Star } from 'lucide-react';
import { Badge, DataState, UserAvatar } from '@/shared/components/ui';
import { StarRating } from '@/shared/components/ui/StarRating.jsx';
import { ROUTES } from '@/shared/lib/constants.js';
import { getStats } from '../services/admin.service.js';
import { cn, formatDateFr } from '@/shared/utils';

const RECENT_COUNT = 3;

// Teintes des panneaux : elles se distinguent entre elles, les cartes de
// valeur qu'ils contiennent restent blanches.
const GROUP_TONES = {
  default: 'border-[#e2e8e5] bg-white',
  primary: 'border-primary-600 bg-primary-500',
  danger: 'border-danger-500 bg-danger-500',
  teal: 'border-teal-600 bg-teal-500',
  neutral: 'border-gray-600 bg-gray-500',
};

function Group({ title, tone = 'default', children }) {
  const toned = tone !== 'default';

  return (
    <section className={cn('rounded-[18px] border p-4', GROUP_TONES[tone] ?? GROUP_TONES.default)}>
      <h3
        className={cn(
          'text-sm font-bold uppercase tracking-[0.08em]',
          toned ? 'text-white' : 'text-gray-500',
        )}
      >
        {title}
      </h3>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function KpiCard({ label, value, hint, onClick, tone = 'default', icon = null, footer = null }) {
  const clickable = typeof onClick === 'function';
  const Wrapper = clickable ? 'button' : 'div';

  return (
    <Wrapper
      {...(clickable ? { type: 'button', onClick } : {})}
      className={cn(
        'rounded-[18px] border bg-white p-4',
        clickable &&
          'block w-full text-left transition hover:border-primary-300 hover:shadow-sm focus-visible:outline-2 focus-visible:outline-primary-500',
        tone === 'danger' ? 'border-rose-200 bg-rose-50/50' : 'border-[#e2e8e5]',
      )}
    >
      <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-gray-500">
        {icon}
        {label}
      </p>
      <p
        className={cn(
          'mt-2 text-3xl font-extrabold tracking-tight',
          tone === 'danger' && Number(value) > 0 ? 'text-rose-600' : 'text-gray-900',
        )}
      >
        {value ?? '-'}
      </p>
      {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
      {footer && <div className="mt-1.5">{footer}</div>}
    </Wrapper>
  );
}

function TodoCard({ label, value, hint, onClick }) {
  const pending = Number(value ?? 0) > 0;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-start justify-between gap-3 rounded-[14px] border p-4 text-left transition focus-visible:outline-2 focus-visible:outline-amber-600',
        pending
          ? 'border-amber-300 bg-white hover:border-amber-400 hover:shadow-sm'
          : 'border-amber-100 bg-white/60 hover:border-amber-200',
      )}
    >
      <span className="min-w-0">
        <span className="block truncate text-sm font-semibold text-gray-900">{label}</span>
        <span className="mt-0.5 block text-xs text-gray-500">{hint}</span>
      </span>
      <span
        className={cn(
          'shrink-0 text-2xl font-extrabold tracking-tight',
          pending ? 'text-amber-700' : 'text-gray-300',
        )}
      >
        {value ?? 0}
      </span>
    </button>
  );
}

function PublicationRate({ stats }) {
  const total = Number(stats?.professionals ?? 0);
  const published = Number(stats?.published ?? 0);
  const percent = total ? Math.round((published / total) * 100) : 0;

  return (
    <div className="mt-3 rounded-[14px] border border-[#e2e8e5] bg-[#f7faf8] p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-gray-900">Taux de publication</p>
        <p className="text-sm font-extrabold text-gray-900">{total ? `${percent}%` : '-'}</p>
      </div>
      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-200">
        <div className="h-full rounded-full bg-primary-500" style={{ width: `${percent}%` }} />
      </div>
      <p className="mt-2 text-xs text-gray-500">
        {published} profil{published > 1 ? 's' : ''} publié{published > 1 ? 's' : ''} sur {total}
        {Number(stats?.incomplete) > 0 ? ` · ${stats.incomplete} incomplet${stats.incomplete > 1 ? 's' : ''}` : ''}
      </p>
    </div>
  );
}

function RecentProfessionals({ items, onOpenAll }) {
  if (items.length === 0)
    return (
      <p className="rounded-[14px] border border-dashed border-gray-200 bg-[#f7faf8] p-6 text-center text-sm text-gray-500">
        Aucun professionnel inscrit pour l'instant.
      </p>
    );

  return (
    <>
      <ul className="space-y-2">
        {items.map((p) => (
          <li key={p.id}>
            <article className="flex items-center gap-3 rounded-[14px] border border-[#e2e8e5] bg-white p-3 transition hover:border-primary-200 hover:shadow-sm">
              <Link
                to={ROUTES.PROFESSIONAL(p.id)}
                className="shrink-0 rounded-full transition hover:opacity-80"
                aria-label={`Voir la fiche publique de ${p.displayName}`}
              >
                <UserAvatar
                  user={p}
                  name={p.displayName}
                  className="h-10 w-10"
                  fallbackClassName="bg-primary-100 text-primary-700"
                  iconSize={18}
                />
              </Link>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-gray-900">{p.displayName}</p>
                <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-gray-500">
                  <span className="truncate">{p.trade}</span>
                  {p.phone && (
                    <>
                      <span aria-hidden>·</span>
                      <Phone size={12} className="shrink-0" aria-hidden />
                      <span className="truncate">{p.phone}</span>
                    </>
                  )}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <Badge variant="info">Professionnel</Badge>
                <span className="text-[11px] text-gray-500">Inscrit le {formatDateFr(p.createdAt)}</span>
              </div>
            </article>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={onOpenAll}
        className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary-600 transition hover:text-primary-700"
      >
        Voir tous les professionnels <ArrowRight size={14} aria-hidden />
      </button>
    </>
  );
}

/**
 * Vue d'ensemble : d'abord ce qui attend une décision, puis l'état de la
 * plateforme groupé par thème. Chaque KPI ouvre la section concernée.
 */
export function AdminOverview({ stats, onNavigate = () => {} }) {
  const avg = Number(stats?.ratingAverage ?? 0);
  const visibleReviews = Math.max(0, (stats?.reviews ?? 0) - (stats?.reviewsHidden ?? 0));
  const recentProfessionals = (stats?.recentProfessionals ?? []).slice(0, RECENT_COUNT);

  return (
    <div className="space-y-6">
      <section className="rounded-[18px] border border-amber-200 bg-amber-50/70 p-4">
        <div className="flex items-center gap-2">
          <CalendarClock size={16} className="text-amber-700" aria-hidden />
          <h3 className="text-sm font-bold uppercase tracking-[0.08em] text-amber-800">À traiter</h3>
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <TodoCard
            label="Signalements en attente"
            value={stats?.reportsPending}
            hint="Ouvrir la file de modération"
            onClick={() => onNavigate('reports', { status: 'pending' })}
          />
          <TodoCard
            label="Profils incomplets"
            value={stats?.incomplete}
            hint="À compléter avant publication"
            onClick={() => onNavigate('professionals', { status: 'incomplete' })}
          />
          <TodoCard
            label="Avis masqués"
            value={stats?.reviewsHidden}
            hint="À rétablir ou à confirmer"
            onClick={() => onNavigate('reviews', { hidden: 'true' })}
          />
        </div>
      </section>

      <Group title="Plateforme" tone="primary">
        <div className="grid gap-3 sm:grid-cols-3">
          <KpiCard
            label="Utilisateurs"
            value={stats?.users}
            hint={`${stats?.clients ?? 0} clients · ${stats?.professionals ?? 0} professionnels`}
            onClick={() => onNavigate('users')}
          />
          <KpiCard
            label="Professionnels"
            value={stats?.professionals}
            hint={`${stats?.published ?? 0} publiés · ${stats?.hidden ?? 0} masqués`}
            onClick={() => onNavigate('professionals')}
          />
          <KpiCard
            label="Comptes bloqués"
            value={stats?.usersBlocked}
            hint={`${stats?.usersSuspended ?? 0} suspendu${(stats?.usersSuspended ?? 0) > 1 ? 's' : ''}`}
            tone={Number(stats?.usersBlocked) > 0 ? 'danger' : 'default'}
            icon={<Ban size={12} aria-hidden />}
            onClick={() => onNavigate('users', { blocked: 'true' })}
          />
        </div>
        <PublicationRate stats={stats} />
      </Group>

      <Group title="Modération" tone="danger">
        <div className="grid gap-3 sm:grid-cols-3">
          <KpiCard
            label="Signalements en attente"
            value={stats?.reportsPending}
            hint="À statuer"
            tone={Number(stats?.reportsPending) > 0 ? 'danger' : 'default'}
            icon={<Flag size={12} aria-hidden />}
            onClick={() => onNavigate('reports', { status: 'pending' })}
          />
          <KpiCard
            label="Avis masqués"
            value={stats?.reviewsHidden}
            hint={`sur ${stats?.reviews ?? 0} avis`}
            icon={<EyeOff size={12} aria-hidden />}
            onClick={() => onNavigate('reviews', { hidden: 'true' })}
          />
          <KpiCard
            label="Profils masqués"
            value={stats?.hidden}
            hint="Retirés des recherches"
            onClick={() => onNavigate('professionals', { status: 'hidden' })}
          />
        </div>
      </Group>

      <div className="grid gap-6 lg:grid-cols-2">
        <Group title="Clients" tone="teal">
          <div className="grid gap-3 sm:grid-cols-2">
            <KpiCard
              label="Clients"
              value={stats?.clients}
              hint={`sur ${stats?.users ?? 0} utilisateurs`}
              onClick={() => onNavigate('users', { role: 'client' })}
            />
            <KpiCard
              label="Demandes de contact"
              value={stats?.contacts}
              hint="Reçues par les professionnels"
            />
            <KpiCard
              label="Avis laissés"
              value={stats?.reviews}
              hint={`${visibleReviews} visibles`}
              icon={<Star size={12} aria-hidden />}
              onClick={() => onNavigate('reviews')}
            />
            <KpiCard
              label="Note moyenne"
              value={avg || '-'}
              hint="Sur les avis visibles"
              footer={<StarRating value={avg} size="sm" />}
            />
          </div>
        </Group>

        <Group title="Derniers professionnels inscrits" tone="neutral">
          <RecentProfessionals items={recentProfessionals} onOpenAll={() => onNavigate('professionals')} />
        </Group>
      </div>
    </div>
  );
}

export function AdminStats({ onNavigate }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setStats(await getStats());
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  return (
    <DataState loading={loading} error={error}>
      <AdminOverview stats={stats} onNavigate={onNavigate} />
    </DataState>
  );
}
