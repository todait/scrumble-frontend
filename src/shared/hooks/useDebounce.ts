import { useEffect, useState, useRef } from 'react';

/**
 * 값이 변경된 후 일정 시간 동안 대기한 다음 업데이트하는 훅
 * 배열의 경우 깊은 비교를 수행하여 불필요한 업데이트를 방지합니다
 * @param value - 디바운스할 값
 * @param delay - 대기 시간 (밀리초)
 * @returns 디바운스된 값
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // 배열인 경우 깊은 비교 수행
    const hasChanged = Array.isArray(value) && Array.isArray(debouncedValue)
      ? value.length !== debouncedValue.length || 
        value.some((item, index) => item !== debouncedValue[index])
      : value !== debouncedValue;

    if (!hasChanged) {
      return;
    }

    // 기존 타이머 클리어
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, delay, debouncedValue]);

  return debouncedValue;
}
