import { createContext, useContext, useId } from "react";
import { cn } from "@/shared/utils";

const RadioGroupContext = createContext(null);

export function RadioGroup({ name, value, onChange, children, className }) {
  const autoName = useId();
  const groupName = name || `radio-${autoName}`;
  const ctx = { name: groupName, value, onChange };
  return (
    <div role="radiogroup" className={className}>
      <RadioGroupContext.Provider value={ctx}>
        {children}
      </RadioGroupContext.Provider>
    </div>
  );
}

export function Radio({ value, label, className, children, ...rest }) {
  const ctx = useContext(RadioGroupContext);
  if (!ctx) throw new Error("Radio must be used inside <RadioGroup>");
  const id = `radio-${ctx.name}-${String(value)}`;
  const checked = ctx.value === value;
  return (
    <label
      htmlFor={id}
      className={cn(
        "flex cursor-pointer select-none items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-50",
        checked && "bg-primary-50 text-primary-800 ring-1 ring-primary-200",
        className,
      )}
    >
      <input
        id={id}
        type="radio"
        name={ctx.name}
        value={value}
        checked={checked}
        onChange={() => ctx.onChange?.(value)}
        className={
          children
            ? "sr-only"
            : "h-4 w-4 border-gray-300 text-primary-600 focus-ring"
        }
        {...rest}
      />
      {children ?? <span>{label}</span>}
    </label>
  );
}
