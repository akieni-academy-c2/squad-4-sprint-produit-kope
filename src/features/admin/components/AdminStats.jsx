import { useCallback, useEffect, useState } from "react";
import {
  ArrowRight,
  Ban,
  CalendarClock,
  EyeOff,
  Flag,
  Phone,
  Star,
} from "lucide-react";
import { Link } from "@/shared/components/ui/Link.jsx";
import {
  Badge,
  DataState,
  KpiCard,
  StatGroup as Group,
  UserAvatar,
} from "@/shared/components/ui";
import { StarRating } from "@/shared/components/ui/StarRating.jsx";
import { ROUTES } from "@/shared/lib/constants.js";
import { getStats } from "../services/admin.service.js";
import { cn, formatDateFr } from "@/shared/utils";
import { formatPhoneFR } from "@/shared/utils";

const RECENT_COUNT = 4;

function TodoCard({ label, value, hint, href }) {
  const pending = Number(value ?? 0) > 0;
  const Wrapper = href ? Link : "button";

  return (
    <Wrapper
      {...(href ? { href } : { type: "button" })}
      className={cn(
        "flex items-start justify-between gap-3 rounded-[14px] border p-4 text-left transition focus-visible:outline-2 focus-visible:outline-amber-600",
        pending
          ? "border-amber-300 bg-white hover:border-amber-400 hover:shadow-sm"
          : "border-amber-100 bg-white/60 hover:border-amber-200",
      )}
    >
      <span className="min-w-0">
        <span className="block truncate text-sm font-semibold text-gray-900">
          {label}
        </span>
        <span className="mt-0.5 block text-xs text-gray-500">{hint}</span>
      </span>
      <span
        className={cn(
          "shrink-0 text-2xl font-extrabold tracking-tight",
          pending ? "text-amber-700" : "text-gray-300",
        )}
      >
        {value ?? 0}
      </span>
    </Wrapper>
  );
}

function PublicationRate({ stats }) {
  const total = Number(stats?.professionals ?? 0);
  const published = Number(stats?.published ?? 0);
  const percent = total ? Math.round((published / total) * 100) : 0;

  return (
    <div className="mt-3 rounded-[14px] border border-[#e2e8e5] bg-[#f7faf8] p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-gray-900">
          Taux de publication
        </p>
        <p className="text-sm font-extrabold text-gray-900">
          {total ? `${percent}%` : "-"}
        </p>
      </div>
      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full rounded-full bg-primary-500"
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-gray-500">
        {published} profil{published > 1 ? "s" : ""} publié
        {published > 1 ? "s" : ""} sur {total}
        {Number(stats?.incomplete) > 0
          ? ` · ${stats.incomplete} incomplet${stats.incomplete > 1 ? "s" : ""}`
          : ""}
      </p>
    </div>
  );
}

function RecentProfessionals({ items, href }) {
  if (items.length === 0)
    return (
      <p className="rounded-[14px] border border-dashed border-gray-200 bg-[#f7faf8] p-6 text-center text-sm text-gray-500">
        Aucun professionnel inscrit pour l'instant.
      </p>
    );

  return (
    <>
      <ul className="space-y-2 ">
        {items.map((p) => (
          <li key={p.id}>
            <article className="flex flex-col gap-3 rounded-[14px] border border-[#e2e8e5] bg-white p-3 transition hover:border-primary-200 hover:shadow-sm sm:flex-row sm:items-center">
              <Link
                href={ROUTES.PROFESSIONAL(p.id)}
                className="shrink-0 self-start rounded-full transition hover:opacity-80 sm:self-auto"
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
                <p className="truncate text-sm font-semibold text-gray-900">
                  {p.displayName}
                </p>
                <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-gray-500">
                  <span className="truncate">{p.trade}</span>
                  {p.phone && (
                    <>
                      <span aria-hidden>·</span>
                      <Phone size={12} className="shrink-0" aria-hidden />
                      <span className="truncate">{formatPhoneFR(p.phone)}</span>
                    </>
                  )}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-start gap-1 sm:items-end">
                <Badge variant="info">Professionnel</Badge>
                <span className="text-[11px] text-gray-500">
                  Inscrit le {formatDateFr(p.createdAt)}
                </span>
              </div>
            </article>
          </li>
        ))}
      </ul>

      <Link
        href={href}
        className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary-600 transition hover:text-primary-700"
      >
        Voir tous les professionnels <ArrowRight size={14} aria-hidden />
      </Link>
    </>
  );
}

