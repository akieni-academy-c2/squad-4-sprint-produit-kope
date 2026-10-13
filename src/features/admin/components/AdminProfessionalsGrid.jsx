import { useCallback, useState } from 'react';
import { CustomSelect, DataState, Pagination, SearchInput } from '@/shared/components/ui';
import {
  AdminFilterField,
  AdminFilterGroup,
  AdminFilterPanel,
  AdminSectionLayout,
} from './AdminSectionLayout.jsx';
import { AdminConfirmModal } from './AdminConfirmModal.jsx';
import { AdminProfessionalCard } from './professionals/AdminProfessionalCard.jsx';
import { SORT_OPTIONS, STATUS_OPTIONS } from './professionals/professionalFilters.js';
import { useAdminPage } from '../hooks/useAdminPage.js';
import { useAdminFilters } from '../hooks/useAdminFilters.js';
import { useAdminList } from '../hooks/useAdminList.js';
import { useNotification } from '@/shared/context/NotificationContext.jsx';
import { listPros, setProHidden } from '../services/admin.service.js';
import { CITIES, DEFAULT_CITY } from '@/shared/lib/constants.js';

const PAGE_SIZE = 100;

export function AdminProfessionalsGrid({ rightContainer = null, initialFilters = {} }) {
  const { toast } = useNotification();
  const [page, changePage, setPage] = useAdminPage();
  const { draft, applied, dirty, set, submit, reset } = useAdminFilters({
    query: '',
    status: '',
    sort: 'name',
    city: DEFAULT_CITY,
    ...initialFilters,
  });
  const [confirm, setConfirm] = useState(null);

  const fetchList = useCallback(
    () =>
      listPros({
        page,
        pageSize: PAGE_SIZE,
        query: applied.query,
        status: applied.status,
        sort: applied.sort,
        city: applied.city,
      }),
    [page, applied.query, applied.status, applied.sort, applied.city],
  );
  const { data, loading, error, reload } = useAdminList(fetchList);

  const apply = async () => {
    if (!confirm) return;
    try {
      await setProHidden(confirm.item.userId || confirm.item.id, confirm.action === 'hide');
      toast({
        message: confirm.action === 'hide' ? 'Profil masqué.' : 'Profil réactivé.',
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

  const renderFilters = (searchId) => (
    <AdminFilterPanel dirty={dirty} onReset={resetFilters}>
      <form onSubmit={applyFilters} className="divide-y divide-gray-100">
        <AdminFilterGroup title="Recherche">
          <SearchInput
            id={searchId}
            value={draft.query}
            onChange={(e) => set('query', e.target.value)}
            onClear={() => set('query', '')}
            placeholder="Nom, métier, téléphone..."
            aria-label="Rechercher un professionnel"
          />
        </AdminFilterGroup>

        <AdminFilterGroup title="Statut">
          <CustomSelect
            value={draft.status}
            onChange={(v) => {
              set('status', v, { immediate: true });
              setPage(1);
            }}
            options={STATUS_OPTIONS}
            className="w-full"
            aria-label="Filtrer par statut"
          />
        </AdminFilterGroup>

        <AdminFilterGroup title="Localisation">
          <AdminFilterField label="Ville">
            <CustomSelect
              value={draft.city}
              onChange={(v) => {
                set('city', v, { immediate: true });
                setPage(1);
              }}
              options={CITIES.map((c) => ({ value: c, label: c }))}
              className="w-full"
              aria-label="Filtrer par ville"
            />
          </AdminFilterField>
        </AdminFilterGroup>

        <AdminFilterGroup title="Trier par">
          <CustomSelect
            value={draft.sort}
            onChange={(v) => set('sort', v, { immediate: true })}
            options={SORT_OPTIONS}
            className="w-full"
            aria-label="Trier"
          />
        </AdminFilterGroup>
      </form>
    </AdminFilterPanel>
  );

  const total = Number(data?.total || 0);
  const pros = data?.items || [];

  const cards = (
    <DataState loading={loading} error={error}>
      <>
        <ul className="space-y-3">
          {pros.length === 0 ? (
            <li className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-sm text-gray-500">
              Aucun résultat.
            </li>
          ) : (
            pros.map((pro) => (
              <AdminProfessionalCard
                key={pro.userId || pro.id}
                pro={pro}
                onToggleVisibility={(item, action) => setConfirm({ item, action })}
              />
            ))
          )}
        </ul>

        <Pagination
          page={Number(data?.page || page)}
          pageSize={Number(data?.pageSize || PAGE_SIZE)}
          total={total}
          onPageChange={changePage}
          variant="summary"
          className="mt-4 border border-gray-200 px-4 py-2 rounded-md bg-white"
        />
      </>
    </DataState>
  );

  return (
    <AdminSectionLayout
      rightContainer={rightContainer}
      total={total}
      noun="Professionnel"
      dirty={dirty}
      filters={renderFilters}
      searchId="pro-search"
    >
      {cards}

      <AdminConfirmModal
        open={Boolean(confirm)}
        onCancel={() => setConfirm(null)}
        onConfirm={apply}
        danger={confirm?.action === 'hide'}
        title={confirm?.action === 'hide' ? 'Masquer le profil ?' : 'Réactiver le profil ?'}
        description={
          confirm?.action === 'hide'
            ? 'Le profil disparaîtra des recherches et de la fiche publique. Vous pouvez le réactiver à tout moment.'
            : 'Le profil sera à nouveau visible dans les recherches et sa fiche publique sera rouverte.'
        }
        confirmLabel={confirm?.action === 'hide' ? 'Masquer' : 'Réactiver'}
      />
    </AdminSectionLayout>
  );
}