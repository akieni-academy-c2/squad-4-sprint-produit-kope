import { useEffect, useState } from "react";

export function useDelayedFlag(value, delayMs = 200) {
  const [elapsed, setElapsed] = useState(false);
  const [tracked, setTracked] = useState(value);

  if (value !== tracked) {
    setTracked(value);
    setElapsed(false);
  }

  useEffect(() => {
    if (!value) return undefined;

    const timer = setTimeout(() => setElapsed(true), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return Boolean(value) && elapsed;
}
