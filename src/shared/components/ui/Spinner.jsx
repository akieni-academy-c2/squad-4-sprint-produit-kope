import { cn } from "@/shared/utils";

const SIZES = {
  xs: "h-3 w-3 border-2",
  sm: "h-4 w-4 border-2",
  md: "h-5 w-5 border-3",
  lg: "h-8 w-8 border-4",
};

export function Spinner({ size = "md", className }) {
  return (
    <span
      role="status"
      aria-label="Chargement"
      className={cn(
        "inline-block shrink-0 animate-spin rounded-full border-gray-200 border-t-primary-600",
        SIZES[size] || SIZES.md,
        className,
      )}
    />
  );
}
