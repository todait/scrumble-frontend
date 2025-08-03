import type { AutosaveKey, AutosaveOptions, AutosaveStatus } from '@/shared/services/autosave';
import { AutosaveService, autosaveService } from '@/shared/services/autosave';
import { useDateStore } from '@/shared/stores/useDateStore';
import { formatDateToAPIString } from '@/shared/utils';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { debug } from '../utils/debug';

interface UseAutosaveParams<T> {
  type: 'checkin' | 'checkout';
  data: T;
  options?: AutosaveOptions<T>;
  enabled?: boolean;
}

interface UseAutosaveReturn<T> {
  status: AutosaveStatus;
  save: () => void;
  restore: () => T | null;
  remove: () => void;
  hasRestoredData: boolean;
}

export function useAutosave<T>({
  type,
  data,
  options = {},
  enabled = true,
}: UseAutosaveParams<T>): UseAutosaveReturn<T> {
  const { debounceMs = 1000, expirationMinutes = 60, onRestore, onSave, onError } = options;

  const params = useParams();
  const spaceSlug = params.spaceSlug as string;
  const { selectedDate } = useDateStore();

  const [status, setStatus] = useState<AutosaveStatus>('idle');
  const [hasRestoredData, setHasRestoredData] = useState<boolean>(false);

  const saveTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const previousDataRef = useRef<string | undefined>(undefined);
  const hasRestoredRef = useRef<boolean>(false);
  const dataRef = useRef<T>(data);

  // dataRef를 최신 값으로 업데이트
  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  // 자동 저장 키 생성
  const getKey = useCallback((): AutosaveKey => {
    const dateString = formatDateToAPIString(selectedDate);
    return AutosaveService.createKey(type, spaceSlug, dateString);
  }, [type, spaceSlug, selectedDate]);

  // 저장 함수
  const save = useCallback(() => {
    debug('useAutosave', 'save', {
      enabled,
      spaceSlug,
      data: dataRef.current,
      expirationMinutes,
      getKey,
      onSave,
      onError,
    });

    if (!enabled || !spaceSlug) return;

    try {
      const key = getKey();
      autosaveService.save(key, dataRef.current, expirationMinutes);
      setStatus('saved');
      onSave?.();
    } catch (error) {
      console.error('Autosave failed:', error);
      setStatus('error');
      onError?.(error as Error);
    }
  }, [enabled, spaceSlug, expirationMinutes, getKey, onSave, onError]);

  // 복원 함수
  const restore = useCallback((): T | null => {
    if (!enabled || !spaceSlug) return null;

    try {
      const key = getKey();
      const restoredData = autosaveService.restore<T>(key);

      if (restoredData && !hasRestoredRef.current) {
        hasRestoredRef.current = true;
        setHasRestoredData(true);
        setStatus('restored');
        onRestore?.(restoredData);
      }

      return restoredData;
    } catch (error) {
      console.error('Autosave restore failed:', error);
      return null;
    }
  }, [enabled, spaceSlug, getKey, onRestore]);

  // 삭제 함수
  const remove = useCallback(() => {
    if (!spaceSlug) return;

    try {
      const key = getKey();
      autosaveService.remove(key);
      setStatus('idle');
      setHasRestoredData(false);
    } catch (error) {
      console.error('Autosave remove failed:', error);
    }
  }, [spaceSlug, getKey]);

  // 데이터 변경 감지 및 디바운스 저장
  useEffect(() => {
    if (!enabled || !spaceSlug) {
      debug('useAutosave', 'skip save - disabled or no spaceSlug', { enabled, spaceSlug });
      return;
    }

    // 데이터를 문자열로 변환하여 비교
    const dataString = JSON.stringify(data);

    // 데이터가 변경되지 않았으면 저장하지 않음
    if (dataString === previousDataRef.current) {
      debug('useAutosave', 'skip save - no data change');
      return;
    }

    debug('useAutosave', 'data changed, scheduling save', {
      previousData: previousDataRef.current?.substring(0, 100),
      newData: dataString.substring(0, 100),
    });

    previousDataRef.current = dataString;

    // 이전 타임아웃 취소
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // 상태를 saving으로 변경
    setStatus('saving');

    // 디바운스 적용하여 저장
    debug('useAutosave', 'setting timeout with debounceMs:', debounceMs);
    saveTimeoutRef.current = setTimeout(() => {
      debug('useAutosave', 'debounce timeout reached, calling save');
      save();
    }, debounceMs);

    return () => {
      debug('useAutosave', 'cleanup function called');
      if (saveTimeoutRef.current) {
        debug('useAutosave', 'clearing timeout');
        clearTimeout(saveTimeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, spaceSlug, data, debounceMs]); // save는 dataRef를 사용하므로 의도적으로 제외

  // 컴포넌트별 정리는 제거 - 전역 AutosaveCleanup 컴포넌트가 처리

  // 날짜 변경 시 이전 자동 저장 데이터 초기화
  useEffect(() => {
    hasRestoredRef.current = false;
    setHasRestoredData(false);
  }, [selectedDate]);

  return {
    status,
    save,
    restore,
    remove,
    hasRestoredData,
  };
}
