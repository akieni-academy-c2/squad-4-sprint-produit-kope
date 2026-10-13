import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const AuthModalContext = createContext(null);

export function AuthModalProvider({ children }) {
  const [mode, setMode] = useState(null);

  // `m ?? null` et non `setMode` nu : passé tel quel, `open` aurait accepté une
  // fonction de mise à jour, que React interpréterait comme un état précédent -
  // `open(mode => mode)` aurait renvoyé le mode courant au lieu de le poser.
  const open = useCallback((m) => setMode(m ?? null), []);
  const close = useCallback(() => setMode(null), []);

  const value = useMemo(() => ({ mode, open, close }), [mode, open, close]);
  return <AuthModalContext.Provider value={value}>{children}</AuthModalContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuthModal() {
  const ctx = useContext(AuthModalContext);
  if (!ctx) throw new Error('useAuthModal must be used inside <AuthModalProvider>');
  return ctx;
}