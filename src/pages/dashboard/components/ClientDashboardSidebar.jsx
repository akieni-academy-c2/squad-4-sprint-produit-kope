import { SidebarNav } from '@/shared/components/ui/SidebarNav.jsx';
import { BecomeProCard } from './BecomeProCard.jsx';
import { STICKY_COLUMN } from '@/shared/lib/constants.js';

export function ClientDashboardSidebar({ items, active, onChange, userId }) {
  return (
    <div className={`hidden ${STICKY_COLUMN} lg:col-start-1 lg:row-start-1 lg:block lg:space-y-6`}>
      <aside>
        <SidebarNav
          items={items}
          active={active}
          onChange={onChange}
          ariaLabel="Navigation du profil"
        />
      </aside>
      <BecomeProCard userId={userId} />
    </div>
  );
}