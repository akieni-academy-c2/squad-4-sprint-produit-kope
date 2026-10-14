import { useState } from 'react';
import { validateFrontend } from '@/shared/utils/validators.js';
import { FIELD_STATUS } from './useFieldStatus.js';

const sameValue = (a, b) => {
  if (Array.isArray(a) && Array.isArray(b))
    return a.length === b.length && a.every((v, i) => String(v) === String(b[i]));
  return String(a ?? '') === String(b ?? '');
};



const optionalFieldsCache = new WeakMap();

function optionalFields(schema, fields) {
  let cache = optionalFieldsCache.get(schema);
  if (!cache) {
    cache = new Set();
    optionalFieldsCache.set(schema, cache);
  }
  fields.forEach((field) => {
    if (!cache.has(field) && schema.shape[field].safeParse(undefined).success) cache.add(field);
  });
  return cache;
}

export function evaluateForm(schema, values, initial = values, { ignore = [], rules = {}, wrongOn = {} } = {}) {
  if (!schema) return { ready: true, dirty: false, statuses: {}, errors: {} };

  const { success, errors } = validateFrontend(schema, values);
  const fields = Object.keys(schema.shape).filter((f) => !ignore.includes(f));
  const optional = optionalFields(schema, fields);

  const statuses = {};
  for (const field of fields) {
    const raw = values[field];

    if (typeof raw === 'boolean' || raw == null || String(raw).trim() === '') {
      statuses[field] = FIELD_STATUS.IDLE;
      continue;
    }
    if (rules[field]) {
      const missing = rules[field].filter((r) => !r.test(String(raw))).length;
      statuses[field] = missing === 0 ? FIELD_STATUS.OK : FIELD_STATUS.NEAR;
      continue;
    }
    if (errors[field]) {
      statuses[field] = wrongOn[field]?.(raw) ? FIELD_STATUS.WRONG : FIELD_STATUS.NEAR;
      continue;
    }
    statuses[field] = FIELD_STATUS.OK;
  }

  const ready =
    success &&
    fields.every(
      (f) =>
        statuses[f] === FIELD_STATUS.OK ||
        (statuses[f] === FIELD_STATUS.IDLE && optional.has(f)),
    );

  const dirty = fields.some((f) => !sameValue(values[f], initial[f]));

  return { ready, dirty, statuses, errors };
}


export function useFormReadiness(schema, values, options) {
  const { baseline, ...rest } = options ?? {};

  const [mountedValues] = useState(() => values);

  return evaluateForm(schema, values, baseline ?? mountedValues, rest);
}