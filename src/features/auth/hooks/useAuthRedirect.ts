import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/shared/hooks/auth/useAuth';
import { ROUTES, TEMP_SPACE_ID } from '@/shared/constants';

interface UseAuthRedirectOptions {
  /** 인증된 사용자를 리다이렉트할지 여부 (기본값: true) */
  redirectAuthenticated?: boolean;
  /** 리다이렉트할 때 사용할 기본 스페이스 ID */
  defaultSpaceId?: string;
}

/**
 * 인증 상태에 따른 자동 리다이렉트를 처리하는 커스텀 훅
 * @param options 리다이렉트 옵션
 */
export const useAuthRedirect = (options: UseAuthRedirectOptions = {}) => {
  const { 
    redirectAuthenticated = true, 
    defaultSpaceId = TEMP_SPACE_ID 
  } = options;

  const router = useRouter();
  const { isAuthenticated, isLoading, latestSpace } = useAuth();

  useEffect(() => {
    // 로딩 중이거나 리다이렉트를 원하지 않으면 실행하지 않음
    if (isLoading || !redirectAuthenticated) return;

    if (isAuthenticated) {
      // 최신 스페이스가 있으면 해당 스페이스의 피드로, 없으면 기본 스페이스로
      const targetSpaceId = latestSpace?.latestSpaceSlug || defaultSpaceId;
      router.push(ROUTES.SPACE_FEED(targetSpaceId));
    }
  }, [
    isAuthenticated, 
    isLoading, 
    latestSpace, 
    redirectAuthenticated, 
    defaultSpaceId, 
    router
  ]);

  return {
    isAuthenticated,
    isLoading,
    latestSpace,
  };
};