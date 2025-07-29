import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { apiClient, tokenManager } from './new-api-client-example';

// 사용자 정보 타입
interface User {
  id: string;
  email: string;
  name: string;
  profileImage?: string;
}

// Space 정보 타입
interface Space {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
}

// SpaceMember 정보 타입
interface SpaceMember {
  id: string;
  spaceId: string;
  userId: string;
  role: 'owner' | 'admin' | 'member';
  nickname?: string;
  joinedAt: string;
}

// 인증 컨텍스트 타입
interface AuthContextType {
  // User 인증 상태
  user: User | null;
  isUserAuthenticated: boolean;
  isUserLoading: boolean;
  
  // Space 관련 상태
  currentSpace: Space | null;
  currentSpaceMember: SpaceMember | null;
  isSpaceMemberAuthenticated: boolean;
  isSpaceLoading: boolean;
  
  // 사용 가능한 Spaces
  availableSpaces: Space[];
  
  // 인증 관련 메서드
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  
  // Space 관련 메서드
  switchSpace: (spaceId: string) => Promise<void>;
  joinSpace: (inviteCode: string) => Promise<void>;
  leaveSpace: (spaceId: string) => Promise<void>;
  createSpace: (name: string, description?: string) => Promise<Space>;
  
  // 토큰 갱신 메서드
  refreshUserToken: () => Promise<void>;
  refreshSpaceMemberToken: (spaceId: string) => Promise<void>;
}

// 기본값
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider Props
interface AuthProviderProps {
  children: ReactNode;
}

