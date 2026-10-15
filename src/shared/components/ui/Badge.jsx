import { cn } from "@/shared/utils";

const VARIANTS = {
  success: "bg-available-50 text-available-500 ring ring-[#bdd8c6]",
  warning: "bg-unavailable-50 text-unavailable-500 ring ring-[#f1df91]",
  danger: "bg-danger-50 text-danger-500 ring ring-rose-200",
  info: "bg-sky-50 text-sky-700 ring ring-sky-200",
  primary: "bg-primary-500 text-white ring ring-primary-500",
  neutral: " text-gray-700 ring ring-gray-400/60",
  white: "bg-white text-gray-700 ring ring-gray-200",
};

const SIZES = {
  sm: "text-[11px] px-2.5 py-1 font-semibold tracking-wide",
  md: "text-xs px-3 py-1.5 font-semibold tracking-wide",
};

export function Badge({
  variant = "neutral",
  size = "md",
  className,
  children,
  ...rest
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-medium leading-none rounded-full",
        VARIANTS[variant] || VARIANTS.neutral,
        SIZES[size] || SIZES.md,
        className,
      )}
      {...rest}
    >
      {children}
    </span>
  );
}
