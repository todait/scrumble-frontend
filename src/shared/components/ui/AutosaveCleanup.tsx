'use client';

import { autosaveService } from '@/shared/services/autosave';
import { debug } from '@/shared/utils/debug';
import { useEffect, useRef } from 'react';

// 정리 주기 (30분)
const CLEANUP_INTERVAL = 30 * 60 * 1000;

export function AutosaveCleanup() {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasCleanedOnMount = useRef(false);

  useEffect(() => {
    // 컴포넌트 마운트 시 즉시 정리 (한 번만)
    if (!hasCleanedOnMount.current && typeof window !== 'undefined') {
      hasCleanedOnMount.current = true;
      debug('AutosaveCleanup', 'Initial cleanup on mount');
      autosaveService.cleanupExpiredData();
    }

    // 주기적 정리 설정
    intervalRef.current = setInterval(() => {
      debug('AutosaveCleanup', 'Periodic cleanup triggered');
      autosaveService.cleanupExpiredData();
    }, CLEANUP_INTERVAL);

    // 클린업
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // 이 컴포넌트는 UI를 렌더링하지 않음
  return null;
}