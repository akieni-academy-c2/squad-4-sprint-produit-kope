import { cn } from '@/shared/utils';
import { FIELD_STATUS } from '@/shared/hooks/useFieldStatus.js';
import { Input } from './Input.jsx';
import { Textarea } from './Textarea.jsx';
import { CustomSelect } from './CustomSelect.jsx';
import { FieldStatusLine, PasswordRules } from './FieldStatus.jsx';

const FIELD_LABEL = 'block text-sm font-medium text-gray-700 mb-1.5';
const FIELD_HELP = 'mt-1 text-xs text-gray-500';
const FIELD_ERROR = 'mt-1 text-xs text-danger-500';

const COMPONENT = { input: Input, textarea: Textarea, select: CustomSelect };

export function FormField({
  id,
  label,
  help,
  error,
  as = 'input',
  className,
  children,
  required,
  counter,
  /** État de saisie renvoyé par `useFieldStatus` : { status, missing, total }. */
  liveStatus,
  /** Règles de mot de passe annotées par `checkPassword`. */
  passwordRules,
  ...rest
}) {
  const Control = COMPONENT[as] || Input;
  const errorId = error ? `${id}-error` : undefined;
  const helpId = help ? `${id}-help` : undefined;
  const describedBy = [errorId, helpId].filter(Boolean).join(' ') || undefined;

  // Une valeur saisie et valide colore l'input en vert ; l'erreur reste prioritaire.
  const valid = !error && liveStatus?.status === FIELD_STATUS.OK;

  return (
    <div className={cn('space-y-0', className)}>
      {label && (
        <label htmlFor={id} className={FIELD_LABEL}>
          {label} {required && <span className="text-danger-500">*</span>}
        </label>
      )}
      {children ? (
        children
      ) : (
        <Control id={id} error={error} success={valid} aria-describedby={describedBy} {...rest} />
      )}
      {counter && (
        <div className="mt-0.5 text-right text-[11px] text-gray-400">{counter}</div>
      )}
      {help && <p id={helpId} className={FIELD_HELP}>{help}</p>}
      {/* Le mot de passe porte son propre retour : pas de ligne d'état en plus. */}
      {passwordRules ? (
        <PasswordRules rules={passwordRules} />
      ) : (
        liveStatus && <FieldStatusLine {...liveStatus} hint={help} />
      )}
      {error && <p id={errorId} role="alert" className={FIELD_ERROR}>{error}</p>}
    </div>
  );
}
