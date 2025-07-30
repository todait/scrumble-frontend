import { authApi } from '@/shared/lib/api/auth';
import { SpaceMemberTokenManager } from '@/shared/lib/token';
import { useAuthStore } from '@/shared/stores/authStore';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import { AuthPersistenceService } from '../services/authPersistence';
import type { SpaceMemberInfo, SpaceAuthDataParams } from '../types';
import type { User } from '@/shared/types/auth';

interface UseSpaceManagerOptions {
  user?: User;
}

export function useSpaceManager({ user }: UseSpaceManagerOptions) {
  const queryClient = useQueryClient();
  const [isSwitchingSpace, setIsSwitchingSpace] = useState(false);

  // 초기 상태
  const [currentSpaceSlug, setCurrentSpaceSlug] = useState<string | undefined>(() => {
    if (typeof window !== 'undefined') {
      return SpaceMemberTokenManager.getCurrentSpace() || undefined;
    }
    return undefined;
  });

  const [availableSpaces, setAvailableSpaces] = useState<SpaceMemberInfo[]>(() => {
    return AuthPersistenceService.getAvailableSpaces();
  });

  // Space 전환 함수
  const switchSpace = useCallback(async (spaceSlug: string) => {
    setIsSwitchingSpace(true);
    try {
      // 해당 Space의 토큰이 있는지 확인
      if (!SpaceMemberTokenManager.hasValidToken(spaceSlug)) {
        // 없으면 Space 로그인 시도
        const response = await authApi.loginToSpace(spaceSlug);

        // SpaceMember 토큰 저장
        SpaceMemberTokenManager.setToken(spaceSlug, {
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
        });

        // Space 정보도 업데이트
        const spaceInfo: SpaceMemberInfo = {
          id: response.spaceMemberId,
          spaceId: response.spaceMemberId, // API 응답에 spaceId가 없는 경우
          spaceSlug: response.spaceSlug,
          role: response.role,
          name: user?.email || '',
          avatarURL: undefined,
          centrifugoToken: response.centrifugoToken,
        };

        const updatedSpaces = AuthPersistenceService.updateSpaceInfo(
          spaceSlug,
          spaceInfo,
          availableSpaces
        );
        setAvailableSpaces(updatedSpaces);
      }

      // 현재 Space 변경
      setCurrentSpaceSlug(spaceSlug);
      SpaceMemberTokenManager.setCurrentSpace(spaceSlug);
      
      // Zustand store에도 저장
      useAuthStore.getState().setLatestSpaceSlug(spaceSlug);

      // UI 및 데이터 새로고침
      await queryClient.invalidateQueries({
        queryKey: ['spaceMember', spaceSlug],
      });
    } catch (error) {
      console.error('Failed to switch space:', error);
      throw error;
    } finally {
      setIsSwitchingSpace(false);
    }
  }, [queryClient, availableSpaces, user?.email]);

  // Space별 로그아웃
  const logoutFromSpace = useCallback(async (spaceSlug: string) => {
    try {
      // 현재 Space에서만 로그아웃
      if (spaceSlug === currentSpaceSlug) {
        await authApi.logoutFromSpace();
      }

      // 해당 Space 토큰 제거
      SpaceMemberTokenManager.clearToken(spaceSlug);

      // Available spaces에서 제거
      const updatedSpaces = AuthPersistenceService.removeSpace(spaceSlug, availableSpaces);
      setAvailableSpaces(updatedSpaces);

      // 현재 Space에서 로그아웃한 경우
      if (currentSpaceSlug === spaceSlug) {
        if (updatedSpaces.length > 0) {
          // 다른 Space로 전환
          await switchSpace(updatedSpaces[0].spaceSlug);
        } else {
          // 모든 Space에서 로그아웃됨
          setCurrentSpaceSlug(undefined);
          SpaceMemberTokenManager.clearCurrentSpace();
        }
      }
    } catch (error) {
      console.error('Space logout error:', error);
      throw error;
    }
  }, [currentSpaceSlug, availableSpaces, switchSpace]);

  // Space 인증 데이터 설정
  const setSpaceAuthData = useCallback(async (params: SpaceAuthDataParams) => {
    // Space 정보 저장
    const spaceInfo: SpaceMemberInfo = {
      id: params.spaceMemberId,
      spaceId: params.spaceId,
      spaceSlug: params.spaceSlug,
      role: params.role,
      name: user?.email || '',
      avatarURL: undefined,
    };

    const updatedSpaces = AuthPersistenceService.updateSpaceInfo(
      params.spaceSlug,
      spaceInfo,
      availableSpaces
    );
    setAvailableSpaces(updatedSpaces);

    // 현재 Space로 설정
    await switchSpace(params.spaceSlug);
  }, [availableSpaces, user?.email, switchSpace]);

  return {
    currentSpaceSlug,
    availableSpaces,
    isSwitchingSpace,
    switchSpace,
    logoutFromSpace,
    setSpaceAuthData,
    // 내부 상태 업데이트용
    setAvailableSpaces,
  };
}