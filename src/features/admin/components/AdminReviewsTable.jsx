import { useCallback, useState } from 'react';
import { Calendar, CornerDownRight, Eye, EyeOff } from 'lucide-react';
import { Button, CustomSelect, SearchInput, Pagination, StarRating, DataState, Tooltip, UserAvatar } from '@/shared/components/ui';
import {
  AdminFilterGroup,
  AdminFilterPanel,
  AdminSectionLayout,
} from './AdminSectionLayout.jsx';
import { AdminConfirmModal } from './AdminConfirmModal.jsx';
import { useAdminPage } from '../hooks/useAdminPage.js';
import { useAdminFilters } from '../hooks/useAdminFilters.js';
import { useAdminList } from '../hooks/useAdminList.js';
import { useNotification } from '@/shared/context/NotificationContext.jsx';
import { listReviews, setReviewHidden } from '../services/admin.service.js';
import { formatDateFr, fullNameInitials } from '@/shared/utils';

const PAGE_SIZE = 25;

const VISIBILITY_OPTIONS = [
  { value: '', label: 'Tous les avis' },
  { value: 'false', label: 'Non masqués' },
  { value: 'true', label: 'Masqués' },
];

export function AdminReviewsTable({ rightContainer = null, initialFilters = {} }) {
  const { toast } = useNotification();
  const [page, changePage, setPage] = useAdminPage();
  const [confirm, setConfirm] = useState(null);
  const { draft, applied, dirty, set, submit, reset } = useAdminFilters({
    query: '',
    hidden: '',
    ...initialFilters,
  });

  const fetchList = useCallback(
    () =>
      listReviews({
        page,
        pageSize: PAGE_SIZE,
        hidden: applied.hidden === '' ? undefined : applied.hidden === 'true',
        query: applied.query,
      }),
    [page, applied.hidden, applied.query],
  );
  const { data, loading, error, reload } = useAdminList(fetchList);

  const apply = async () => {
    if (!confirm) return;
    try {
      await setReviewHidden(confirm.item.id, confirm.action === 'hide');
      toast({
        message: confirm.action === 'hide' ? 'Avis masqué.' : 'Avis rétabli.',
        type: 'success',
      });
      setConfirm(null);
      reload();
    } catch (err) {
      toast({ message: err?.message || 'Erreur.', type: 'error' });
    }
  };

  const applyFilters = () => {
    setPage(1);
    submit();
  };

  const resetFilters = () => {
    reset();
    setPage(1);
  };

  const total = Number(data?.total || 0);

  const renderFilters = (searchId) => (
    <AdminFilterPanel dirty={dirty} onReset={resetFilters}>
      <form onSubmit={applyFilters} className="divide-y divide-gray-100">
        <AdminFilterGroup title="Recherche">
          <SearchInput
            id={searchId}
            value={draft.query}
            onChange={(e) => set('query', e.target.value)}
            onClear={() => set('query', '')}
            placeholder="Client, professionnel ou contenu..."
            aria-label="Rechercher un avis"
          />
        </AdminFilterGroup>

        <AdminFilterGroup title="Visibilité">
          <CustomSelect
            value={draft.hidden}
            onChange={(v) => {
              set('hidden', v, { immediate: true });
              setPage(1);
            }}
            options={VISIBILITY_OPTIONS}
            className="w-full"
            aria-label="Filtrer par visibilité"
          />
        </AdminFilterGroup>
      </form>
    </AdminFilterPanel>
  );

  const list = (
    <DataState loading={loading} error={error}>
      <>
        <ul className="space-y-3">
          {(data?.items || []).length === 0 ? (
            <li className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-sm text-gray-500">
              Aucun avis.
            </li>
          ) : (
            (data?.items || []).map((r) => (
              <li
                key={r.id}
                className={`rounded-lg border bg-white p-4 ${r.isHidden ? 'border-rose-200 bg-rose-50/30' : 'border-gray-200'}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex min-w-0 flex-col">
                    <div className="flex items-center gap-2">
                      <UserAvatar user={r.client} className="h-7 w-7" />
                      <p className="truncate text-sm font-semibold text-gray-900">
                        {fullNameInitials(r.client?.firstName, r.client?.lastName) || 'Client'}
                      </p>
                      {r.isHidden ? (
                        <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-semibold text-rose-700">
                          Masqué
                        </span>
                      ) : (
                        <span className="rounded-full bg-mint-100 px-2 py-0.5 text-[11px] font-semibold text-primary-700">
                          Visible
                        </span>
                      )}
                    </div>

                    <div className="mt-1 flex items-center gap-1.5 opacity-60 grayscale">
                      <CornerDownRight className="h-4 w-4 shrink-0 text-gray-300" aria-hidden />
                      <UserAvatar user={r.professional} className="h-6 w-6" iconSize={12} />
                      <p className="truncate text-xs text-gray-500">
                        {r.professional?.displayName || r.professional?.name || `Pro #${r.professional?.id || '?'}`}
                      </p>
                    </div>

                    <p className="mt-1 flex items-center gap-1.5 text-xs text-gray-500">
                      <Calendar className="h-3.5 w-3.5 shrink-0" aria-hidden />
                      {formatDateFr(r.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StarRating value={r.rating} size="sm" />
                    {r.isHidden ? (
                      <Tooltip content="Rétablir l'avis">
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          className="text-primary-600 hover:bg-mint-100"
                          onClick={() => setConfirm({ item: r, action: 'show' })}
                          aria-label="Rétablir l'avis"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Tooltip>
                    ) : (
                      <Tooltip content="Masquer l'avis">
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          className="text-rose-600 hover:bg-rose-50"
                          onClick={() => setConfirm({ item: r, action: 'hide' })}
                          aria-label="Masquer l'avis"
                        >
                          <EyeOff className="h-4 w-4" />
                        </Button>
                      </Tooltip>
                    )}
                  </div>
                </div>
                {r.comment && (
                  <blockquote className="mt-3 whitespace-pre-wrap border-l-2 border-primary-400 bg-mint-50 py-2 pl-3 pr-3 text-sm leading-6 text-gray-700">
                    {r.comment}
                  </blockquote>
                )}
              </li>
            ))
          )}
        </ul>
        <Pagination
          page={Number(data?.page || page)}
          pageSize={Number(data?.pageSize || PAGE_SIZE)}
          total={total}
          onPageChange={changePage}
          variant="summary"
          className="mt-4"
        />
      </>
    </DataState>
  );

  return (
    <AdminSectionLayout
      rightContainer={rightContainer}
      total={total}
      noun="Avis"
      dirty={dirty}
      filters={renderFilters}
      searchId="rev-search"
    >
      {list}

      <AdminConfirmModal
        open={Boolean(confirm)}
        onCancel={() => setConfirm(null)}
        onConfirm={apply}
        danger={confirm?.action === 'hide'}
        title={confirm?.action === 'hide' ? 'Masquer cet avis ?' : 'Rétablir cet avis ?'}
        description={
          confirm?.action === 'hide'
            ? "L'avis disparaîtra de la fiche publique."
            : "L'avis sera de nouveau visible sur la fiche du professionnel."
        }
        confirmLabel={confirm?.action === 'hide' ? 'Masquer' : 'Rétablir'}
      />
    </AdminSectionLayout>
  );
}
