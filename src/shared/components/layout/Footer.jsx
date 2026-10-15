import { cn } from "@/shared/utils";

export function Footer({ className }) {
  const year = new Date().getFullYear();
  return (
    <footer
      className={cn("mt-auto border-t border-gray-200 bg-white", className)}
    >
      <div className="container-kop flex flex-col gap-3 py-6 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between">
        <div>
          © {year} <span className="font-semibold text-gray-700">KOP</span> ·
          Annuaire des artisans du bâtiment du Congo
        </div>
        <div className="flex items-center gap-4">
          <span>Conçu pour Brazzaville</span>
        </div>
      </div>
    </footer>
  );
}
