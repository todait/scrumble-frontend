'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { tokenStorage } from '@/shared/lib/api';
import { useAuthStore } from '@/shared/stores/auth.store';

const AuthCallbackPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuthStore();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // URL에서 에러 파라미터 확인
        const error = searchParams.get('error');
        if (error) {
          router.push('/auth?auth=error&message=' + encodeURIComponent('로그인이 취소되었거나 오류가 발생했습니다.'));
          return;
        }

        // 현재 URL이 콜백 URL인지 확인하고 백엔드에서 처리된 결과를 받아옴
        // 백엔드에서 OAuth 콜백 처리 후 토큰을 쿠키나 리다이렉트로 전달해야 함
        
        // 임시로 URL 파라미터에서 토큰을 받는다고 가정 (실제로는 보안상 권장하지 않음)
        // 실제 구현에서는 백엔드에서 secure cookie로 토큰을 설정하거나
        // 별도의 API 엔드포인트를 통해 토큰을 받아와야 함
        
        const accessToken = searchParams.get('access_token');
        const refreshToken = searchParams.get('refresh_token');
        const userId = searchParams.get('user_id');
        const userEmail = searchParams.get('user_email');
        const userName = searchParams.get('user_name');
        
        if (accessToken && refreshToken && userId && userEmail && userName) {
          // 토큰 저장
          tokenStorage.setTokens(accessToken, refreshToken);
          
          // 사용자 정보 저장
          const userData = {
            id: userId,
            email: decodeURIComponent(userEmail),
            name: decodeURIComponent(userName),
            avatarURL: '', // 백엔드에서 제공되지 않으면 빈 문자열
          };
          
          // 전역 상태에 로그인 정보 저장
          login(userData);
          
          // 성공 시 workspace 페이지로 리다이렉트
          router.push('/workspace/create?auth=success');
        } else {
          // 토큰이 없는 경우, 백엔드에서 세션을 통해 처리되었을 수 있음
          // 현재 사용자 정보를 확인해보기
          try {
            const response = await fetch('/api/me', {
              credentials: 'include',
            });
            
            if (response.ok) {
              const userData = await response.json();
              
              // 전역 상태에 로그인 정보 저장
              login(userData);
              
              router.push('/workspace/create?auth=success');
            } else {
              throw new Error('사용자 정보를 가져올 수 없습니다.');
            }
          } catch (error) {
            console.error('Auth callback error:', error);
            router.push('/auth?auth=error&message=' + encodeURIComponent('로그인 처리 중 오류가 발생했습니다.'));
          }
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        router.push('/?auth=error&message=' + encodeURIComponent('로그인 처리 중 오류가 발생했습니다.'));
      }
    };

    handleCallback();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FBFBFB]">
      <div className="text-center">
        <div>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF7800] mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-[#181818] mb-2">로그인 처리 중...</h2>
          <p className="text-[#181818] opacity-70">잠시만 기다려주세요.</p>
        </div>
      </div>
    </div>
  );
};

export default AuthCallbackPage; 