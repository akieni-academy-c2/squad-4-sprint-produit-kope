import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * `clsx` accepte les formes conditionnelles, `twMerge` résout les conflits.
 * Sans lui, le gagnant se décide par l'ordre interne du CSS généré.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatPhoneFR(value) {
  if (!value) return '';
  const digits = String(value).replace(/\D/g, '');
  if (digits.startsWith('242') && digits.length >= 12)
    return `+242 ${digits.slice(3, 5)} ${digits.slice(5, 8)} ${digits.slice(8, 10)} ${digits.slice(10)}`;

  if (digits.length === 10)
    return `${digits.slice(0, 2)} ${digits.slice(2, 4)} ${digits.slice(4, 6)} ${digits.slice(6, 8)} ${digits.slice(8)}`;

  return value;
}

export function toWhatsappUrl(phone) {
  if (!phone) return null;
  const digits = String(phone).replace(/\D/g, '');
  return `https://wa.me/${digits}`;
}

/**
 * La première construction charge les données de locale, les suivantes
 * reparsent les options : appelé par élément, le formateur est construit une fois.
 */
let dateFormatter = null;

function frDateTime() {
  dateFormatter ??= new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  return dateFormatter;
}

export function formatDateFr(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return frDateTime().format(date);
}

/** Sur une publication l'heure n'apporte rien : seules ces parties sont gardées. */
const DATE_PARTS = new Set(['day', 'month', 'year']);

/** Même formateur mis en cache, filtré sur les parties de date. */
export function formatDateFrShort(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return frDateTime()
    .formatToParts(date)
    .filter((part) => DATE_PARTS.has(part.type))
    .map((part) => part.value)
    .join(' ');
}

export function fullNameInitials(firstName, lastName) {
  const first = firstName?.trim() || '';
  const last = lastName?.trim() || '';
  const lastInitial = last ? `${last[0].toUpperCase()}.` : '';
  return [first, lastInitial].filter(Boolean).join(' ');
}

export function truncate(text, max = 120) {
  if (!text) return '';
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trim()}…`;
}
