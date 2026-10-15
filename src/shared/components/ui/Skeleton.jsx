import { cn } from "@/shared/utils";

export function Skeleton({ className }) {
  return (
    <div className={cn("animate-pulse rounded-xl bg-gray-200", className)} />
  );
}
