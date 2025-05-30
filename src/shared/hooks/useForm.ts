'use client';

import { useState, useCallback, useMemo } from 'react';
import { z } from 'zod';

interface UseFormOptions<T extends z.ZodType> {
  schema: T;
  initialValues?: Partial<z.infer<T>>;
  onSubmit?: (data: z.infer<T>) => void | Promise<void>;
}

interface UseFormReturn<T extends z.ZodType> {
  values: Partial<z.infer<T>>;
  errors: Partial<Record<keyof z.infer<T>, string>>;
  isValid: boolean;
  isSubmitting: boolean;
  hasErrors: boolean;
  setValue: (field: keyof z.infer<T>, value: unknown) => void;
  setValues: (values: Partial<z.infer<T>>) => void;
  validateField: (field: keyof z.infer<T>) => boolean;
  validateAll: () => boolean;
  clearError: (field: keyof z.infer<T>) => void;
  clearErrors: () => void;
  handleSubmit: (e?: React.FormEvent) => Promise<void>;
  reset: () => void;
}

export function useForm<T extends z.ZodType>({
  schema,
  initialValues = {},
  onSubmit,
}: UseFormOptions<T>): UseFormReturn<T> {
  const [values, setValuesState] = useState<Partial<z.infer<T>>>(initialValues);
  const [errors, setErrorsState] = useState<Partial<Record<keyof z.infer<T>, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 개별 필드 값 설정
  const setValue = useCallback((field: keyof z.infer<T>, value: unknown) => {
    setValuesState(prev => ({ ...prev, [field]: value }));
    // 값이 변경되면 해당 필드의 에러를 클리어
    if (errors[field]) {
      setErrorsState(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [errors]);

  // 여러 필드 값 한번에 설정
  const setValues = useCallback((newValues: Partial<z.infer<T>>) => {
    setValuesState(prev => ({ ...prev, ...newValues }));
    // 변경된 필드들의 에러 클리어
    Object.keys(newValues).forEach(field => {
      if (errors[field as keyof z.infer<T>]) {
        setErrorsState(prev => {
          const newErrors = { ...prev };
          delete newErrors[field as keyof z.infer<T>];
          return newErrors;
        });
      }
    });
  }, [errors]);

  // 개별 필드 검증
  const validateField = useCallback((field: keyof z.infer<T>): boolean => {
    try {
      // 부분적 검증을 위해 해당 필드만 검증
      const fieldSchema = (schema as unknown as z.ZodObject<Record<string, z.ZodTypeAny>>).shape?.[field as string];
      if (fieldSchema) {
        fieldSchema.parse(values[field]);
      }
      
      // 에러가 없으면 에러 상태 클리어
      setErrorsState(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
      
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessage = error.errors[0]?.message || '유효하지 않은 값입니다';
        setErrorsState(prev => ({ ...prev, [field]: errorMessage }));
      }
      return false;
    }
  }, [schema, values]);

  // 전체 폼 검증
  const validateAll = useCallback((): boolean => {
    try {
      schema.parse(values);
      setErrorsState({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Partial<Record<keyof z.infer<T>, string>> = {};
        error.errors.forEach(err => {
          const path = err.path[0] as keyof z.infer<T>;
          if (path) {
            newErrors[path] = err.message;
          }
        });
        setErrorsState(newErrors);
      }
      return false;
    }
  }, [schema, values]);

  // 개별 필드 에러 클리어
  const clearError = useCallback((field: keyof z.infer<T>) => {
    setErrorsState(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  // 모든 에러 클리어
  const clearErrors = useCallback(() => {
    setErrorsState({});
  }, []);

  // 폼 제출 핸들러
  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      if (validateAll() && onSubmit) {
        const validatedData = schema.parse(values);
        await onSubmit(validatedData);
      }
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, validateAll, onSubmit, schema, values]);

  // 폼 리셋
  const reset = useCallback(() => {
    setValuesState(initialValues);
    setErrorsState({});
    setIsSubmitting(false);
  }, [initialValues]);

  // 계산된 값들
  const hasErrors = useMemo(() => Object.keys(errors).length > 0, [errors]);
  
  const isValid = useMemo(() => {
    try {
      schema.parse(values);
      return true;
    } catch {
      return false;
    }
  }, [schema, values]);

  return {
    values,
    errors,
    isValid,
    isSubmitting,
    hasErrors,
    setValue,
    setValues,
    validateField,
    validateAll,
    clearError,
    clearErrors,
    handleSubmit,
    reset,
  };
}