import { authApi } from '@/shared/lib/api/auth';
import { SpaceMemberTokenManager, TokenManager } from '@/shared/lib/token';
import { TokenPair } from '@/shared/lib/token/types';
import { debug } from '@/shared/utils/debug';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { authKeys } from '../queries/authKeys';

interface UseAutoRefreshTokenOptions {
  tokenType: 'user' | 'spaceMember';
  spaceSlug?: string;
  enabled?: boolean;
  refreshBeforeExpiry?: number; // 만료 전 갱신 시간 (밀리초)
  onRefreshSuccess?: (tokens: TokenPair) => void;
  onRefreshError?: (error: Error) => void;
}

export function useAutoRefreshTokenGeneric({
  tokenType,
  spaceSlug,
  enabled = true,
  refreshBeforeExpiry = tokenType === 'user' ? 60000 : 300000, // User: 1분, SpaceMember: 5분
  onRefreshSuccess,
  onRefreshError,
}: UseAutoRefreshTokenOptions) {
  const queryClient = useQueryClient();
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!enabled) return;
    
    // SpaceMember 타입인데 spaceSlug가 없으면 리턴
    if (tokenType === 'spaceMember' && !spaceSlug) return;

    const getTokenFunctions = () => {
      if (tokenType === 'user') {
        return {
          getAccessToken: () => TokenManager.getAccessToken(),
          getRefreshToken: () => TokenManager.getRefreshToken(),
          isRefreshTokenValid: () => TokenManager.isRefreshTokenValid(),
          getTimeLeft: () => TokenManager.getAccessTokenTimeLeft(),
          shouldRefresh: () => TokenManager.getAccessTokenTimeLeft() <= refreshBeforeExpiry,
          setTokens: (tokens: TokenPair) => TokenManager.setTokens(tokens),
        };
      } else {
        return {
          getAccessToken: () => SpaceMemberTokenManager.getAccessToken(spaceSlug!),
          getRefreshToken: () => SpaceMemberTokenManager.getRefreshToken(spaceSlug!),
          isRefreshTokenValid: () => !!SpaceMemberTokenManager.getRefreshToken(spaceSlug!),
          getTimeLeft: () => {
            const token = SpaceMemberTokenManager.getAccessToken(spaceSlug!);
            if (!token) return 0;
            const decoded = SpaceMemberTokenManager.decodeToken(token);
            if (!decoded?.exp) return 0;
            return Math.max(0, decoded.exp * 1000 - Date.now());
          },
          shouldRefresh: () => SpaceMemberTokenManager.shouldRefreshToken(spaceSlug!),
          setTokens: (tokens: TokenPair) => SpaceMemberTokenManager.setToken(spaceSlug!, tokens),
        };
      }
    };

    const tokenFns = getTokenFunctions();

    const refreshToken = async () => {
      try {
        const refreshTokenValue = tokenFns.getRefreshToken();
        if (!refreshTokenValue || !tokenFns.isRefreshTokenValid()) {
          throw new Error('Refresh token invalid');
        }

        debug(`AutoRefreshToken[${tokenType}]`, 'Refreshing token...');

        let tokenData: TokenPair;
        if (tokenType === 'user') {
          tokenData = await authApi.refreshToken(refreshTokenValue);
        } else {
          tokenData = await authApi.refreshSpaceMemberToken(refreshTokenValue);
        }

        // 토큰 저장
        tokenFns.setTokens(tokenData);

        // 쿼리 무효화
        if (tokenType === 'user') {
          await queryClient.invalidateQueries({ queryKey: authKeys.user() });
          window.dispatchEvent(new CustomEvent('userTokenRefreshed'));
        } else {
          await queryClient.invalidateQueries({
            queryKey: ['spaceMember', spaceSlug],
          });
          window.dispatchEvent(
            new CustomEvent('spaceMemberTokenRefreshed', { detail: { spaceSlug } })
          );
        }

        // 성공 콜백
        onRefreshSuccess?.(tokenData);

        debug(`AutoRefreshToken[${tokenType}]`, 'Token refreshed successfully');

        // 다음 갱신 스케줄
        scheduleTokenRefresh();
      } catch (error) {
        debug(`AutoRefreshToken[${tokenType}]`, 'Auto refresh failed:', error);
        
        // 실패 콜백
        onRefreshError?.(error as Error);
        
        // 실패 이벤트 발생
        if (tokenType === 'spaceMember') {
          window.dispatchEvent(
            new CustomEvent('spaceMemberTokenExpired', { detail: { spaceSlug } })
          );
        }
      }
    };

    const scheduleTokenRefresh = () => {
      // 기존 타이머 취소
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }

      const timeLeft = tokenFns.getTimeLeft();

      // 토큰이 없거나 이미 만료됨
      if (timeLeft <= 0) {
        debug(`AutoRefreshToken[${tokenType}]`, 'Token not found or already expired');
        return;
      }

      // 이미 갱신이 필요한 경우 즉시 갱신
      if (tokenFns.shouldRefresh()) {
        debug(`AutoRefreshToken[${tokenType}]`, 'Token needs immediate refresh');
        refreshToken();
        return;
      }

      // 갱신 시간 계산
      const refreshTime = Math.max(0, timeLeft - refreshBeforeExpiry);

      debug(`AutoRefreshToken[${tokenType}]`, 'Scheduling refresh in', {
        minutes: refreshTime / 1000 / 60,
      });

      refreshTimeoutRef.current = setTimeout(refreshToken, refreshTime);
    };

    // 초기 스케줄링
    scheduleTokenRefresh();

    // 페이지 포커스 시 토큰 체크
    const handleFocus = () => {
      if (tokenFns.shouldRefresh()) {
        refreshToken();
      } else {
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
  }, [tokenType, spaceSlug, enabled, refreshBeforeExpiry, queryClient, onRefreshSuccess, onRefreshError]);
}

// 기존 훅들과의 호환성을 위한 래퍼
export function useAutoRefreshToken() {
  useAutoRefreshTokenGeneric({ tokenType: 'user' });
}

export function useAutoRefreshSpaceMemberToken({
  currentSpaceSlug,
  enabled = true,
}: {
  currentSpaceSlug?: string;
  enabled?: boolean;
}) {
  useAutoRefreshTokenGeneric({
    tokenType: 'spaceMember',
    spaceSlug: currentSpaceSlug,
    enabled: enabled && !!currentSpaceSlug,
  });
}