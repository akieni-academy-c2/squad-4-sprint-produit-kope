import { motion } from 'motion/react';
import { SPRING } from '@/shared/motion/timing.js';
import { cn } from '@/shared/utils';


export function IconButton({
  icon: Icon,
  label,
  onClick,
  disabled = false,
  className,
  tone = 'default',
  title,
}) {
  return (
    <motion.button
      type="button"
      whileHover={disabled ? undefined : { scale: 1.04 }}
      whileTap={disabled ? undefined : { scale: 0.9 }}
      transition={SPRING.press}
      onClick={onClick}
      disabled={disabled}
      title={title ?? label}
      aria-label={label}
      className={cn(
        'inline-flex cursor-pointer items-center justify-center rounded p-1.5 transition-colors focus-ring',
        disabled && 'cursor-not-allowed opacity-50',
        TONES[tone] ?? TONES.default,
        className,
      )}
    >
      <Icon size={16} aria-hidden />
    </motion.button>
  );
}

const TONES = {
  default:
    'text-gray-600 hover:bg-white hover:text-primary-600 disabled:hover:bg-transparent disabled:hover:text-gray-600',
  danger: 'text-gray-500 hover:bg-white hover:text-danger-500 disabled:hover:bg-transparent',
  report:
    'text-gray-600 hover:bg-white hover:text-danger-500 disabled:hover:bg-transparent disabled:hover:text-gray-600',
};
