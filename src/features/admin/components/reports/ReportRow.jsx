import { Calendar, Check, Flag, X } from 'lucide-react';
import { Button, UserAvatar } from '@/shared/components/ui';
import { reportReasonLabel, reportStatusLabel } from '@/shared/constants/reports.js';
import { formatDateFr, fullNameInitials } from '@/shared/utils';

const STATUS_BADGES = {
  pending: 'bg-amber-100 text-amber-800',
  resolved: 'bg-mint-100 text-primary-700',
  dismissed: 'bg-gray-100 text-gray-600',
};

export function ReportRow({ report, onResolve, onDismiss }) {
  return (
    <li className="space-y-2 rounded-sm bg-gray-50/80 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-gray-700 ring-1 ring-gray-200">
          <Flag size={11} aria-hidden />
          {reportReasonLabel(report.reason)}
        </span>
        <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${STATUS_BADGES[report.status]}`}>
          {reportStatusLabel(report.status)}
        </span>
      </div>

      {report.message && (
        <p className="whitespace-pre-wrap border-l-2 border-primary-300 pl-3 text-sm leading-6 text-gray-700">
          {report.message}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <UserAvatar user={report.reporter} className="h-5 w-5" iconSize={11} />
          <span className="text-xs text-gray-500">
            {fullNameInitials(report.reporter?.firstName, report.reporter?.lastName) || 'Client'}
          </span>
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <Calendar size={11} aria-hidden />
            {formatDateFr(report.createdAt)}
          </span>
        </div>

        {report.status === 'pending' && (
          <div className="flex gap-1">
            <Button size="icon-sm" variant="ghost" onClick={() => onDismiss(report)} aria-label="Rejeter le signalement">
              <X className="h-3.5 w-3.5 text-rose-600" />
            </Button>
            <Button
              size="icon-sm"
              variant="ghost"
              onClick={() => onResolve(report)}
              aria-label="Marquer le signalement comme traité"
            >
              <Check className="h-3.5 w-3.5 text-primary-600" />
            </Button>
          </div>
        )}
      </div>
    </li>
  );
}