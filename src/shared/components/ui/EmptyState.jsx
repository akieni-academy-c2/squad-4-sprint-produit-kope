import { Inbox } from "lucide-react";

export function EmptyState({ icon: Icon = Inbox, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-md  border border-dashed border-gray-200 bg-white/60 px-6 py-28 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
        <Icon size={22} aria-hidden />
      </span>
      <p className="mt-4 text-sm font-bold text-gray-900">{title}</p>
      {description && (
        <p className="mt-1 max-w-sm text-[13px] leading-6 text-gray-500">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
