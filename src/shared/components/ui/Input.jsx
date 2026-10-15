import { cn } from "@/shared/utils";

const BASE =
  "block w-full rounded-sm border bg-white px-4 py-3 text-[14px] text-gray-900 placeholder:text-gray-400 transition-colors focus-ring focus:outline-none disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed";

export function Input({
  className,
  error,
  success,
  id,
  type = "text",
  ...rest
}) {
  return (
    <input
      id={id}
      type={type}
      aria-invalid={Boolean(error) || undefined}
      aria-describedby={error ? `${id}-error` : undefined}
      className={cn(
        BASE,
        error
          ? "is-invalid border-danger-500 focus:border-danger-500 bg-danger-50/30"
          : success
            ? "is-valid border-emerald-500 focus:border-emerald-500 bg-emerald-50/30 hover:border-emerald-500"
            : "border-gray-200 focus:border-primary-500 bg-white hover:border-gray-300",
        className,
      )}
      {...rest}
    />
  );
}
