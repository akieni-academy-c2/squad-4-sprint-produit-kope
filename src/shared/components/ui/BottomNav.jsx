import { useState } from "react";
import { Menu } from "lucide-react";
import { cn } from "@/shared/utils";
import { Link } from "@/shared/components/ui/Link.jsx";
import { Sheet } from "./Sheet.jsx";

const MAX_CELLS = 5;

/**
 * Une entrée de navigation. Devient un lien dès qu'elle porte un `href`, et
 * reste un bouton pour les entrées `isAction`, qui déclenchent une modale plutôt
 * qu'une navigation - un `<Link>` serait alors faux.
 */
function NavCell({ item, active, onSelect, className, iconSize, showLabel }) {
  const { id, label, shortLabel, href, icon: Icon, isAction } = item;
  const isLink = href != null && !isAction;
  const isCurrent = !isAction && active === id;

  const body = (
    <>
      <Icon size={iconSize} aria-hidden />
      {showLabel ? (
        <span className="truncate">{label}</span>
      ) : (
        <span className="w-full truncate text-center">
          {shortLabel || label}
        </span>
      )}
    </>
  );

  if (isLink)
    return (
      <Link
        href={href}
        aria-current={isCurrent ? "page" : undefined}
        onClick={() => onSelect(id)}
        className={className}
      >
        {body}
      </Link>
    );

  return (
    <button
      type="button"
      aria-current={isCurrent ? "page" : undefined}
      onClick={() => onSelect(id)}
      className={className}
    >
      {body}
    </button>
  );
}

export function BottomNav({ items, active, onChange, ariaLabel }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const hasOverflow = items.length > MAX_CELLS;
  const visibleCount = hasOverflow ? MAX_CELLS - 1 : items.length;
  const visibleItems = items.slice(0, visibleCount);
  const overflowItems = items.slice(visibleCount);
  const overflowActive = overflowItems.some((item) => item.id === active);

  const select = (id) => {
    onChange?.(id);
    setMenuOpen(false);
  };

  const cellClass = (current) =>
    cn(
      "flex w-full cursor-pointer items-center gap-3 rounded-sm border text-sm font-semibold transition",
      current
        ? "border-gray-200 bg-gray-100 text-gray-900"
        : "border-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900",
    );

  const barClass = (current) =>
    cn(
      "flex w-full cursor-pointer flex-col items-center gap-1 px-0.5 py-2.5 text-[10px] font-semibold transition",
      current
        ? "bg-primary-50 text-primary-500"
        : "text-gray-500 hover:bg-primary-50 hover:text-primary-500",
    );

  return (
    <>
      <nav
        aria-label={ariaLabel}
        className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-2px_10px_rgba(0,0,0,0.06)] backdrop-blur-sm lg:hidden"
      >
        <ul className="flex">
          {visibleItems.map((item) => (
            <li key={item.id} className="min-w-0 flex-1">
              <NavCell
                item={item}
                active={active}
                onSelect={select}
                iconSize={20}
                showLabel={false}
                className={barClass(!item.isAction && active === item.id)}
              />
            </li>
          ))}
          {hasOverflow && (
            <li className="min-w-0 flex-1">
              <button
                type="button"
                aria-haspopup="dialog"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen(true)}
                className={barClass(overflowActive)}
              >
                <Menu size={20} aria-hidden />
                <span className="w-full truncate text-center">Menu</span>
              </button>
            </li>
          )}
        </ul>
      </nav>

      {hasOverflow && (
        <Sheet open={menuOpen} onOpenChange={setMenuOpen} side="bottom">
          <p className="mb-3 pr-10 text-sm font-bold uppercase tracking-[0.08em] text-gray-500">
            Sections supplémentaires
          </p>
          <ul className="flex flex-col gap-1">
            {overflowItems.map((item) => (
              <li key={item.id}>
                <NavCell
                  item={item}
                  active={active}
                  onSelect={select}
                  iconSize={18}
                  showLabel
                  className={cn(
                    cellClass(!item.isAction && active === item.id),
                    "rounded-xl px-3 py-3",
                  )}
                />
              </li>
            ))}
          </ul>
        </Sheet>
      )}
    </>
  );
}
