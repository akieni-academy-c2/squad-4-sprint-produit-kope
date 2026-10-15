import { useState } from "react";

export function useAdminFilters(initial = {}) {
  const [draft, setDraft] = useState(initial);
  const [applied, setApplied] = useState(initial);

  const dirty = Object.keys(initial).some(
    (key) => String(draft[key] ?? "") !== String(initial[key] ?? ""),
  );

  const set = (key, value, { immediate = false } = {}) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
    if (immediate) setApplied((prev) => ({ ...prev, [key]: value }));
  };

  const submit = (event) => {
    event?.preventDefault();
    setApplied({ ...draft });
  };

  const reset = () => {
    setDraft(initial);
    setApplied(initial);
  };

  return { draft, applied, dirty, set, submit, reset };
}
