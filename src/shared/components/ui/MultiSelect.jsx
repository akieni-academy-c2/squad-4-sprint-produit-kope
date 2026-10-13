import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/shared/utils";
import { FormField } from "./FormField.jsx";
import { toOption, useListboxNavigation, useScrollActiveIntoView } from "./listbox.js";

const controlClasses = (error) =>
  cn(
    "min-h-11 w-full rounded-sm border bg-white px-3.5 py-2 text-base text-gray-900",
    "focus-visible:outline-2 focus-visible:outline-primary-500",
    error ? "is-invalid border-danger-500" : "border-gray-300",
  );

const describedBy = (id, { hint, error }) =>
  error ? `${id}-error` : hint ? `${id}-hint` : undefined;

export function MultiSelect({
  label,
  hint,
  error,
  required,
  options,
  value = [],
  onChange,
  onBlur,
  placeholder = "Choisir…",
  max,
  disabled = false,
  className,
  name,
}) {
  const id = useId();
  const listId = `${id}-list`;
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const listRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [placeAbove, setPlaceAbove] = useState(false);
  const [maxH, setMaxH] = useState(256);

  const normalizedOptions = options.map(toOption);
  const selected = new Set(value);
  const selectedLabels = normalizedOptions
    .filter((o) => selected.has(o.value))
    .map((o) => o.label);
  const limitReached = max !== undefined && value.length >= max;

  const summary =
    selectedLabels.length === 0
      ? null
      : selectedLabels.length > 3
        ? `${selectedLabels.length} sélectionnés`
        : selectedLabels.join(", ");

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false);
        onBlur?.();
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open, onBlur]);


  useScrollActiveIntoView({ open, activeIndex, optionId: `${id}-opt-${activeIndex}` });

  const emit = (nextValues) => {
    const next = new Set(nextValues);
    onChange?.(normalizedOptions.filter((o) => next.has(o.value)).map((o) => o.value));
  };

  const toggle = (optionValue) => {
    if (selected.has(optionValue)) emit(value.filter((v) => v !== optionValue));
    else if (!limitReached) emit([...value, optionValue]);
  };

  const openList = () => {
    const firstSelected = normalizedOptions.findIndex((o) => selected.has(o.value));
    setActiveIndex(firstSelected >= 0 ? firstSelected : 0);
    const rect = triggerRef.current?.getBoundingClientRect();
    if (rect) {
      const spaceBelow = window.innerHeight - rect.bottom - 16;
      const spaceAbove = rect.top - 16;
      const above = spaceAbove > spaceBelow && spaceBelow < 280;
      setPlaceAbove(above);
      setMaxH(Math.max(160, Math.min(256, Math.floor(above ? spaceAbove : spaceBelow))));
    }
    setOpen(true);
  };

  const close = () => {
    setOpen(false);
    onBlur?.();
  };

  const onKeyDown = useListboxNavigation({
    open,
    itemCount: normalizedOptions.length,
    activeIndex,
    setActiveIndex,
    onOpen: openList,
    onClose: close,
    onSelect: (index) => {
      const option = normalizedOptions[index];
      if (option) toggle(option.value);
    },
    disabled,
  });

  return (
    <FormField
      id={id}
      label={label}
      required={required}
      help={hint}
      error={error}
      className={className}
    >
      <div ref={rootRef} className="relative">
        <button
          id={id}
          ref={triggerRef}
          type="button"
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listId}
          aria-activedescendant={open ? `${id}-opt-${activeIndex}` : undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(id, { hint, error })}
          aria-required={required || undefined}
          disabled={disabled}
          onClick={() => (open ? close() : openList())}
          onKeyDown={onKeyDown}
          className={cn(
            controlClasses(error),
            "flex items-center justify-between gap-3 text-left disabled:cursor-not-allowed disabled:opacity-50",
          )}
        >
          <span className={cn("truncate", !summary && "text-gray-400")}>
            {summary ?? placeholder}
          </span>
          <ChevronDown
            aria-hidden="true"
            className={cn(
              "size-4 shrink-0 text-gray-500 transition-transform",
              open && "rotate-180",
            )}
          />
        </button>

        {name &&
          value.map((v) => (
            <input key={String(v)} type="hidden" name={`${name}[]`} value={v} />
          ))}

        {open && (
          <ul
            id={listId}
            ref={listRef}
            role="listbox"
            aria-multiselectable="true"
            aria-label={label}
            style={{ maxHeight: maxH }}
            className={cn(
              "absolute left-0 right-0 z-50 overflow-auto rounded-md border border-gray-200 bg-white p-1.5 shadow-lg",
              placeAbove ? "bottom-full mb-1" : "top-full mt-1",
              // Même animation d'apparition que le menu du header (animate-scale-in).
              "animate-scale-in origin-top motion-reduce:animate-none",
              placeAbove ? "origin-bottom" : "origin-top",
            )}
          >
            {normalizedOptions.map((option, index) => {
              const isSelected = selected.has(option.value);
              const isDisabled = !isSelected && limitReached;
              return (
                <li
                  key={option.value}
                  id={`${id}-opt-${index}`}
                  role="option"
                  aria-selected={isSelected}
                  aria-disabled={isDisabled || undefined}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => !isDisabled && toggle(option.value)}
                  onMouseMove={() => setActiveIndex(index)}
                  className={cn(
                    "flex min-h-10 cursor-pointer items-center gap-3 rounded-sm px-2.5 py-2 text-base",
                    index === activeIndex && "bg-green-50",
                    isDisabled && "cursor-not-allowed opacity-45",
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "flex size-5 shrink-0 items-center justify-center rounded border",
                      isSelected
                        ? "border-green-700 bg-green-700 text-white"
                        : "border-gray-200 bg-white",
                    )}
                  >
                    {isSelected && (
                      <Check className="size-3.5" strokeWidth={3} />
                    )}
                  </span>
                  <span className="flex-1">{option.label}</span>
                </li>
              );
            })}
            {max !== undefined && (
              <li
                role="presentation"
                className="px-2.5 pt-1.5 pb-1 text-xs text-gray-500"
                aria-live="polite"
              >
                {value.length} / {max} sélectionnés
              </li>
            )}
          </ul>
        )}
      </div>
    </FormField>
  );
}