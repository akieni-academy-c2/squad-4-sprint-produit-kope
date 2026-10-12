import { useState } from 'react';
import { Flag, Trash2 } from 'lucide-react';
import { useAsyncData } from '@/shared/hooks/useAsyncData.js';
import { Button } from '@/shared/components/ui/Button.jsx';
import { Card } from '@/shared/components/ui/Card.jsx';
import { Badge } from '@/shared/components/ui/Badge.jsx';
import { CustomSelect } from '@/shared/components/ui/CustomSelect.jsx';
import { SearchInput } from '@/shared/components/ui/SearchInput.jsx';
import { DataState } from '@/shared/components/ui/DataState.jsx';
import { EmptyState } from '@/shared/components/ui/EmptyState.jsx';
import { useNotification } from '@/shared/context/NotificationContext.jsx';
import { REPORT_STATUS_OPTIONS, reportReasonLabel, reportStatusLabel } from '@/shared/constants/reports.js';
import { formatDateFr } from '@/shared/utils';
import { cn } from '@/shared/utils';
import { AccountSectionLayout } from '@/pages/dashboard/components/AccountSectionLayout.jsx';
import { AdminFilterGroup, AdminFilterPanel } from '@/features/admin/components/AdminSectionLayout.jsx';
import { deleteMyReport, getMyReports } from '../services/reports.service.js';

const STATUS_VARIANT = { pending: 'warning', resolved: 'success', dismissed: 'neutral' };

// Un signalement traité a déjà fait son office — le professionnel a été bloqué
// ou le motif rejeté. Le retirer effacerait une décision prise par un
// administrateur : le retrait n'est proposé que sur un signalement en attente.
const WITHDRAWABLE = new Set(['pending']);

  const canWithdraw = (report) => WITHDRAWABLE.has(report.status);

export function MyReportsSection({ rightContainer = null }) {
  const { toast } = useNotification();
  const [status, setStatus] = useState('');
  const [q, setQ] = useState('');
  const [reload, setReload] = useState(0);

  const { data, loading, error } = useAsyncData(
    () => getMyReports({ status: status || undefined, q: q || undefined }),
    [status, q, reload],
  );
  const items = data?.items ?? [];
  const [pendingId, setPendingId] = useState(null);

  // Un filtre est « sale » dès qu'il restreint la liste : c'est ce qui
  // conditionne l'affichage du bouton « Réinitialiser » du panneau.
  const dirty = Boolean(q || status);

  const resetFilters = () => {
    setQ('');
    setStatus('');
  };

  const remove = async (id) => {
    setPendingId(id);
    try {
      await deleteMyReport(id);
      toast({ message: 'Signalement retiré.', type: 'success' });
      setReload((n) => n + 1);
    } catch (err) {
      toast({ message: err?.message || 'Impossible de retirer ce signalement.', type: 'error' });
    } finally {
      setPendingId(null);
    }
  };

  const filters = (searchId) => (
        <AdminFilterPanel dirty={dirty} onReset={resetFilters}>
          <div className="divide-y divide-gray-100">
            <AdminFilterGroup title="Recherche">
              <SearchInput
                id={searchId}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onClear={() => setQ('')}
                placeholder="Professionnel ou texte..."
                aria-label="Rechercher dans mes signalements"
              />
            </AdminFilterGroup>

            <AdminFilterGroup title="Statut">
              <CustomSelect
                value={status}
                onChange={setStatus}
                options={REPORT_STATUS_OPTIONS}
                className="w-full"
                aria-label="Filtrer par statut"
              />
            </AdminFilterGroup>
          </div>
        </AdminFilterPanel>
      );

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-extrabold tracking-tight text-gray-900">Mes signalements</h2>
        <p className="mt-1 text-sm text-gray-600">
          Vos signalements et leur état de traitement.
        </p>
      </div>

      <AccountSectionLayout
        ariaLabel="de mes signalements"
        rightContainer={rightContainer}
        searchId="my-reports-search"
        filters={filters}
      >

      <DataState loading={loading} error={error} errorPrefix="Impossible de charger vos signalements">
        {items.length === 0 ? (
          <EmptyState
            icon={Flag}
            title="Aucun signalement"
            description={
              q || status
                ? 'Aucun signalement ne correspond à ces filtres.'
                : 'Les profils que vous signalez apparaissent ici, avec leur état de traitement.'
            }
          />
        ) : (
          <ul className="space-y-3">
            {items.map((report) => (
              <li key={report.id}>
                <Card className="p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-gray-900">{report.professionalName}</p>
                      <p className="text-xs text-gray-500">{reportReasonLabel(report.reason)}</p>
                    </div>
                    <Badge variant={STATUS_VARIANT[report.status] ?? 'neutral'} size="sm">
                      {reportStatusLabel(report.status)}
                    </Badge>
                  </div>

                  {report.message && (
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-gray-600">{report.message}</p>
                  )}

                  <div className="mt-3 flex items-center justify-between gap-3 border-t border-gray-100 pt-3">
                    <p className="text-xs text-gray-400">{formatDateFr(report.createdAt)}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      loading={pendingId === report.id}
                      onClick={() => remove(report.id)}
                      // Rétractation d'une décision déjà prise : le bouton
                      // disparaît plutôt que d'être désactivé, un gris
                      // inexplicable sur un traitement terminé.
                      className={cn(
                        'text-gray-500 hover:bg-rose-50 hover:text-danger-500',
                        !canWithdraw(report) && 'invisible',
                      )}
                      aria-hidden={!canWithdraw(report)}
                      tabIndex={canWithdraw(report) ? undefined : -1}
                    >
                      <Trash2 size={16} aria-hidden />
                      Retirer
                    </Button>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </DataState>
      </AccountSectionLayout>
    </div>
  );
}