import { useId } from 'react';
import { RadioGroup, Radio } from './RadioGroup.jsx';
import { cn } from '@/shared/utils';

function Stars({ count = 5, value = 0, onChange, size = 'md', readOnly = false }) {
  const items = Array.from({ length: count }, (_, i) => i + 1);
  const sizing = {
    sm: 'w-3.5 h-3.5',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  }[size] || 'w-5 h-5';
  const reactId = useId();
  const groupName = `stars-${reactId.replace(/:/g, '')}`;

  if (readOnly || !onChange)
    return (
      <div className="flex items-center gap-0.5 hover:scale-110 transition-all duration-300" aria-label={`Note ${value} sur ${count}`}>
        {items.map((n) => {
          const filled = n <= Math.round(value || 0);
          return (
            <Star key={n} filled={filled} half={!filled && n - 0.5 <= value} className={sizing} />
          );
        })}
      </div>
    );


  return (
    <RadioGroup
      name={groupName}
      value={value}
      onChange={onChange}
      className="flex flex-row items-center gap-1"
    >
      {items.map((n) => (
        <Radio
          key={n}
          value={n}
          label={null}
          className="!p-0 !bg-transparent !ring-0 gap-0!"
          aria-label={`${n} étoile${n > 1 ? 's' : ''}`}
        >
          <Star filled={n <= value} className={cn(sizing, 'cursor-pointer')} />
        </Radio>
      ))}
    </RadioGroup>
  );
}

function Star({ filled, half, className }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={cn('shrink-0', className)}
    >
      <defs>
        <linearGradient id="kop-star-half">
          <stop offset="50%" stopColor="#f59e0b" />
          <stop offset="50%" stopColor="#e5e7eb" />
        </linearGradient>
      </defs>
      <path
        d="M12 2.5l2.9 6.3 6.9.7-5.2 4.7 1.5 6.8L12 17.6 5.9 21l1.5-6.8L2.2 9.5l6.9-.7L12 2.5z"
        fill={filled ? '#f59e0b' : half ? 'url(#kop-star-half)' : '#e5e7eb'}
        stroke={filled ? '#d97706' : '#d1d5db'}
        strokeWidth="1"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export const StarRating = ({ value, size = 'md', count = 5, readOnly = true }) => (
  <Stars value={value} size={size} count={count} readOnly={readOnly} />
);

export const StarInput = ({ value, onChange, size = 'lg', count = 5 }) => (
  <Stars value={value} onChange={onChange} size={size} count={count} readOnly={false} />
);
