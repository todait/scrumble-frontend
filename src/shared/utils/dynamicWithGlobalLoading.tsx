'use client';

import { useComponentLoading } from '@/shared/contexts/GlobalLoadingContext';
import dynamic from 'next/dynamic';
import { ComponentType, useEffect } from 'react';

interface DynamicOptions {
  ssr?: boolean;
  loadingMessage?: string;
}

/**
 * Next.js dynamic import를 전역 로딩 상태와 연동하는 래퍼
 *
 * @param loader - 동적으로 로드할 컴포넌트를 반환하는 함수
 * @param options - dynamic import 옵션
 * @returns 전역 로딩을 사용하는 동적 컴포넌트
 */
export function dynamicWithGlobalLoading<P = Record<string, unknown>>(
  loader: () => Promise<{ default: ComponentType<P> } | ComponentType<P>>,
  options?: DynamicOptions
): ComponentType<P> {
  const LoadingComponent = () => {
    const { startLoading, stopLoading } = useComponentLoading('dynamic-import');

    useEffect(() => {
      startLoading(options?.loadingMessage || '페이지 로딩 중...');
      return () => {
        stopLoading();
      };
    }, [startLoading, stopLoading]);

    return null;
  };

  return dynamic(loader, {
    ...options,
    loading: LoadingComponent,
  });
}
