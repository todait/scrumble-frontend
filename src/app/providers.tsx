'use client';

import { AuthProvider, TimezoneProvider, GlobalLoadingProvider } from '@/shared/contexts';
import { ToastMount } from '@/shared/components/feedback/ToastMount';
import { setQueryClient } from '@/shared/lib/api';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AxiosError } from 'axios';
import { useEffect, useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  // QueryClient를 useState로 생성하여 SSR에서 안전하게 사용
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // 기본 설정
            staleTime: 60 * 1000, // 1분
            gcTime: 5 * 60 * 1000, // 5분 (이전 cacheTime)
            retry: (failureCount, error) => {
              // 404는 재시도해도 의미 없음
              if (error instanceof AxiosError && error.response?.status === 404) return false;
              // 3번까지만 재시도
              return failureCount < 3;
            },

            // ⏱️ retryDelay: 재시도 간격
            retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),

            // 🪟 refetchOnWindowFocus: 윈도우 포커스 시 리페치
            // - 사용자가 다른 탭에서 돌아왔을 때 데이터 새로고침
            refetchOnWindowFocus: true,

            // 📡 refetchOnReconnect: 네트워크 재연결 시 리페치
            refetchOnReconnect: 'always',

            // 🔄 refetchInterval: 주기적으로 리페치 (폴링)
            refetchInterval: false, // 기본적으로 폴링 비활성화

            // 📱 refetchIntervalInBackground: 백그라운드에서도 폴링
            refetchIntervalInBackground: false, // 백그라운드에서는 폴링 중지
          },
        },
      })
  );

  // QueryClient를 API 레이어에 등록
  useEffect(() => {
    setQueryClient(queryClient);
  }, [queryClient]);

  return (
    <GlobalLoadingProvider>
      <QueryClientProvider client={queryClient}>
        <TimezoneProvider>
          <AuthProvider>{children}</AuthProvider>
        </TimezoneProvider>
        {/* 개발 환경에서만 DevTools 표시 */}
        {process.env.NODE_ENV === 'development' && <ReactQueryDevtools />}
      </QueryClientProvider>
      {/* 토스트를 포털로 body에 직접 마운트 */}
      <ToastMount />
    </GlobalLoadingProvider>
  );
}
