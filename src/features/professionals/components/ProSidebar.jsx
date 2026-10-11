import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button.jsx';
import { Card } from '@/shared/components/ui/Card.jsx';
import { SidebarNav } from '@/shared/components/ui/SidebarNav.jsx';
import { UserAvatar } from '@/shared/components/ui/UserAvatar.jsx';
import { ROUTES, PROFILE_STATUS } from '@/shared/lib/constants.js';

export function ProSidebar({ user, profile, displayName, items, active, onChange }) {
  const isPublished = profile?.status === PROFILE_STATUS.PUBLISHED;
  const publicId = user?.id || profile?.userId || profile?.id || '0';

  return (
    <aside className="space-y-6 lg:sticky lg:top-(--header-height) lg:self-start">
      <Card className="overflow-hidden p-0">
        <div className="bg-gradient-to-r from-primary-50 to-kop-mint/60 p-5 pb-4">
          <div className="flex items-center gap-4">
            <UserAvatar user={user} src={profile?.avatarUrl ?? undefined} name={displayName} className="h-14 w-14" />
            <div className="min-w-0">
              <p className="truncate font-semibold text-gray-900">{displayName}</p>
              <p className="text-xs text-gray-500">{profile?.tradeName || 'Professionnel'}</p>
            </div>
          </div>
        </div>
        <div className="px-5 py-4">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Statut</p>
          <p className="mt-1 text-sm font-semibold capitalize text-gray-900">{profile?.status ?? '-'}</p>
        </div>
      </Card>

      <div className="hidden lg:block">
        <SidebarNav items={items} active={active} onChange={onChange} ariaLabel="Navigation de l'espace pro" />
      </div>

      {isPublished && (
        <Button
          as={Link}
          to={ROUTES.PROFESSIONAL(publicId)}
          variant="secondary"
          size="md"
          className="w-full"
        >
          Voir ma fiche publique <ChevronRight size={16} className="inline" aria-hidden />
        </Button>
      )}
    </aside>
  );
}