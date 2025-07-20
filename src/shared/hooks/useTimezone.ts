import { useState, useEffect } from 'react';
import { getUserTimezone, isValidTimezone } from '../utils/timezone';

interface UseTimezoneReturn {
  timezone: string;
  isLoading: boolean;
  error: string | null;
  setTimezone: (timezone: string) => void;
}

/**
 * 사용자의 타임존을 관리하는 커스텀 훅
 * 로컬 스토리지에 저장하고, 시스템 타임존 변경을 감지합니다.
 * @returns 타임존 관련 상태와 함수들
 */
export const useTimezone = (): UseTimezoneReturn => {
  const [timezone, setTimezoneState] = useState<string>('UTC');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 타임존 초기화
  useEffect(() => {
    const initTimezone = () => {
      try {
        // 클라이언트에서만 localStorage에 접근
        if (typeof window !== 'undefined') {
          // 로컬 스토리지에서 저장된 타임존 확인
          const savedTimezone = localStorage.getItem('user-timezone');
          
          if (savedTimezone && isValidTimezone(savedTimezone)) {
            setTimezoneState(savedTimezone);
          } else {
            // 시스템 타임존 사용
            const systemTimezone = getUserTimezone();
            setTimezoneState(systemTimezone);
            localStorage.setItem('user-timezone', systemTimezone);
          }
        } else {
          // 서버에서는 기본값 사용
          const systemTimezone = getUserTimezone();
          setTimezoneState(systemTimezone);
        }
        
        setError(null);
      } catch (err) {
        console.error('Failed to initialize timezone:', err);
        setError('타임존 초기화에 실패했습니다.');
        setTimezoneState('UTC');
      } finally {
        setIsLoading(false);
      }
    };

    initTimezone();
  }, []);

  // 타임존 변경 시 로컬 스토리지 업데이트
  const setTimezone = (newTimezone: string) => {
    if (!isValidTimezone(newTimezone)) {
      setError('유효하지 않은 타임존입니다.');
      return;
    }

    try {
      setTimezoneState(newTimezone);
      if (typeof window !== 'undefined') {
        localStorage.setItem('user-timezone', newTimezone);
      }
      setError(null);
    } catch (err) {
      console.error('Failed to set timezone:', err);
      setError('타임존 설정에 실패했습니다.');
    }
  };

  return {
    timezone,
    isLoading,
    error,
    setTimezone,
  };
};