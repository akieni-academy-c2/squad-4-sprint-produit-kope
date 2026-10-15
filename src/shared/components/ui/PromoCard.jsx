import { Button } from "./Button.jsx";
import { MotifBackdrop } from "./MotifBackdrop.jsx";
import { cn } from "@/shared/utils";

export function PromoCard({
  title,
  text,
  action,
  onAction,
  seed = 1,
  id,
  className,
}) {
  return (
    <div
      id={id}
      className={cn(
        "relative overflow-hidden rounded-lg border border-primary-700 bg-linear-to-br from-primary-500 to-primary-700 p-5 shadow-lg",
        className,
      )}
    >
      <MotifBackdrop
        seed={seed}
        count={16}
        className="pointer-events-none absolute inset-0 h-full w-full"
      />

      <div className="relative flex flex-col gap-4">
        <div className="space-y-1.5">
          <h2 className="text-lg font-bold text-white">{title}</h2>
          <p className="text-sm leading-6 text-white/80">{text}</p>
        </div>

        <Button
          variant="inverse"
          size="lg"
          className="w-full"
          onClick={onAction}
        >
          {action}
        </Button>
      </div>
    </div>
  );
}