export function AdminOverview({ stats, sectionLink }) {
  const avg = Number(stats?.ratingAverage ?? 0);
  const visibleReviews = Math.max(
    0,
    (stats?.reviews ?? 0) - (stats?.reviewsHidden ?? 0),
  );
  const recentProfessionals = (stats?.recentProfessionals ?? []).slice(
    0,
    RECENT_COUNT,
  );

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-amber-200 bg-amber-50/70 p-4">
        <div className="flex items-center gap-2">
          <CalendarClock size={16} className="text-amber-700" aria-hidden />
          <h3 className="text-sm font-bold uppercase tracking-[0.08em] text-amber-800">
            À traiter
          </h3>
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <TodoCard
            label="Signalements en attente"
            value={stats?.reportsPending}
            hint="Ouvrir la file de modération"
            href={sectionLink("reports", { status: "pending" })}
          />
          <TodoCard
            label="Profils incomplets"
            value={stats?.incomplete}
            hint="À compléter avant publication"
            href={sectionLink("professionals", { status: "incomplete" })}
          />
          <TodoCard
            label="Avis masqués"
            value={stats?.reviewsHidden}
            hint="À rétablir ou à confirmer"
            href={sectionLink("reviews", { hidden: "true" })}
          />
        </div>
      </section>

      <Group title="Plateforme">
        <div className="grid gap-3 sm:grid-cols-3">
          <KpiCard
            label="Utilisateurs"
            value={stats?.users}
            hint={`${stats?.clients ?? 0} clients · ${stats?.professionals ?? 0} professionnels`}
            href={sectionLink("users")}
          />
          <KpiCard
            label="Professionnels"
            value={stats?.professionals}
            hint={`${stats?.published ?? 0} publiés · ${stats?.hidden ?? 0} masqués`}
            href={sectionLink("professionals")}
          />
          <KpiCard
            label="Comptes bloqués"
            value={stats?.usersBlocked}
            hint={`${stats?.usersSuspended ?? 0} suspendu${(stats?.usersSuspended ?? 0) > 1 ? "s" : ""}`}
            tone={Number(stats?.usersBlocked) > 0 ? "danger" : "default"}
            icon={<Ban size={12} aria-hidden />}
            href={sectionLink("users", { blocked: "true" })}
          />
        </div>
        <PublicationRate stats={stats} />
      </Group>

      <Group title="Modération">
        <div className="grid gap-3 sm:grid-cols-3">
          <KpiCard
            label="Signalements en attente"
            value={stats?.reportsPending}
            hint="À statuer"
            tone={Number(stats?.reportsPending) > 0 ? "danger" : "default"}
            icon={<Flag size={12} aria-hidden />}
            href={sectionLink("reports", { status: "pending" })}
          />
          <KpiCard
            label="Avis masqués"
            value={stats?.reviewsHidden}
            hint={`sur ${stats?.reviews ?? 0} avis`}
            icon={<EyeOff size={12} aria-hidden />}
            href={sectionLink("reviews", { hidden: "true" })}
          />
          <KpiCard
            label="Profils masqués"
            value={stats?.hidden}
            hint="Retirés des recherches"
            href={sectionLink("professionals", { status: "hidden" })}
          />
        </div>
      </Group>

      <div className="grid gap-6 lg:grid-cols-2">
        <Group title="Clients">
          <div className="grid gap-3 sm:grid-cols-2">
            <KpiCard
              label="Clients"
              value={stats?.clients}
              hint={`sur ${stats?.users ?? 0} utilisateurs`}
              href={sectionLink("users", { role: "client" })}
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
              href={sectionLink("reviews")}
            />
            <KpiCard
              label="Note moyenne"
              value={avg || "-"}
              hint="Sur les avis visibles"
              footer={<StarRating value={avg} size="sm" />}
            />
          </div>
        </Group>

        <Group title="Derniers professionnels inscrits">
          <RecentProfessionals
            items={recentProfessionals}
            href={sectionLink("professionals")}
          />
        </Group>
      </div>
    </div>
  );
}

export function AdminStats({ sectionLink }) {
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

  /**
   * `load` est asynchrone : l'effet n'appelle pas `setState` lui-même, c'est la
   * promesse qui écrira plus tard. La règle ne voit pas cette frontière.
   *
   * Pas de garde anti-course ici, contrairement à `useSearch` : la requête ne
   * part qu'au montage ou sur un clic explicite de l'administrateur, jamais à
   * chaque frappe. Deux requêtes ne peuvent donc pas se concurrencer. Si le
   * tableau devenait filtrable au clavier, il faudrait un jeton comme dans
   * `useAsyncData`.
   */
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  return (
    <DataState loading={loading} error={error}>
      <AdminOverview stats={stats} sectionLink={sectionLink} />
    </DataState>
  );
}
