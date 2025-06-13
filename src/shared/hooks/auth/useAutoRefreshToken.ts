import { authApi } from '@/shared/lib/api/auth';
import { TokenManager } from '@/shared/lib/token';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { authKeys } from '../queries/authKeys';

export function useAutoRefreshToken() {
  const queryClient = useQueryClient();
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const scheduleTokenRefresh = () => {
      // 기존 타이머 취소
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }

      const timeLeft = TokenManager.getAccessTokenTimeLeft();

      // 토큰이 없거나 이미 만료됨
      if (timeLeft <= 0) {
        return;
      }

      // 만료 1분 전에 갱신 (여유 시간)
      const refreshTime = Math.max(0, timeLeft - 60000);

      refreshTimeoutRef.current = setTimeout(async () => {
        try {
          const refreshToken = TokenManager.getRefreshToken();

          if (!refreshToken || !TokenManager.isRefreshTokenValid()) {
            throw new Error('Refresh token invalid');
          }

          const tokenData = await authApi.refreshToken(refreshToken);

          // 토큰 저장
          TokenManager.setTokens(tokenData);

          // 사용자 정보 리페치
          queryClient.invalidateQueries({ queryKey: authKeys.user() });

          // 다음 갱신 스케줄
          scheduleTokenRefresh();
        } catch (error) {
          console.error('❌ Auto refresh failed:', error);
          // 실패 시 로그아웃 처리는 API 인터셉터가 담당
        }
      }, refreshTime);
    };

    // 초기 스케줄링
    scheduleTokenRefresh();

    // 페이지 포커스 시 토큰 체크
    const handleFocus = () => {
      const timeLeft = TokenManager.getAccessTokenTimeLeft();
      if (timeLeft <= 60000) {
        // 1분 이하 남음
        scheduleTokenRefresh();
      }
    };

    // 가시성 변경 시 토큰 체크
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        handleFocus();
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [queryClient]);
}
