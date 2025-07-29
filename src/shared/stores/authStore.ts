import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * 인증 관련 전역 상태 관리
 * 마지막 활동 스페이스 등을 추적
 */
interface AuthStore {
  // 마지막 활동 스페이스 슬러그
  latestSpaceSlug: string | null;
  
  // 마지막 활동 스페이스 설정
  setLatestSpaceSlug: (spaceSlug: string | null) => void;
  
  // 스토어 초기화
  clearAuthStore: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      latestSpaceSlug: null,
      
      setLatestSpaceSlug: (spaceSlug) => 
        set({ latestSpaceSlug: spaceSlug }),
      
      clearAuthStore: () => 
        set({ latestSpaceSlug: null }),
    }),
    {
      name: 'scrumble-auth-storage',
      // 저장할 상태 선택 (latestSpaceSlug만 저장)
      partialize: (state) => ({ 
        latestSpaceSlug: state.latestSpaceSlug 
      }),
    }
  )
);