import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/shared/contexts/AuthContext';
import { useAuthStore } from '@/shared/stores/authStore';
import { ROUTES } from '@/shared/constants';

interface UseAuthRedirectOptions {
  /** 인증된 사용자를 리다이렉트할지 여부 (기본값: true) */
  redirectAuthenticated?: boolean;
}

/**
 * 인증 상태에 따른 자동 리다이렉트를 처리하는 커스텀 훅
 * @param options 리다이렉트 옵션
 */
export const useAuthRedirect = (options: UseAuthRedirectOptions = {}) => {
  const { redirectAuthenticated = true } = options;

  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const latestSpaceSlug = useAuthStore((state) => state.latestSpaceSlug);

  useEffect(() => {
    // 로딩 중이거나 리다이렉트를 원하지 않으면 실행하지 않음
    if (isLoading || !redirectAuthenticated) return;

    if (isAuthenticated) {
      if (latestSpaceSlug) {
        // 마지막 활동 스페이스가 있으면 해당 스페이스로 이동
        router.push(ROUTES.SPACE_FEED(latestSpaceSlug));
      } else {
        // 없으면 스페이스 목록 페이지로 이동
        router.push('/spaces/list');
      }
    }
  }, [isAuthenticated, isLoading, latestSpaceSlug, redirectAuthenticated, router]);

  return {
    isAuthenticated,
    isLoading,
    latestSpaceSlug,
  };
};
