export function AdminFilterPanel({ title = 'Filtres', dirty = false, onReset, children }) {
  return (
    <div className="rounded-md border border-gray-200 bg-white p-2">
      <div className="flex items-center justify-between px-2 py-2">
        <h3 className="text-sm font-bold text-gray-900">{title}</h3>
        <button
          type="button"
          onClick={onReset}
          disabled={!dirty}
          className="text-xs font-semibold text-primary-600 transition-colors hover:text-primary-700 disabled:cursor-not-allowed disabled:text-gray-300"
        >
          Réinitialiser
        </button>
      </div>
      {children}
    </div>
  );
}

export function AdminFilterGroup({ title, children }) {
  return (
    <div className="space-y-2 px-2 py-3">
      {title && (
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-400">{title}</p>
      )}
      {children}
    </div>
  );
}

export function AdminFilterField({ label, children }) {
  return (
    <div className="space-y-1.5">
      {label && <label className="block text-xs font-medium text-gray-600">{label}</label>}
      {children}
    </div>
  );
}

import { SectionLayout } from '@/shared/components/ui/SectionLayout.jsx';

export { SectionLayout as AdminSectionLayout };