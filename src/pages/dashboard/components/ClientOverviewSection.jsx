import { Flag, Phone, Star, User } from 'lucide-react';
import { useAsyncData } from '@/shared/hooks/useAsyncData.js';
import { Skeleton } from '@/shared/components/ui/Skeleton.jsx';
import { getMyReviews } from '@/features/reviews/services/reviews.service.js';
import { getMyContacts } from '@/features/contacts/services/contacts.service.js';

/**
 * Vue d'ensemble du compte client.
 *
 * Elle ne duplique pas les sections : elle les rend atteignables et dit en un
 * coup d'œil ce que le compte contient. Les compteurs servent de raccourci —
 * « 4 avis » évite d'ouvrir la section pour le découvrir.
 */
export function ClientOverviewSection({ user, onNavigate }) {
  // `pageSize: 1` suffit : seul `total` est lu, inutile de rapatrier les avis.
  const { data, loading, error } = useAsyncData(async () => {
    const [reviews, contacts] = await Promise.all([
      getMyReviews({ pageSize: 1 }),
      getMyContacts({ pageSize: 1 }),
    ]);
    return {
      reviews: reviews?.total ?? 0,
      contacts: contacts?.total ?? 0,
    };
  }, []);

  const firstName = user?.firstName ?? '';
  const tiles = [
    { id: 'profil', label: 'Mon profil', hint: 'Photo, téléphone, mot de passe', icon: User },
    { id: 'avis', label: 'Mes avis', hint: `${data?.reviews ?? 0} déposé${(data?.reviews ?? 0) > 1 ? 's' : ''}`, icon: Star },
    { id: 'contacts', label: 'Mes contacts', hint: `${data?.contacts ?? 0} professionnel${(data?.contacts ?? 0) > 1 ? 's' : ''}`, icon: Phone },
    { id: 'signalements', label: 'Mes signalements', hint: 'Suivre ou retirer un signalement', icon: Flag },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-extrabold tracking-tight text-gray-900">Vue d'ensemble</h2>
        {firstName && (
          <p className="mt-1 text-sm text-gray-600">
            Bonjour {firstName}, voici ce que contient votre compte.
          </p>
        )}
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2" aria-busy="true">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-md" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {tiles.map(({ id, label, hint, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => onNavigate?.(id)}
              className="group flex cursor-pointer items-center gap-3 rounded-md border border-gray-200 bg-white p-4 text-left transition hover:border-primary-300 hover:bg-primary-50/40 focus-ring"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-gray-100 text-gray-500 transition group-hover:bg-primary-100 group-hover:text-primary-500">
                <Icon size={20} aria-hidden />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-bold text-gray-900">{label}</span>
                <span className="block truncate text-xs text-gray-500">{hint}</span>
              </span>
            </button>
          ))}
        </div>
      )}

      {error && (
        <p className="text-sm text-gray-500">
          Les compteurs n'ont pas pu être chargés, mais les sections restent accessibles.
        </p>
      )}
    </div>
  );
}