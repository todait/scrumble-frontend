import { useCallback } from 'react';
import { authApi } from '@/shared/lib/api/auth';
import { useAuth } from '@/shared/hooks/auth/useAuth';
import { useToast } from '@/shared/hooks/useToast';

interface UseGoogleAuthReturn {
  handleGoogleLogin: () => void;
  handleLogout: () => Promise<void>;
  isLoading: boolean;
}

/**
 * Google OAuth 로그인/로그아웃을 처리하는 커스텀 훅
 * @returns Google 인증 관련 함수들과 상태
 */
export const useGoogleAuth = (): UseGoogleAuthReturn => {
  const { logout, isLoggingOut } = useAuth();
  const { error } = useToast();

  const handleGoogleLogin = useCallback(() => {
    try {
      authApi.startGoogleOAuth();
    } catch (err) {
      console.error('Google login error:', err);
      error({
        title: '로그인 오류',
        message: '로그인을 시작할 수 없습니다. 다시 시도해주세요.',
      });
    }
  }, [error]);

  const handleLogout = useCallback(async () => {
    try {
      logout();
    } catch (err) {
      console.error('Logout error:', err);
      error({
        title: '로그아웃 오류',
        message: '로그아웃 중 문제가 발생했습니다.',
      });
    }
  }, [logout, error]);

  return {
    handleGoogleLogin,
    handleLogout,
    isLoading: isLoggingOut,
  };
};