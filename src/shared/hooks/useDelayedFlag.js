import { useEffect, useState } from 'react';

/** Un squelette remplacé 80 ms plus tard clignote. Au retour, sans délai. */
export function useDelayedFlag(value, delayMs = 200) {
  const [elapsed, setElapsed] = useState(false);
  const [tracked, setTracked] = useState(value);

  // Ajustement pendant le rendu plutôt qu'en effet : le chargement suivant ne
  // doit pas hériter de l'état « écoulé » du précédent.
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