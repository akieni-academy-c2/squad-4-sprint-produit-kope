import { useSearchParams, useNavigate } from 'react-router-dom';
import { Pagination } from '@/shared/components/ui/Pagination.jsx';
import { ProfessionalCard } from '@/features/professionals/components/ProfessionalCard.jsx';
import { Button } from '@/shared/components/ui/Button.jsx';
import { PAGE_SIZE, ROUTES } from '@/shared/lib/constants.js';

export function SearchResults({ data, listMode = true }) {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const page = Number(data?.page || params.get('page') || 1);

  const onPage = (n) => {
    const next = new URLSearchParams(params);
    next.set('page', String(n));
    setParams(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const widen = () => {
    const next = new URLSearchParams(params);
    next.delete('zone');
    next.set('page', '1');
    navigate(`${ROUTES.SEARCH}?${next.toString()}`);
  };

  if (items.length === 0)
    return (
      <div className=" p-10 sm:p-16 text-center min-h-95 flex flex-col items-center justify-center">
        <div className="mb-5 flex h-24 w-24 items-center justify-center rounded-full bg-mint-100">
          <svg viewBox="0 0 24 24" className="h-10 w-10 text-primary-500" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="7"/>
            <path d="M21 21l-4.3-4.3" />
            <path d="M8 11l1.5 1.5L14 8" />
          </svg>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900">
          Aucun professionnel trouvé
        </h2>
        <p className="mt-3 max-w-md text-base leading-7 text-gray-600">
          Aucun profil ne correspond à ce métier dans ce quartier pour le moment.
          Les quartiers voisins peuvent vous offrir d'autres possibilités.
        </p>
        {params.get('zone') && (
          <div className="mt-6">
            <Button size="md" onClick={widen}>
              Élargir à toute la ville
            </Button>
          </div>
        )}
      </div>
    );

  const cards = listMode ? (
    <ul className="space-y-3 sm:space-y-4">
      {items.map((item) => (
        <li key={item.id}>
          <div className="sm:hidden">
            <ProfessionalCard item={item} mode="grid" />
          </div>
          <div className="hidden sm:block">
            <ProfessionalCard item={item} mode="list" />
          </div>
        </li>
      ))}
    </ul>
  ) : (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <li key={item.id}>
          <ProfessionalCard item={item} mode="grid" />
        </li>
      ))}
    </ul>
  );

  return (
    <div className="space-y-5">
      {cards}
      <Pagination
        page={page}
        pageSize={PAGE_SIZE}
        total={total}
        onPageChange={onPage}
        variant="summary"
      />
    </div>
  );
}
