import { useState, useCallback } from 'react';

export function useFormValidation<T extends Record<string, unknown>>(
    initialValues: T,
    validate: (values: T) => Partial<Record<keyof T, string>>
) {
    const [values, setValues] = useState<T>(initialValues);
    const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
    const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});

    const handleChange = useCallback((field: keyof T, value: unknown) => {
        setValues(prev => ({ ...prev, [field]: value }));
    }, []);

    const handleBlur = useCallback((field: keyof T) => {
        setTouched(prev => ({ ...prev, [field]: true }));
        const newErrors = validate(values);
        setErrors(newErrors);
    }, [values, validate]);

    const handleSubmit = useCallback((onSubmit: (values: T) => void) => {
        const newErrors = validate(values);
        setErrors(newErrors);

        const allTouched = Object.keys(values).reduce((acc, key) => {
            acc[key as keyof T] = true;
            return acc;
        }, {} as Record<keyof T, boolean>);
        setTouched(allTouched);

        if (Object.keys(newErrors).length === 0) {
            onSubmit(values);
        }
    }, [values, validate]);

    const reset = useCallback(() => {
        setValues(initialValues);
        setErrors({});
        setTouched({});
    }, [initialValues]);

    return {
        values,
        errors,
        touched,
        handleChange,
        handleBlur,
        handleSubmit,
        reset,
        isValid: Object.keys(errors).length === 0,
    };
}
