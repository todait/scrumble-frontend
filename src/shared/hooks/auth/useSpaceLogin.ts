'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { authApi } from '@/shared/lib/api/auth';
import { SpaceMemberTokenManager } from '@/shared/lib/token';
import { useAuth } from '@/shared/contexts/AuthContext';
import { useToast } from '../useToast';

interface UseSpaceLoginOptions {
  onSuccess?: (spaceSlug: string) => void;
  onError?: (error: unknown) => void;
  autoRedirect?: boolean;
}

export function useSpaceLogin(options: UseSpaceLoginOptions = {}) {
  const {
    onSuccess,
    onError,
    autoRedirect = true
  } = options;

  const router = useRouter();
  const { success, error } = useToast();
  const { switchSpace } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const loginToSpace = async (spaceSlug: string, spaceName?: string) => {
    if (isLoading) return;

    setIsLoading(true);
    
    try {
      // Space login API 호출
      const loginResult = await authApi.loginToSpace(spaceSlug);
      
      // SpaceMember 토큰 저장
      SpaceMemberTokenManager.setToken(spaceSlug, {
        accessToken: loginResult.accessToken,
        refreshToken: loginResult.refreshToken,
      });

      // AuthContext에 스페이스 정보 업데이트
      await switchSpace(spaceSlug);

      // 성공 토스트
      success({
        title: '스페이스 입장 성공',
        message: spaceName ? `${spaceName}에 입장했습니다.` : '스페이스에 입장했습니다.',
      });

      // 성공 콜백 호출
      onSuccess?.(spaceSlug);

      // 자동 리다이렉트
      if (autoRedirect) {
        router.push(`/${spaceSlug}/feed`);
      }

      return loginResult;
    } catch (err) {
      console.error('스페이스 입장 실패:', err);
      
      // 에러 토스트
      error({
        title: '스페이스 입장 실패',
        message: '스페이스에 입장할 수 없습니다. 다시 시도해주세요.',
      });

      // 에러 콜백 호출
      onError?.(err);
      
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    loginToSpace,
    isLoading,
  };
}