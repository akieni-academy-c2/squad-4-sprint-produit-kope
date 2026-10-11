import { Activity, BadgeCheck, Clock, Image as ImageIcon, MapPin } from 'lucide-react';
import { Card } from '@/shared/components/ui/Card.jsx';
import { PROFILE_STATUS_LABELS } from '@/shared/lib/constants.js';

function Metric({ label, icon: Icon, children }) {
  return (
    <div className="rounded-sm border border-gray-200 bg-gray-50/60 p-4">
      <dt className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-gray-500">
        <Icon size={14} className="text-primary-500" aria-hidden /> {label}
      </dt>
      <dd className="mt-2 text-2xl font-extrabold text-gray-900">{children}</dd>
    </div>
  );
}

export function OverviewSection({ profile }) {
  const available = Boolean(profile?.isAvailable);

  return (
    <div className="space-y-5">
      <Card className="overflow-hidden">
        <div className="flex items-center gap-3 border-b border-gray-100 bg-gray-50/70 px-5 py-4">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-sm bg-primary-50 text-primary-500">
            <Activity size={18} aria-hidden />
          </span>
          <div>
            <p className="text-sm font-bold text-gray-900">Vue d'ensemble de votre activité</p>
            <p className="text-xs text-gray-500">Les chiffres clés de votre espace pro</p>
          </div>
        </div>

        <dl className="grid grid-cols-2 gap-4 p-5 sm:grid-cols-4">
          <Metric label="Photos" icon={ImageIcon}>
            {profile?.photos?.length ?? 0}
            <span className="ml-1 text-sm font-semibold text-gray-400">/ 10</span>
          </Metric>
          <Metric label="Zones" icon={MapPin}>
            {profile?.zones?.length ?? 0}
          </Metric>
          <div className="rounded-sm border border-gray-200 bg-gray-50/60 p-4">
            <dt className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-gray-500">
              <Clock size={14} className="text-primary-500" aria-hidden /> Disponibilité
            </dt>
            <dd className={`mt-2 text-lg font-bold ${available ? 'text-emerald-600' : 'text-gray-400'}`}>
              {available ? 'Disponible' : 'Indisponible'}
            </dd>
          </div>
          <div className="rounded-sm border border-gray-200 bg-gray-50/60 p-4">
            <dt className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-gray-500">
              <BadgeCheck size={14} className="text-primary-500" aria-hidden /> Statut
            </dt>
            <dd className="mt-2 text-lg font-bold text-gray-900">{PROFILE_STATUS_LABELS[profile?.status] || '-'}</dd>
          </div>
        </dl>
      </Card>
    </div>
  );
}