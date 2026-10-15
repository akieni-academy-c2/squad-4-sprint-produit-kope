import { cn } from "@/shared/utils";
import { Spinner } from "./Spinner.jsx";

const VARIANTS = {
  primary:
    "bg-primary-500 text-white hover:bg-primary-600 focus-visible:bg-primary-600 disabled:bg-primary-300 disabled:text-white/80",
  ghost:
    "bg-transparent text-gray-700 hover:bg-gray-100 disabled:text-gray-400",
  danger:
    "bg-danger-500 text-white hover:bg-rose-700 disabled:bg-rose-300 disabled:text-white/80",
  "danger-outline":
    "bg-white border border-rose-200 text-rose-700 hover:bg-rose-50 disabled:text-gray-400 disabled:border-gray-200",
  outline:
    "bg-white border border-gray-300 text-gray-800 hover:bg-gray-50 disabled:text-gray-400 disabled:border-gray-200",
  secondary:
    "bg-white border border-gray-300 text-gray-800 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400",
  subtle:
    "bg-gray-200/20 border border-gray-200 text-gray-700 hover:bg-gray-200/40 hover:text-gray-900 disabled:text-gray-400 disabled:border-gray-200",
  mint: "bg-mint-50 text-primary-700 border border-mint-200 hover:bg-mint-100 disabled:opacity-60",
  dark: "bg-gray-900 text-white hover:bg-gray-800 disabled:bg-gray-300 disabled:text-white/80",
  inverse:
    "bg-white text-primary-700 border border-white hover:bg-white/90 disabled:bg-white/60 disabled:text-primary-400",
};

const SIZES = {
  xs: "h-8 px-2.5 text-[12px] rounded-sm gap-1 font-semibold",
  sm: "h-9 px-3.5 text-sm rounded-sm gap-1.5 font-semibold",
  md: "h-11 px-5 text-sm rounded-sm gap-2 font-semibold",
  lg: "h-[48px] px-[20px] text-[15px] rounded-sm gap-2 font-bold",
  icon: "h-11 w-11 rounded-xl",
  "icon-sm": "h-8 w-8 rounded-sm gap-0 p-0",
};

const PRESS =
  "transition-[color,background-color,border-color,box-shadow,transform] duration-100 ease-out active:scale-[0.97] active:duration-150 disabled:active:scale-100";

export function Button({
  as: As = "button",
  variant = "primary",
  size = "md",
  className,
  loading,
  children,
  disabled,
  type = "button",
  ...rest
}) {
  const isDisabled = Boolean(disabled || loading);
  return (
    <As
      type={As === "button" ? type : undefined}
      disabled={isDisabled}
      aria-busy={Boolean(loading)}
      className={cn(
        "cursor-pointer relative inline-flex select-none items-center justify-center leading-none whitespace-nowrap",
        "focus-ring focus:outline-none",
        PRESS,
        VARIANTS[variant] || VARIANTS.primary,
        SIZES[size] || SIZES.md,
        isDisabled && "cursor-not-allowed opacity-80",
        className,
      )}
      {...rest}
    >
      {loading && <Spinner size="xs" className={children ? "" : "mx-auto"} />}
      {loading ? (
        <span
          className="opacity-0 absolute pointer-events-none"
          aria-hidden="true"
          inert=""
        >
          {children}
        </span>
      ) : (
        children
      )}
    </As>
  );
}
