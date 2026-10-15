import { useCallback, useState } from "react";
import { validateFrontend } from "@/shared/utils/validators.js";

export function useForm(schema, initialValues = {}, onSubmit) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState(null);

  const setField = useCallback((name, value) => {
    setValues((v) => ({ ...v, [name]: value }));
    setErrors((e) => ({ ...e, [name]: undefined }));
    setGlobalError(null);
  }, []);

  const reset = useCallback(
    (next = initialValues) => {
      setValues(next);
      setErrors({});
      setGlobalError(null);
    },
    [initialValues],
  );

  const handleSubmit = useCallback(
    async (event) => {
      event?.preventDefault?.();
      setGlobalError(null);
      const {
        success,
        data,
        errors: fieldErrors,
      } = validateFrontend(schema, values);
      setErrors(fieldErrors || {});
      if (!success) {
        const firstKey = Object.keys(fieldErrors || {})[0];
        if (firstKey && typeof document !== "undefined")
          document
            .querySelector(`[id="${firstKey}"], [name="${firstKey}"]`)
            ?.focus?.();

        return { ok: false };
      }
      setSubmitting(true);
      try {
        const result = await onSubmit?.(data);
        return { ok: true, result };
      } catch (err) {
        if (err?.errors) setErrors((e) => ({ ...e, ...err.errors }));

        if (err?.message) setGlobalError(err.message);
        return { ok: false, error: err };
      } finally {
        setSubmitting(false);
      }
    },
    [schema, values, onSubmit],
  );

  return {
    values,
    errors,
    globalError,
    submitting,
    setField,
    setErrors,
    setGlobalError,
    reset,
    handleSubmit,
  };
}
