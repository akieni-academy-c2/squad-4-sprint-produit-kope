import { Card } from "@/shared/components/ui/Card.jsx";

export function ProfileSection({ title, description, children }) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-base font-bold text-gray-900">{title}</h3>
      </div>
      {description && (
        <p className="mt-1 text-sm text-gray-500">{description}</p>
      )}
      <div className="mt-3">{children}</div>
    </Card>
  );
}

export function ProfileRow({ label, value }) {
  return (
    <div className="grid grid-cols-[140px_minmax(0,1fr)] gap-4 py-1.5">
      <dt className="text-sm text-gray-500">{label}</dt>
      <dd className="text-sm font-semibold text-gray-900">{value || "-"}</dd>
    </div>
  );
}
