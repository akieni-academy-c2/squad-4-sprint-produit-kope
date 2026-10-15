import { cn } from "@/shared/utils";

export function Checkbox({ className, label, id, error, ...rest }) {
  return (
    <label
      htmlFor={id}
      className={cn(
        "flex cursor-pointer select-none items-start gap-3 rounded-md p-1 text-sm text-gray-700 transition hover:bg-gray-50",
        className,
      )}
    >
      <input
        id={id}
        type="checkbox"
        className={cn(
          "mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300 text-primary-600 focus-ring",
          error && "border-danger-500",
        )}
        {...rest}
      />
      {typeof label === "string" ? (
        <span className="leading-5">{label}</span>
      ) : (
        label
      )}
    </label>
  );
}
