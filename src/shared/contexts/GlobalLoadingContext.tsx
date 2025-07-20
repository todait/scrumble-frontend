'use client';

import { PageLoadingSpinner } from '@/shared/components/ui';
import { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from 'react';

interface LoadingReason {
  id: string;
  message?: string;
}

interface GlobalLoadingContextValue {
  isLoading: boolean;
  reasons: LoadingReason[];
  setLoading: (id: string, isLoading: boolean, message?: string) => void;
}

const GlobalLoadingContext = createContext<GlobalLoadingContextValue | null>(null);

const MIN_LOADING_TIME = 300; // 최소 로딩 표시 시간 (ms)

export function GlobalLoadingProvider({ children }: { children: ReactNode }) {
  const [reasons, setReasons] = useState<LoadingReason[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const loadingStartTimeRef = useRef<number | null>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 로딩 상태 업데이트
  const setLoading = useCallback((id: string, isLoading: boolean, message?: string) => {
    setReasons(prev => {
      if (isLoading) {
        // 이미 존재하는 경우 업데이트, 없으면 추가
        const exists = prev.some(r => r.id === id);
        if (exists) {
          return prev.map(r => r.id === id ? { id, message } : r);
        }
        return [...prev, { id, message }];
      } else {
        // 로딩 완료 시 해당 reason 제거
        return prev.filter(r => r.id !== id);
      }
    });
  }, []);

  // 로딩 표시/숨김 처리
  useEffect(() => {
    const hasReasons = reasons.length > 0;

    if (hasReasons && !isVisible) {
      // 로딩 시작
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = null;
      }
      loadingStartTimeRef.current = Date.now();
      setIsVisible(true);
    } else if (!hasReasons && isVisible) {
      // 로딩 종료 - 최소 시간 보장
      const elapsed = Date.now() - (loadingStartTimeRef.current || 0);
      const remainingTime = Math.max(0, MIN_LOADING_TIME - elapsed);

      hideTimeoutRef.current = setTimeout(() => {
        setIsVisible(false);
        loadingStartTimeRef.current = null;
      }, remainingTime);
    }

    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, [reasons, isVisible]);

  const value: GlobalLoadingContextValue = {
    isLoading: isVisible,
    reasons,
    setLoading,
  };

  return (
    <GlobalLoadingContext.Provider value={value}>
      {children}
      {isVisible && (
        <div className="fixed inset-0 z-[9999] bg-background">
          <PageLoadingSpinner />
        </div>
      )}
    </GlobalLoadingContext.Provider>
  );
}

export function useGlobalLoading() {
  const context = useContext(GlobalLoadingContext);
  if (!context) {
    throw new Error('useGlobalLoading must be used within GlobalLoadingProvider');
  }
  return context;
}

// 편의 훅: 컴포넌트 생명주기에 맞춰 로딩 상태 관리
export function useComponentLoading(id: string) {
  const { setLoading } = useGlobalLoading();

  useEffect(() => {
    return () => {
      // 컴포넌트 언마운트 시 로딩 상태 정리
      setLoading(id, false);
    };
  }, [id, setLoading]);

  const startLoading = useCallback(
    (message?: string) => setLoading(id, true, message),
    [id, setLoading]
  );

  const stopLoading = useCallback(
    () => setLoading(id, false),
    [id, setLoading]
  );

  return {
    startLoading,
    stopLoading,
  };
}