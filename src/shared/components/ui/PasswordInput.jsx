import { useState } from 'react';
import { Lock, LockOpen } from 'lucide-react';
import { Input } from './Input.jsx';

/**
 * Champ de mot de passe avec bascule de visibilité. Factorise le bouton
 * « œil », qui était recopié dans chaque formulaire.
 */
export function PasswordInput({ id, value, onChange, error, success, ...rest }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <Input
        id={id}
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        error={error}
        success={success}
        {...rest}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
        aria-pressed={visible}
        className="absolute right-0 top-1/2 -translate-y-1/2 cursor-pointer"
      >
        {visible ? (
          <LockOpen size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-500" aria-hidden />
        ) : (
          <Lock size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden />
        )}
      </button>
    </div>
  );
}