import type { User } from '@/shared/types/auth';

// SpaceMember 정보 인터페이스
export interface SpaceMemberInfo {
  id: string;
  spaceId: string;
  spaceSlug: string;
  role: string;
  name: string;
  avatarURL?: string;
  centrifugoToken?: string;
}

// OAuth 콜백용 파라미터
export interface AuthDataParams {
  accessToken: string;
  refreshToken: string;
  userId: string;
  userEmail: string;
}

// Space 인증 데이터 파라미터
export interface SpaceAuthDataParams {
  spaceSlug: string;
  spaceMemberId: string;
  spaceId: string;
  role: string;
}

export interface SpaceInfo {
  id: string;
  slug: string;
  name: string;
  iconURL?: string;
  members: SpaceMemberInfo[];
}

// AuthContext 값 인터페이스
export interface AuthContextValue {
  // User 정보 (기본 인증용)
  user: User | undefined;

  // SpaceMember 정보
  currentSpaceMember: SpaceMemberInfo | undefined;
  availableSpaces: SpaceMemberInfo[];
  currentSpaceSlug: string | undefined;
  currentSpace: SpaceInfo | undefined;

  // 인증 상태
  isAuthenticated: boolean;
  isSpaceAuthenticated: boolean;
  isInitialized: boolean;
  isLoading: boolean;

  // 에러 상태
  error: Error | null;
  isError: boolean;

  // 액션들
  logout: () => void;
  logoutFromSpace: (spaceSlug: string) => Promise<void>;
  switchSpace: (spaceSlug: string) => Promise<void>;
  refetchUser: () => void;
  refetchSpaceMember: () => void;

  // 로딩 상태들
  isLoggingOut: boolean;
  isSwitchingSpace: boolean;

  // 유틸리티 함수들
  setAuthData: (params: AuthDataParams) => Promise<void>;
  setSpaceAuthData: (params: SpaceAuthDataParams) => Promise<void>;
}
