import { create } from 'zustand';
import { User } from '@/shared/types/auth';
import { tokenStorage } from '@/shared/lib/api';
import axios from 'axios';

interface AuthState {
  // 상태
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  
  // 액션
  login: (user: User) => void;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  // 초기 상태
  user: null,
  isAuthenticated: false,
  isLoading: true,
  isInitialized: false,
  error: null,
  
  // 로그인 처리
  login: (user) => {
    set({
      user,
      isAuthenticated: true,
      error: null,
    });
    // 로컬 스토리지에 사용자 정보 저장
    localStorage.setItem('user', JSON.stringify(user));
  },
  
  // 로그아웃 처리
  logout: async () => {
    try {
      set({ isLoading: true });
      
      // 백엔드 로그아웃 API 호출 (백엔드가 준비되면 활성화)
      // TODO: 백엔드 API 구현 후 주석 해제
      /*
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/logout`, {}, {
        withCredentials: true,
      });
      */
      
      // 토큰 및 사용자 정보 제거
      tokenStorage.clearTokens();
      localStorage.removeItem('user');
      
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error('Logout error:', error);
      // 에러가 발생해도 로컬 상태는 초기화
      tokenStorage.clearTokens();
      localStorage.removeItem('user');
      
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: '로그아웃 중 오류가 발생했습니다.',
      });
    }
  },
  
  // 인증 상태 확인
  checkAuth: async () => {
    try {
      set({ isLoading: true });
      
      // 토큰 확인
      const accessToken = tokenStorage.getAccessToken();
      if (!accessToken) {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          isInitialized: true,
        });
        return;
      }
      
      // 로컬 스토리지에서 사용자 정보 확인
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        set({
          user,
          isAuthenticated: true,
          isLoading: false,
          isInitialized: true,
        });
        return;
      }
      
      // 서버에서 사용자 정보 가져오기
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/me`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      
      const user = response.data;
      localStorage.setItem('user', JSON.stringify(user));
      
      set({
        user,
        isAuthenticated: true,
        isLoading: false,
        isInitialized: true,
      });
    } catch (error) {
      console.error('Auth check error:', error);
      // 인증 실패 시 토큰 제거
      tokenStorage.clearTokens();
      localStorage.removeItem('user');
      
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        isInitialized: true,
        error: '인증 확인 중 오류가 발생했습니다.',
      });
    }
  },
  
  // 로딩 상태 설정
  setLoading: (loading) => set({ isLoading: loading }),
  
  // 에러 설정
  setError: (error) => set({ error }),
  
  // 에러 초기화
  clearError: () => set({ error: null }),
}));