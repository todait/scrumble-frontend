import { useAuth } from '@/shared/hooks/auth/useAuth';
import { useToast } from '@/shared/hooks/useToast';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';

interface UseAuthCallbackReturn {
  isProcessing: boolean;
  hasCompleted: boolean;
  error: string | null;
}

interface AuthParams {
  accessToken: string | null;
  refreshToken: string | null;
  userId: string | null;
  userEmail: string | null;
  userName: string | null;
}

interface ProcessingState {
  hasProcessed: boolean;
  hasRedirected: boolean;
  error: string | null;
  isProcessing: boolean;
}

/**
 * OAuth 콜백 처리를 담당하는 커스텀 훅
 * URL 파라미터에서 토큰을 추출하고 인증 데이터를 설정한 후 적절한 페이지로 리다이렉트
 * @returns 처리 상태 정보
 */
export const useAuthCallback = (): UseAuthCallbackReturn => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { success, error: toastError } = useToast();
  const { setAuthData, refetchUser, latestSpace, user, isLoading } = useAuth();

  // 통합된 상태 관리 (useState만 사용)
  const [state, setState] = useState<ProcessingState>({
    hasProcessed: false,
    hasRedirected: false,
    error: null,
    isProcessing: false,
  });

  // URL 파라미터에서 인증 정보 추출 (useCallback으로 메모이제이션)
  const extractAuthParams = useCallback((): AuthParams => ({
    accessToken: searchParams.get('access_token'),
    refreshToken: searchParams.get('refresh_token'),
    userId: searchParams.get('user_id'),
    userEmail: searchParams.get('user_email'),
    userName: searchParams.get('user_name'),
  }), [searchParams]);

  // 모든 필수 파라미터가 있는지 확인
  const hasAllRequiredParams = useCallback((params: AuthParams): boolean => {
    return Object.values(params).every(param => param !== null && param !== '');
  }, []);

  // 에러 처리 함수 (useCallback으로 메모이제이션)
  const handleError = useCallback((message: string) => {
    setState(prev => ({ 
      ...prev, 
      error: message,
      isProcessing: false 
    }));
    toastError({
      title: '로그인 오류',
      message,
    });
    router.push('/auth?auth=error&message=' + encodeURIComponent(message));
  }, [toastError, router]);

  // OAuth 콜백 처리 로직
  useEffect(() => {
    // 이미 처리 중이거나 완료되었으면 실행하지 않음
    if (state.isProcessing || state.hasProcessed) return;

    setState(prev => ({ ...prev, isProcessing: true }));

    const processAuthCallback = async () => {
      try {
        // 1. OAuth 에러 확인
        const oauthError = searchParams.get('error');
        if (oauthError) {
          handleError('로그인이 취소되었거나 오류가 발생했습니다.');
          return;
        }

        // 2. URL 파라미터에서 토큰 추출
        const authParams = extractAuthParams();

        if (hasAllRequiredParams(authParams)) {
          // URL 파라미터로 인증 데이터 설정
          await setAuthData({
            accessToken: authParams.accessToken!,
            refreshToken: authParams.refreshToken!,
            userId: authParams.userId!,
            userEmail: authParams.userEmail!,
            userName: authParams.userName!,
          });

          success({
            title: '로그인 성공',
            message: '이제 스크럼블을 시작할 수 있습니다',
          });
        } else {
          // 3. URL 파라미터가 없으면 세션 쿠키로 인증 시도
          try {
            await refetchUser();
            success({
              title: '로그인 성공',
              message: '이제 스크럼블을 시작할 수 있습니다',
            });
          } catch (refetchError) {
            handleError(`로그인 처리 중 오류가 발생했습니다. 다시 시도해주세요. ${refetchError}`);
            return;
          }
        }

        // 처리 완료 표시
        setState(prev => ({ 
          ...prev, 
          hasProcessed: true,
          isProcessing: false 
        }));

      } catch (error) {
        console.error('Auth callback processing error:', error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        handleError(`로그인 처리 중 오류가 발생했습니다. ${errorMessage}`);
      }
    };

    processAuthCallback();
  }, [
    searchParams,
    router,
    success,
    toastError,
    setAuthData,
    refetchUser,
    state.hasProcessed,
    state.isProcessing,
    extractAuthParams,
    hasAllRequiredParams,
    handleError,
  ]);

  // latestSpace 상태 변화를 감지해서 라우팅
  useEffect(() => {
    // 아직 인증 처리가 완료되지 않았거나 이미 리다이렉트했거나 에러가 있으면 return
    if (!state.hasProcessed || state.hasRedirected || state.error) {
      return;
    }

    // 로딩 중이면 기다림
    if (isLoading) return;

    // 사용자가 인증되었으면 라우팅
    if (user) {
      setState(prev => ({ ...prev, hasRedirected: true }));

      const targetUrl = latestSpace?.latestSpaceSlug
        ? `/${latestSpace.latestSpaceSlug}/feed?auth=success`
        : '/spaces/welcome?auth=success';

      router.replace(targetUrl);
    }
  }, [user, latestSpace, isLoading, router, state]);

  return {
    isProcessing: state.isProcessing || 
                 (state.hasProcessed && !state.hasRedirected && !state.error),
    hasCompleted: state.hasProcessed && state.hasRedirected,
    error: state.error,
  };
};