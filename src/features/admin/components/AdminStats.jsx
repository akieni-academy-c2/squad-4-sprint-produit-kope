import { useCallback, useEffect, useState } from 'react';
import { DataState } from '@/shared/components/ui';
import { getStats } from '../services/admin.service.js';
import { formatDateFr } from '@/shared/utils';

function KpiCard({ label, value, hint }) {
  return (
    <div className="rounded-[18px] border border-[#e2e8e5] bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-gray-500">{label}</p>
      <p className="mt-2 text-3xl font-extrabold tracking-tight text-gray-900">{value ?? '-'}</p>
      {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
    </div>
  );
}

export function AdminStats() {
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
      <div className="space-y-6">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard label="Professionnels" value={stats?.professionals} hint={`${stats?.published ?? 0} publiés`} />
          <KpiCard label="En attente" value={stats?.incomplete} hint="Profils incomplets" />
          <KpiCard label="Masqués" value={stats?.hidden} hint="Retirés des recherches" />
          <KpiCard label="Utilisateurs" value={stats?.users} hint={`${stats?.clients ?? 0} clients`} />
          <KpiCard label="Avis" value={stats?.reviews} hint={`${stats?.reviewsHidden ?? 0} masqués`} />
          <KpiCard label="Note moyenne" value={stats?.ratingAverage} hint="Sur les avis visibles" />
          <KpiCard label="Demandes de contact" value={stats?.contacts} hint="Toutes périodes" />
          <KpiCard
            label="Taux de publication"
            value={stats?.professionals ? `${Math.round(((stats?.published || 0) / stats.professionals) * 100)}%` : '-'}
            hint="Profils complets et visibles"
          />
        </div>

        <div className="rounded-[18px] border border-[#e2e8e5] bg-white p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-gray-900">Derniers professionnels inscrits</h3>
          </div>
          <ul className="mt-3 divide-y divide-gray-100">
            {(stats?.recentProfessionals || []).length === 0 ? (
              <li className="py-3 text-sm text-gray-500">Aucun professionnel.</li>
            ) : (
              (stats?.recentProfessionals || []).map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-gray-900">{p.displayName}</p>
                    <p className="text-xs text-gray-500">{p.trade}</p>
                  </div>
                  <span className="shrink-0 text-xs text-gray-500">{formatDateFr(p.createdAt)}</span>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </DataState>
  );
}
