import { cn } from "@/shared/utils";

export function Textarea({ className, error, success, id, ...rest }) {
  return (
    <textarea
      id={id}
      className={cn(
        "block w-full rounded-sm border bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 shadow-sm transition-colors focus-ring focus:outline-none disabled:bg-gray-100",
        error
          ? "is-invalid border-danger-500 focus:border-danger-500"
          : success
            ? "is-valid border-emerald-500 focus:border-emerald-500 bg-emerald-50/30"
            : "border-gray-300 focus:border-primary-500",
        className,
      )}
      {...(error
        ? { "aria-invalid": "true", "aria-describedby": `${id}-error` }
        : {})}
      {...rest}
    />
  );
}