// AuthProvider 컴포넌트
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // User 관련 상태
  const [user, setUser] = useState<User | null>(null);
  const [isUserLoading, setIsUserLoading] = useState(true);
  
  // Space 관련 상태
  const [currentSpace, setCurrentSpace] = useState<Space | null>(null);
  const [currentSpaceMember, setCurrentSpaceMember] = useState<SpaceMember | null>(null);
  const [availableSpaces, setAvailableSpaces] = useState<Space[]>([]);
  const [isSpaceLoading, setIsSpaceLoading] = useState(false);
  
  // 초기 인증 상태 확인
  useEffect(() => {
    checkAuthStatus();
  }, []);
  
  // 현재 Space 변경 감지
  useEffect(() => {
    if (user && tokenManager.getCurrentSpaceId()) {
      loadCurrentSpace();
    }
  }, [user]);
  
  // 인증 상태 확인
  const checkAuthStatus = async () => {
    try {
      const userToken = tokenManager.getUserToken();
      
      if (!userToken) {
        setIsUserLoading(false);
        return;
      }
      
      // User 정보 가져오기
      const userResponse = await apiClient.client.get('/api/v1/users/me');
      setUser(userResponse.data);
      
      // 사용 가능한 Spaces 가져오기
      const spacesResponse = await apiClient.client.get('/api/v1/spaces');
      setAvailableSpaces(spacesResponse.data);
      
      // 현재 Space 정보 로드
      const currentSpaceId = tokenManager.getCurrentSpaceId();
      if (currentSpaceId) {
        await loadCurrentSpace();
      }
      
    } catch (error) {
      console.error('Auth status check failed:', error);
      // 토큰이 유효하지 않으면 제거
      tokenManager.removeUserToken();
      setUser(null);
    } finally {
      setIsUserLoading(false);
    }
  };
  
  // 현재 Space 정보 로드
  const loadCurrentSpace = async () => {
    const spaceId = tokenManager.getCurrentSpaceId();
    if (!spaceId) return;
    
    setIsSpaceLoading(true);
    
    try {
      // Space 정보 가져오기
      const spaceResponse = await apiClient.client.get(`/api/v1/spaces/${spaceId}`);
      setCurrentSpace(spaceResponse.data);
      
      // SpaceMember 토큰이 없으면 발급 요청
      if (!tokenManager.getSpaceMemberToken(spaceId)) {
        await obtainSpaceMemberToken(spaceId);
      }
      
      // SpaceMember 정보 가져오기
      const memberResponse = await apiClient.client.get('/api/v1/members/me');
      setCurrentSpaceMember(memberResponse.data);
      
    } catch (error) {
      console.error('Failed to load current space:', error);
      setCurrentSpace(null);
      setCurrentSpaceMember(null);
    } finally {
      setIsSpaceLoading(false);
    }
  };
  
  // SpaceMember 토큰 발급
  const obtainSpaceMemberToken = async (spaceId: string) => {
    try {
      const response = await apiClient.client.post(`/api/v1/spaces/${spaceId}/authenticate`);
      const { accessToken, refreshToken } = response.data;
      
      tokenManager.setSpaceMemberToken(spaceId, accessToken);
      localStorage.setItem(`space_refresh_token_${spaceId}`, refreshToken);
      
    } catch (error) {
      console.error('Failed to obtain space member token:', error);
      throw error;
    }
  };
  
  // 로그인
  const login = async (email: string, password: string) => {
    try {
      const response = await apiClient.client.post('/api/v1/auth/login', {
        email,
        password,
      });
      
      const { user, accessToken, refreshToken } = response.data;
      
      // 토큰 저장
      tokenManager.setUserToken(accessToken);
      localStorage.setItem('user_refresh_token', refreshToken);
      
      // 사용자 정보 설정
      setUser(user);
      
      // 사용 가능한 Spaces 가져오기
      const spacesResponse = await apiClient.client.get('/api/v1/spaces');
      setAvailableSpaces(spacesResponse.data);
      
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };
  
  // Google 로그인
  const loginWithGoogle = async () => {
    // Google OAuth 플로우는 보통 리다이렉트 방식으로 처리
    window.location.href = '/api/v1/auth/google';
  };
  
  // 로그아웃
  const logout = async () => {
    try {
      await apiClient.client.post('/api/v1/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // 모든 토큰 제거
      tokenManager.removeUserToken();
      tokenManager.removeAllSpaceTokens();
      localStorage.removeItem('user_refresh_token');
      
      // 상태 초기화
      setUser(null);
      setCurrentSpace(null);
      setCurrentSpaceMember(null);
      setAvailableSpaces([]);
      
      // 로그인 페이지로 리다이렉트
      window.location.href = '/login';
    }
  };
  
  // Space 전환
  const switchSpace = async (spaceId: string) => {
    if (tokenManager.getCurrentSpaceId() === spaceId) {
      return; // 이미 현재 Space인 경우
    }
    
    setIsSpaceLoading(true);
    
    try {
      // 현재 Space ID 설정
      tokenManager.setCurrentSpaceId(spaceId);
      
      // Space 정보 가져오기
      const spaceResponse = await apiClient.client.get(`/api/v1/spaces/${spaceId}`);
      setCurrentSpace(spaceResponse.data);
      
      // SpaceMember 토큰 확인 및 발급
      if (!tokenManager.getSpaceMemberToken(spaceId)) {
        await obtainSpaceMemberToken(spaceId);
      }
      
      // SpaceMember 정보 가져오기
      const memberResponse = await apiClient.client.get('/api/v1/members/me');
      setCurrentSpaceMember(memberResponse.data);
      
    } catch (error) {
      console.error('Failed to switch space:', error);
      throw error;
    } finally {
      setIsSpaceLoading(false);
    }
  };
  
  // Space 가입
  const joinSpace = async (inviteCode: string) => {
    try {
      const response = await apiClient.client.post('/api/v1/spaces/join', {
        inviteCode,
      });
      
      const newSpace = response.data;
      
      // 사용 가능한 Spaces 목록 업데이트
      setAvailableSpaces([...availableSpaces, newSpace]);
      
      // 새로 가입한 Space로 전환
      await switchSpace(newSpace.id);
      
      return newSpace;
      
    } catch (error) {
      console.error('Failed to join space:', error);
      throw error;
    }
  };
  
  // Space 나가기
  const leaveSpace = async (spaceId: string) => {
    try {
      await apiClient.client.delete(`/api/v1/spaces/${spaceId}/leave`);
      
      // 토큰 제거
      tokenManager.removeSpaceMemberToken(spaceId);
      localStorage.removeItem(`space_refresh_token_${spaceId}`);
      
      // 사용 가능한 Spaces 목록 업데이트
      setAvailableSpaces(availableSpaces.filter(s => s.id !== spaceId));
      
      // 현재 Space인 경우 초기화
      if (tokenManager.getCurrentSpaceId() === spaceId) {
        setCurrentSpace(null);
        setCurrentSpaceMember(null);
        tokenManager.setCurrentSpaceId('');
        
        // 다른 Space가 있으면 첫 번째로 전환
        if (availableSpaces.length > 1) {
          const nextSpace = availableSpaces.find(s => s.id !== spaceId);
          if (nextSpace) {
            await switchSpace(nextSpace.id);
          }
        }
      }
      
    } catch (error) {
      console.error('Failed to leave space:', error);
      throw error;
    }
  };
  
  // Space 생성
  const createSpace = async (name: string, description?: string) => {
    try {
      const response = await apiClient.client.post('/api/v1/spaces', {
        name,
        description,
      });
      
      const newSpace = response.data;
      
      // 사용 가능한 Spaces 목록 업데이트
      setAvailableSpaces([...availableSpaces, newSpace]);
      
      // 새로 생성한 Space로 전환
      await switchSpace(newSpace.id);
      
      return newSpace;
      
    } catch (error) {
      console.error('Failed to create space:', error);
      throw error;
    }
  };
  
  // User 토큰 갱신
  const refreshUserToken = async () => {
    try {
      const response = await apiClient.client.post('/api/v1/auth/refresh', {
        refreshToken: localStorage.getItem('user_refresh_token'),
      });
      
      const { accessToken, refreshToken } = response.data;
      
      tokenManager.setUserToken(accessToken);
      localStorage.setItem('user_refresh_token', refreshToken);
      
    } catch (error) {
      console.error('Failed to refresh user token:', error);
      throw error;
    }
  };
  
  // SpaceMember 토큰 갱신
  const refreshSpaceMemberToken = async (spaceId: string) => {
    try {
      const response = await apiClient.client.post(`/api/v1/spaces/${spaceId}/refresh`, {
        refreshToken: localStorage.getItem(`space_refresh_token_${spaceId}`),
      });
      
      const { accessToken, refreshToken } = response.data;
      
      tokenManager.setSpaceMemberToken(spaceId, accessToken);
      localStorage.setItem(`space_refresh_token_${spaceId}`, refreshToken);
      
    } catch (error) {
      console.error('Failed to refresh space member token:', error);
      throw error;
    }
  };
  
  // Context 값
  const value: AuthContextType = {
    // User 인증 상태
    user,
    isUserAuthenticated: !!user,
    isUserLoading,
    
    // Space 관련 상태
    currentSpace,
    currentSpaceMember,
    isSpaceMemberAuthenticated: !!currentSpaceMember,
    isSpaceLoading,
    availableSpaces,
    
    // 인증 관련 메서드
    login,
    loginWithGoogle,
    logout,
    
    // Space 관련 메서드
    switchSpace,
    joinSpace,
    leaveSpace,
    createSpace,
    
    // 토큰 갱신 메서드
    refreshUserToken,
    refreshSpaceMemberToken,
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// useAuth Hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  
  return context;
};

// HOC - User 인증 필요
export const withUserAuth = <P extends object>(Component: React.ComponentType<P>) => {
  return (props: P) => {
    const { isUserAuthenticated, isUserLoading } = useAuth();
    
    if (isUserLoading) {
      return <div>Loading...</div>;
    }
    
    if (!isUserAuthenticated) {
      // 로그인 페이지로 리다이렉트
      window.location.href = '/login';
      return null;
    }
    
    return <Component {...props} />;
  };
};

// HOC - SpaceMember 인증 필요
export const withSpaceMemberAuth = <P extends object>(Component: React.ComponentType<P>) => {
  return (props: P) => {
    const { isUserAuthenticated, isSpaceMemberAuthenticated, isUserLoading, isSpaceLoading } = useAuth();
    
    if (isUserLoading || isSpaceLoading) {
      return <div>Loading...</div>;
    }
    
    if (!isUserAuthenticated) {
      // 로그인 페이지로 리다이렉트
      window.location.href = '/login';
      return null;
    }
    
    if (!isSpaceMemberAuthenticated) {
      // Space 선택 페이지로 리다이렉트
      window.location.href = '/spaces';
      return null;
    }
    
    return <Component {...props} />;
  };
};

// 사용 예제
/*
// App.tsx
import { AuthProvider } from './AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/spaces" element={<SpaceSelection />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

// Dashboard.tsx
import { useAuth, withSpaceMemberAuth } from './AuthContext';

const Dashboard = () => {
  const { user, currentSpace, currentSpaceMember, switchSpace } = useAuth();
  
  return (
    <div>
      <h1>Welcome {user?.name}!</h1>
      <h2>Current Space: {currentSpace?.name}</h2>
      <p>Your role: {currentSpaceMember?.role}</p>
      
      <button onClick={() => switchSpace('another-space-id')}>
        Switch Space
      </button>
    </div>
  );
};

export default withSpaceMemberAuth(Dashboard);
*/