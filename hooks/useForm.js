import { useState, useCallback } from 'react';

export function useForm({ initialValues, validate }) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setFieldValue = useCallback((field, value) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  }, []);

  const setFieldTouched = useCallback((field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }, []);

  const setFieldErrors = useCallback((newErrors) => {
    setErrors((prev) => ({ ...prev, ...newErrors }));
  }, []);

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  const handleSubmit = useCallback(
    async (submitFn) => {
      // Mark all fields as touched to reveal any remaining errors
      const allTouched = Object.keys(values).reduce(
        (acc, key) => ({ ...acc, [key]: true }),
        {},
      );
      setTouched(allTouched);

      // Validate
      const result = validate(values);

      if (!result.valid) {
        setErrors(result.errors);
        return;
      }

      setErrors({});
      setIsSubmitting(true);

      try {
        await submitFn(values);
      } finally {
        setIsSubmitting(false);
      }
    },
    [values, validate],
  );

  // Only return errors for touched fields
  const visibleErrors = Object.keys(errors).reduce((acc, key) => {
    if (touched[key] && errors[key]) {
      return { ...acc, [key]: errors[key] };
    }
    return acc;
  }, {});

  return {
    values,
    errors: visibleErrors,
    touched,
    isSubmitting,
    setFieldValue,
    setFieldTouched,
    handleSubmit,
    setErrors: setFieldErrors,
    resetForm,
  };
}
