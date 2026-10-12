import { SidebarNav } from '@/shared/components/ui/SidebarNav.jsx';
import { BecomeProCard } from './BecomeProCard.jsx';

export function ClientDashboardSidebar({ items, active, onChange }) {
  return (
    <div className="hidden lg:sticky lg:top-(--header-height) lg:col-start-1 lg:row-start-1 lg:block lg:self-start lg:space-y-6">
      <aside>
        <SidebarNav
          items={items}
          active={active}
          onChange={onChange}
          ariaLabel="Navigation du profil"
        />
      </aside>
      <BecomeProCard />
    </div>
  );
}