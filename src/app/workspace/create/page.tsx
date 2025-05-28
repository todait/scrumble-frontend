'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/shared/hooks/useAuth';
import { useToast } from '@/shared/hooks/useToast';
import { ArrowRight, Users, Sparkles, LogOut } from 'lucide-react';

export default function CreateWorkspacePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const { success, error } = useToast();
  const [workspaceName, setWorkspaceName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const toastShownRef = useRef(false);

  useEffect(() => {
    // 로그인 성공 토스트 표시
    const authStatus = searchParams.get('auth');
    if (authStatus === 'success' && !toastShownRef.current) {
      // URL 파라미터 제거
      const url = new URL(window.location.href);
      url.searchParams.delete('auth');
      window.history.replaceState({}, '', url.toString());
      
      // 토스트를 한 번만 표시
      toastShownRef.current = true;
      success({
        title: '로그인 성공!',
        message: '워크스페이스를 생성하여 시작하세요.',
      });
    }
  }, [searchParams, success]);

  useEffect(() => {
    // 로그인하지 않은 경우 로그인 페이지로 리다이렉트
    if (!isLoading && !isAuthenticated) {
      router.push('/auth');
    }
  }, [isAuthenticated, isLoading, router]);

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!workspaceName.trim()) {
      error({
        title: '입력 오류',
        message: '워크스페이스 이름을 입력해주세요.',
      });
      return;
    }

    setIsCreating(true);
    
    try {
      // TODO: API 호출로 워크스페이스 생성
      // const response = await createWorkspace({ name: workspaceName });
      
      // 임시로 성공 처리
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      success({
        title: '워크스페이스 생성 완료!',
        message: `${workspaceName} 워크스페이스가 생성되었습니다.`,
      });
      
      // 워크스페이스 대시보드로 이동
      // router.push(`/workspace/${response.id}`);
      router.push('/'); // 임시로 홈으로 이동
    } catch (err) {
      error({
        title: '생성 실패',
        message: '워크스페이스 생성 중 오류가 발생했습니다.',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      success({
        title: '로그아웃 완료',
        message: '안전하게 로그아웃되었습니다.',
      });
      router.push('/auth');
    } catch (err) {
      error({
        title: '로그아웃 실패',
        message: '로그아웃 중 오류가 발생했습니다.',
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FBFBFB]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF7800]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBFBFB] flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-[#FF7800] to-[#FF5829] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-[#181818] mb-2">
            워크스페이스 만들기
          </h1>
          <p className="text-[#181818] opacity-70">
            팀과 함께 성장할 공간을 만들어보세요
          </p>
        </div>

        <form onSubmit={handleCreateWorkspace} className="space-y-6">
          <div>
            <label htmlFor="workspace-name" className="block text-sm font-medium text-[#181818] mb-2">
              워크스페이스 이름
            </label>
            <input
              id="workspace-name"
              type="text"
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
              placeholder="예: 우리 회사, 개발팀"
              className="w-full px-4 py-3 bg-white border border-[rgba(24,24,24,0.2)] rounded-xl 
                       focus:outline-none focus:ring-2 focus:ring-[#FF7800] focus:border-transparent
                       text-[#181818] placeholder-[#181818] placeholder-opacity-50"
              disabled={isCreating}
              autoFocus
            />
            <p className="mt-2 text-sm text-[#181818] opacity-50">
              나중에 언제든지 변경할 수 있어요
            </p>
          </div>

          <button
            type="submit"
            disabled={isCreating || !workspaceName.trim()}
            className="w-full px-6 py-4 bg-[#FF7800] text-white rounded-xl font-medium
                     hover:bg-[#e66a00] disabled:opacity-50 disabled:cursor-not-allowed
                     transition-all duration-200 flex items-center justify-center gap-2 group"
          >
            {isCreating ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>생성 중...</span>
              </>
            ) : (
              <>
                <Users className="w-5 h-5" />
                <span>워크스페이스 생성</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        {user && (
          <div className="mt-8 text-center space-y-4">
            <p className="text-sm text-[#181818] opacity-50">
              로그인 계정: {user.email}
            </p>
            
            <button
              onClick={handleLogout}
              disabled={isLoggingOut || isCreating}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm text-[#181818] opacity-70
                       hover:opacity-100 hover:text-red-600 transition-all duration-200
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoggingOut ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#181818]"></div>
                  <span>로그아웃 중...</span>
                </>
              ) : (
                <>
                  <LogOut className="w-4 h-4" />
                  <span>로그아웃</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}