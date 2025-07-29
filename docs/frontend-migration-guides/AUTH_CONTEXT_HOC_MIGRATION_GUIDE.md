# AuthContext HoC 마이그레이션 가이드

## 개요

이 가이드는 기존 User-centric AuthContext에서 SpaceMember-centric AuthContext로 마이그레이션하는 방법을 설명합니다. 주요 변경사항은 SpaceMember 단위의 인증 상태 관리와 이중 토큰 체계 지원입니다.

## 주요 변경사항 요약

### 1. API 헤더 전송 방식

- **변경**: Authorization: Bearer {token} 헤더로 명시적 전송
- Space별로 다른 토큰 사용

### 2. 새로운 API 엔드포인트

- Space 로그인: `POST /auth/spaces/:spaceSlug/login`
- SpaceMember 토큰 갱신: `POST /auth/space-member/refresh`
- SpaceMember 로그아웃: `POST /auth/space-member/logout`
- 현재 SpaceMember 정보: `GET /api/v1/space-members/me`

### 3. Space 전환 로직

- 여러 Space에 동시 로그인 가능
- Space 전환 시 해당 Space의 토큰 사용
- WebSocket 재연결 처리 필요

## 목차

1. [현재 구조 분석](#1-현재-구조-분석)
2. [변경 필요 사항](#2-변경-필요-사항)
3. [마이그레이션 단계별 가이드](#3-마이그레이션-단계별-가이드)
4. [구현 예시 코드](#4-구현-예시-코드)
5. [마이그레이션 시 주의사항](#5-마이그레이션-시-주의사항)
6. [테스트 가이드](#6-테스트-가이드)
7. [마이그레이션 체크리스트](#7-마이그레이션-체크리스트)

## 1. 현재 구조 분석

### 기존 AuthContext 구조

현재 AuthContext는 다음과 같은 구조로 되어 있습니다:

```typescript
interface AuthContextValue {
  // 사용자 정보
  user: (User & { centrifugoToken?: string }) | undefined;
  latestSpace: UserWithLatestSpace | undefined;

  // 인증 상태
  isAuthenticated: boolean;
  isInitialized: boolean;
  isLoading: boolean;

  // 액션들
  logout: () => void;
  refetchUser: () => void;
  setAuthData: (params: {
    accessToken: string;
    refreshToken: string;
    userId: string;
    userEmail: string;
  }) => Promise<void>;
}
```

### getCurrentUserWithLatestSpace 사용 방식

- **엔드포인트**: `/me/latest-space`
- **인증 방식**: User 레벨 토큰 (Authorization Header)
- **응답 데이터**: User 정보 + 최근 접속한 Space의 Member 정보

### 현재 상태 관리 로직

1. 앱 시작 시 토큰 유효성 체크
2. 단일 쿼리로 사용자 및 최신 스페이스 정보 조회
3. localStorage에 사용자 정보 저장
4. 자동 토큰 갱신 (useAutoRefreshToken)

## 2. 변경 필요 사항

### SpaceMember 상태 추가

```typescript
interface SpaceMemberInfo {
  spaceMemberId: string;
  spaceId: string;
  spaceSlug: string;
  role: string;
  name: string;
  avatarURL?: string;
  centrifugoToken?: string;
}
```

### 이중 토큰 체계 지원

1. **User 토큰**: Authorization Header (기존 방식 유지)

   - localStorage/sessionStorage에 저장: `{accessToken, refreshToken}`
   - Authorization: Bearer {user_token} 헤더로 전송

2. **SpaceMember 토큰**: localStorage/sessionStorage 기반 (새로운 방식)
   - 저장 구조: `{spaceSlug: {accessToken, refreshToken}}`
   - Authorization: Bearer {space_member_token} 헤더로 전송
   - Space별로 독립적인 토큰 관리

### 스페이스별 인증 상태 관리

- 여러 Space에 동시 로그인 가능
- Space 전환 시 해당 Space의 인증 상태 사용
- Space별 독립적인 토큰 관리

## 3. 마이그레이션 단계별 가이드

### 1단계: AuthContext 인터페이스 확장

```typescript
interface AuthContextValue {
  // 기존 사용자 정보
  user: (User & { centrifugoToken?: string }) | undefined;
  latestSpace: UserWithLatestSpace | undefined;

  // 새로운 SpaceMember 정보
  currentSpaceMember: SpaceMemberInfo | undefined;
  availableSpaces: SpaceMemberInfo[];

  // 인증 상태
  isAuthenticated: boolean;
  isSpaceAuthenticated: boolean; // 새로 추가
  isInitialized: boolean;
  isLoading: boolean;

  // 액션들
  logout: () => void;
  logoutFromSpace: (spaceSlug: string) => void; // 새로 추가
  switchSpace: (spaceSlug: string) => Promise<void>; // 새로 추가
  refetchUser: () => void;
  refetchSpaceMember: () => void; // 새로 추가

  // 유틸리티 함수들
  setAuthData: (params: {
    accessToken: string;
    refreshToken: string;
    userId: string;
    userEmail: string;
  }) => Promise<void>;

  setSpaceAuthData: (params: {
    // 새로 추가
    spaceSlug: string;
    spaceMemberId: string;
    spaceId: string;
    role: string;
  }) => Promise<void>;
}
```

### 2단계: SpaceMember 상태 관리 추가

```typescript
// SpaceMember 정보를 관리하는 새로운 상태
const [currentSpaceMember, setCurrentSpaceMember] = useState<SpaceMemberInfo | undefined>();
const [availableSpaces, setAvailableSpaces] = useState<SpaceMemberInfo[]>([]);

// SpaceMember 정보 조회 쿼리
const {
  data: spaceMemberData,
  isLoading: isSpaceMemberLoading,
  refetch: refetchSpaceMember,
} = useQuery({
  queryKey: authKeys.spaceMember(),
  queryFn: async () => {
    const data = await authApi.getCurrentSpaceMember(); // /api/v1/space-members/me
    return data;
  },
  enabled: isInitialized && !!currentSpaceSlug,
  staleTime: 5 * 60 * 1000,
  gcTime: 10 * 60 * 1000,
});
```

### 3단계: API 호출 방식 변경

```typescript
// 기존 방식 (병렬 지원을 위해 유지)
const fetchUserWithLatestSpace = async () => {
  const data = await authApi.getCurrentUserWithLatestSpace(); // /me/latest-space
  return data;
};

// 새로운 방식 추가
const fetchCurrentSpaceMember = async () => {
  const data = await authApi.getCurrentSpaceMember(); // /api/v1/space-members/me
  return data;
};

// Space 로그인 API
const loginToSpace = async (spaceSlug: string, password?: string) => {
  const response = await authApi.loginToSpace(spaceSlug, password); // POST /auth/spaces/:spaceSlug/login

  // SpaceMember 토큰 저장
  SpaceMemberTokenManager.setToken(spaceSlug, {
    accessToken: response.accessToken,
    refreshToken: response.refreshToken,
  });

  return response;
};

// 통합 데이터 조회 함수
const fetchAuthData = async () => {
  // Feature flag 확인
  const useSpaceMemberAuth = await checkFeatureFlag('space_member_full_migration');

  if (useSpaceMemberAuth) {
    // 새로운 방식: SpaceMember 중심
    const [userData, spaceMemberData] = await Promise.all([
      authApi.getCurrentUser(), // /api/v1/users/me (deprecated이지만 호환성 유지)
      authApi.getCurrentSpaceMember(), // /api/v1/space-members/me
    ]);

    return {
      user: userData,
      spaceMember: spaceMemberData,
      latestSpace: spaceMemberData, // 호환성을 위해 매핑
    };
  } else {
    // 기존 방식 유지
    const data = await authApi.getCurrentUserWithLatestSpace();
    return {
      user: data,
      latestSpace: data,
      spaceMember: null,
    };
  }
};
```

### 4단계: 토큰 갱신 로직 통합

```typescript
// 통합 토큰 갱신 훅
const useAutoRefreshToken = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        // User 토큰 갱신 (기존 방식)
        if (TokenManager.shouldRefreshToken()) {
          await authApi.refreshToken();
        }

        // SpaceMember 토큰 갱신 (새로운 방식)
        const currentSpaceSlug = getCurrentSpaceSlug();
        if (currentSpaceSlug && SpaceMemberTokenManager.shouldRefreshToken(currentSpaceSlug)) {
          const response = await authApi.refreshSpaceMemberToken(); // POST /auth/space-member/refresh

          // 갱신된 토큰 저장
          SpaceMemberTokenManager.setToken(currentSpaceSlug, {
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
          });

          // 갱신 후 SpaceMember 정보 다시 조회
          await queryClient.invalidateQueries({
            queryKey: authKeys.spaceMember(),
          });
        }
      } catch (error) {
        console.error('Token refresh failed:', error);
      }
    }, 60000); // 1분마다 체크

    return () => clearInterval(interval);
  }, [queryClient]);
};
```

## 4. 구현 예시 코드

### SpaceMemberTokenManager 클래스

```typescript
// shared/lib/token/SpaceMemberTokenManager.ts
import { jwtDecode } from 'jwt-decode';

interface SpaceMemberTokens {
  accessToken: string;
  refreshToken: string;
}

interface SpaceMemberTokenStorage {
  [spaceSlug: string]: SpaceMemberTokens;
}

export class SpaceMemberTokenManager {
  private static STORAGE_KEY = 'space_member_tokens';
  private static storage: 'localStorage' | 'sessionStorage' = 'localStorage';

  static setStorageType(type: 'localStorage' | 'sessionStorage') {
    this.storage = type;
  }

  private static getStorage() {
    return typeof window !== 'undefined' ? window[this.storage] : null;
  }

  static getTokens(): SpaceMemberTokenStorage {
    const storage = this.getStorage();
    if (!storage) return {};

    const data = storage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  }

  static setToken(spaceSlug: string, tokens: SpaceMemberTokens) {
    const storage = this.getStorage();
    if (!storage) return;

    const allTokens = this.getTokens();
    allTokens[spaceSlug] = tokens;
    storage.setItem(this.STORAGE_KEY, JSON.stringify(allTokens));
  }

  static getToken(spaceSlug: string): SpaceMemberTokens | null {
    const tokens = this.getTokens();
    return tokens[spaceSlug] || null;
  }

  static clearToken(spaceSlug: string) {
    const storage = this.getStorage();
    if (!storage) return;

    const allTokens = this.getTokens();
    delete allTokens[spaceSlug];
    storage.setItem(this.STORAGE_KEY, JSON.stringify(allTokens));
  }

  static clearAllTokens() {
    const storage = this.getStorage();
    if (!storage) return;

    storage.removeItem(this.STORAGE_KEY);
  }

  static hasValidToken(spaceSlug: string): boolean {
    const tokens = this.getToken(spaceSlug);
    if (!tokens) return false;

    try {
      const decoded = jwtDecode(tokens.accessToken);
      if (!decoded.exp) return false;

      const currentTime = Date.now() / 1000;
      return decoded.exp > currentTime;
    } catch {
      return false;
    }
  }

  static shouldRefreshToken(spaceSlug: string): boolean {
    const tokens = this.getToken(spaceSlug);
    if (!tokens) return false;

    try {
      const decoded = jwtDecode(tokens.accessToken);
      if (!decoded.exp) return false;

      const currentTime = Date.now() / 1000;
      const timeUntilExpiry = decoded.exp - currentTime;

      // 토큰 만료 5분 전에 갱신
      return timeUntilExpiry < 300;
    } catch {
      return false;
    }
  }

  static getAccessToken(spaceSlug: string): string | null {
    const tokens = this.getToken(spaceSlug);
    return tokens?.accessToken || null;
  }

  static getRefreshToken(spaceSlug: string): string | null {
    const tokens = this.getToken(spaceSlug);
    return tokens?.refreshToken || null;
  }
}
```

### 확장된 AuthContext 인터페이스

```typescript
'use client';

import { ROUTES } from '@/shared/constants';
import { useAutoRefreshToken } from '@/shared/hooks/auth/useAutoRefreshToken';
import { authKeys } from '@/shared/hooks/queries/authKeys';
import { authApi } from '@/shared/lib/api/auth';
import { TokenManager, SpaceMemberTokenManager } from '@/shared/lib/token';
import type { User, UserWithLatestSpace, SpaceMemberInfo } from '@/shared/types/auth';
import { authRetry } from '@/shared/utils/query';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';

interface ExtendedAuthContextValue {
  // 사용자 정보 (기존)
  user: (User & { centrifugoToken?: string }) | undefined;
  latestSpace: UserWithLatestSpace | undefined;

  // SpaceMember 정보 (새로 추가)
  currentSpaceMember: SpaceMemberInfo | undefined;
  availableSpaces: SpaceMemberInfo[];
  currentSpaceSlug: string | undefined;

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
  setAuthData: (params: {
    accessToken: string;
    refreshToken: string;
    userId: string;
    userEmail: string;
  }) => Promise<void>;

  setSpaceAuthData: (params: {
    spaceSlug: string;
    spaceMemberId: string;
    spaceId: string;
    role: string;
  }) => Promise<void>;
}

const AuthContext = createContext<ExtendedAuthContextValue | null>(null);
```

### SpaceMember 상태 관리 훅

```typescript
// SpaceMember 관리를 위한 커스텀 훅
function useSpaceMemberState() {
  const [currentSpaceSlug, setCurrentSpaceSlug] = useState<string | undefined>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('current_space_slug') || undefined;
    }
    return undefined;
  });

  const [availableSpaces, setAvailableSpaces] = useState<SpaceMemberInfo[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('available_spaces');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  // SpaceMember 정보 조회
  const {
    data: spaceMemberData,
    isLoading: isSpaceMemberLoading,
    error: spaceMemberError,
    refetch: refetchSpaceMember,
  } = useQuery({
    queryKey: authKeys.spaceMember(currentSpaceSlug),
    queryFn: async () => {
      if (!currentSpaceSlug) return null;

      const data = await authApi.getCurrentSpaceMember();

      // 사용 가능한 Space 목록 업데이트
      const updatedSpaces = [...availableSpaces];
      const existingIndex = updatedSpaces.findIndex(s => s.spaceSlug === currentSpaceSlug);

      if (existingIndex >= 0) {
        updatedSpaces[existingIndex] = data;
      } else {
        updatedSpaces.push(data);
      }

      setAvailableSpaces(updatedSpaces);
      localStorage.setItem('available_spaces', JSON.stringify(updatedSpaces));

      return data;
    },
    enabled: !!currentSpaceSlug,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: authRetry,
  });

  const switchSpace = async (newSpaceSlug: string) => {
    setCurrentSpaceSlug(newSpaceSlug);
    localStorage.setItem('current_space_slug', newSpaceSlug);

    // Space 전환 시 WebSocket 재연결 등의 작업 수행
    await handleSpaceSwitch(currentSpaceSlug, newSpaceSlug);
  };

  return {
    currentSpaceSlug,
    currentSpaceMember: spaceMemberData,
    availableSpaces,
    isSpaceMemberLoading,
    spaceMemberError,
    refetchSpaceMember,
    switchSpace,
  };
}
```

### 새로운 로그인/로그아웃 함수

### API 클라이언트 구현

```typescript
// shared/lib/api/auth.ts
import { apiClient } from './client';
import { SpaceMemberTokenManager } from '../token/SpaceMemberTokenManager';

export const authApi = {
  // User 관련 API (기존 유지)
  getCurrentUser: () => apiClient.get('/api/v1/users/me').json(),

  getCurrentUserWithLatestSpace: () => apiClient.get('/me/latest-space').json(),

  refreshToken: () => apiClient.post('/auth/refresh').json(),

  logout: () => apiClient.post('/auth/logout').json(),

  // SpaceMember 관련 API (새로 추가)
  loginToSpace: (spaceSlug: string, password?: string) =>
    apiClient
      .post(`/auth/spaces/${spaceSlug}/login`, {
        json: { password },
      })
      .json(),

  getCurrentSpaceMember: () => {
    const currentSpaceSlug = getCurrentSpaceSlug();
    if (!currentSpaceSlug) {
      throw new Error('No current space selected');
    }

    const token = SpaceMemberTokenManager.getAccessToken(currentSpaceSlug);
    if (!token) {
      throw new Error('No space member token found');
    }

    return apiClient
      .get('/api/v1/space-members/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .json();
  },

  refreshSpaceMemberToken: () => {
    const currentSpaceSlug = getCurrentSpaceSlug();
    if (!currentSpaceSlug) {
      throw new Error('No current space selected');
    }

    const refreshToken = SpaceMemberTokenManager.getRefreshToken(currentSpaceSlug);
    if (!refreshToken) {
      throw new Error('No refresh token found');
    }

    return apiClient
      .post('/auth/space-member/refresh', {
        headers: {
          Authorization: `Bearer ${refreshToken}`,
        },
      })
      .json();
  },

  logoutFromSpace: () => {
    const currentSpaceSlug = getCurrentSpaceSlug();
    if (!currentSpaceSlug) {
      throw new Error('No current space selected');
    }

    const token = SpaceMemberTokenManager.getAccessToken(currentSpaceSlug);
    if (!token) {
      throw new Error('No space member token found');
    }

    return apiClient
      .post('/auth/space-member/logout', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .json();
  },
};

// Helper function to get current space slug
function getCurrentSpaceSlug(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('current_space_slug');
}
```

### AuthProvider 구현

```typescript
export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [isInitialized, setIsInitialized] = useState(false);
  const [isSwitchingSpace, setIsSwitchingSpace] = useState(false);

  // SpaceMember 상태 관리
  const {
    currentSpaceSlug,
    currentSpaceMember,
    availableSpaces,
    isSpaceMemberLoading,
    spaceMemberError,
    refetchSpaceMember,
    switchSpace: switchSpaceInternal,
  } = useSpaceMemberState();

  // 기존 User 관련 로직 유지...

  // Space 전환 함수
  const switchSpace = async (spaceSlug: string) => {
    setIsSwitchingSpace(true);
    try {
      // 해당 Space의 토큰이 있는지 확인
      if (!SpaceMemberTokenManager.hasValidToken(spaceSlug)) {
        // 없으면 로그인 페이지로 리다이렉트
        router.push(`${ROUTES.AUTH}?space=${spaceSlug}`);
        return;
      }

      await switchSpaceInternal(spaceSlug);

      // UI 및 데이터 새로고침
      await queryClient.invalidateQueries({
        queryKey: authKeys.all,
      });
    } finally {
      setIsSwitchingSpace(false);
    }
  };

  // Space별 로그아웃
  const logoutFromSpace = async (spaceSlug: string) => {
    try {
      await authApi.logoutFromSpace(); // POST /auth/space-member/logout

      // 해당 Space 토큰 제거
      SpaceMemberTokenManager.clearToken(spaceSlug);

      // Available spaces에서 제거
      const updatedSpaces = availableSpaces.filter(
        (s) => s.spaceSlug !== spaceSlug
      );
      setAvailableSpaces(updatedSpaces);
      localStorage.setItem("available_spaces", JSON.stringify(updatedSpaces));

      // 현재 Space에서 로그아웃한 경우
      if (currentSpaceSlug === spaceSlug) {
        if (updatedSpaces.length > 0) {
          // 다른 Space로 전환
          await switchSpace(updatedSpaces[0].spaceSlug);
        } else {
          // 모든 Space에서 로그아웃됨
          await logout();
        }
      }
    } catch (error) {
      console.error("Space logout error:", error);
    }
  };

  // 전체 로그아웃 (기존 + SpaceMember 정리)
  const logoutMutation = useMutation({
    mutationFn: async () => {
      // 현재 Space에서 로그아웃 (SpaceMember 토큰이 있는 경우)
      if (
        currentSpaceSlug &&
        SpaceMemberTokenManager.hasValidToken(currentSpaceSlug)
      ) {
        await authApi.logoutFromSpace(); // POST /auth/space-member/logout
      }

      // User 레벨 로그아웃
      await authApi.logout();
    },
    onMutate: async () => {
      await queryClient.cancelQueries();
    },
    onSettled: async () => {
      // 모든 토큰 제거
      TokenManager.clearTokens();
      SpaceMemberTokenManager.clearAllTokens();

      // 로컬 데이터 정리
      if (typeof window !== "undefined") {
        localStorage.removeItem("user");
        localStorage.removeItem("current_space_slug");
        localStorage.removeItem("available_spaces");
      }

      queryClient.clear();
      router.replace(ROUTES.AUTH);
    },
  });

  // Space 인증 데이터 설정
  const setSpaceAuthData = async (params: {
    spaceSlug: string;
    spaceMemberId: string;
    spaceId: string;
    role: string;
  }) => {
    // Space 정보 저장
    const spaceInfo: SpaceMemberInfo = {
      spaceMemberId: params.spaceMemberId,
      spaceId: params.spaceId,
      spaceSlug: params.spaceSlug,
      role: params.role,
      name: user?.name || "",
      avatarURL: user?.avatarURL,
    };

    // Available spaces 업데이트
    const updatedSpaces = [...availableSpaces];
    const existingIndex = updatedSpaces.findIndex(
      (s) => s.spaceSlug === params.spaceSlug
    );

    if (existingIndex >= 0) {
      updatedSpaces[existingIndex] = spaceInfo;
    } else {
      updatedSpaces.push(spaceInfo);
    }

    setAvailableSpaces(updatedSpaces);
    localStorage.setItem("available_spaces", JSON.stringify(updatedSpaces));

    // 현재 Space로 설정
    await switchSpace(params.spaceSlug);
  };

  const value: ExtendedAuthContextValue = {
    // 사용자 정보
    user,
    latestSpace,
    currentSpaceMember,
    availableSpaces,
    currentSpaceSlug,

    // 인증 상태
    isAuthenticated: !!user && TokenManager.isRefreshTokenValid(),
    isSpaceAuthenticated:
      !!currentSpaceMember &&
      !!currentSpaceSlug &&
      SpaceMemberTokenManager.hasValidToken(currentSpaceSlug),
    isInitialized,
    isLoading: !isInitialized || isUserLoading || isSpaceMemberLoading,

    // 에러 상태
    error: error || (spaceMemberError as Error | null),
    isError: isError || !!spaceMemberError,

    // 액션들
    logout: () => logoutMutation.mutate(),
    logoutFromSpace,
    switchSpace,
    refetchUser,
    refetchSpaceMember,

    // 로딩 상태들
    isLoggingOut: logoutMutation.isPending,
    isSwitchingSpace,

    // 유틸리티 함수들
    setAuthData,
    setSpaceAuthData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
```

## 5. 마이그레이션 시 주의사항

### 하위 호환성 유지 방법

1. **기존 API 병렬 지원**

   ```typescript
   // 기존 코드가 계속 동작하도록 latestSpace 유지
   const latestSpace = currentSpaceMember || userWithSpace?.latestSpace;
   ```

2. **점진적 타입 변경**

   ```typescript
   // 기존 타입을 확장하여 사용
   type ExtendedUser = User & {
     spaceMemberId?: string;
     currentSpaceSlug?: string;
   };
   ```

3. **Feature Flag 활용**
   ```typescript
   const useNewAuth = await checkFeatureFlag('space_member_auth_enabled');
   if (useNewAuth) {
     // 새로운 방식
   } else {
     // 기존 방식
   }
   ```

### 구현 순서

#### Task 1: 토큰 관리 전환

- SpaceMemberTokenManager 클래스 구현
- localStorage 사용

#### Task 2: API 엔드포인트 전환

- 새로운 SpaceMember API 엔드포인트 사용
- Space 로그인: POST /auth/spaces/:spaceSlug/login
- 토큰 갱신: POST /auth/space-member/refresh
- 로그아웃: POST /auth/space-member/logout

#### Task 3: 이중 토큰 관리 완성

- User 토큰과 SpaceMember 토큰 독립적 관리
- Space 전환 시 해당 Space의 토큰 사용
- 토큰 갱신 로직 통합

### 롤백 계획

1. **즉시 롤백 가능한 구조**

   ```typescript
   const AUTH_VERSION = process.env.NEXT_PUBLIC_AUTH_VERSION || 'v1';

   export function useAuth() {
     if (AUTH_VERSION === 'v2') {
       return useAuthV2();
     }
     return useAuthV1();
   }
   ```

2. **데이터 백업**

   - 마이그레이션 전 localStorage 백업
   - 토큰 정보 별도 저장

3. **에러 모니터링**
   - Sentry 등으로 에러율 추적
   - 임계치 초과 시 자동 롤백

## 6. 테스트 가이드

### Context 상태 변화 테스트

```typescript
import { renderHook, act } from "@testing-library/react-hooks";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "./AuthContext";

describe("AuthContext Migration", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
  });

  it("should maintain user authentication while adding space member", async () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        <AuthProvider>{children}</AuthProvider>
      </QueryClientProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    // 기존 User 인증
    await act(async () => {
      await result.current.setAuthData({
        accessToken: "user-token",
        refreshToken: "user-refresh",
        userId: "user-123",
        userEmail: "test@example.com",
      });
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user?.id).toBe("user-123");

    // SpaceMember 인증 추가
    await act(async () => {
      await result.current.setSpaceAuthData({
        spaceSlug: "test-space",
        spaceMemberId: "member-123",
        spaceId: "space-123",
        role: "member",
      });
    });

    expect(result.current.isSpaceAuthenticated).toBe(true);
    expect(result.current.currentSpaceMember?.spaceMemberId).toBe("member-123");
    expect(result.current.currentSpaceSlug).toBe("test-space");
  });
});
```

### 토큰 갱신 테스트

```typescript
describe('Token Refresh', () => {
  it('should refresh both user and space member tokens', async () => {
    const mockRefreshUser = jest.fn().mockResolvedValue({
      accessToken: 'new-user-token',
    });

    const mockRefreshSpaceMember = jest.fn().mockResolvedValue({
      accessToken: 'new-space-token',
      refreshToken: 'new-space-refresh-token',
    });

    // Mock API
    jest.spyOn(authApi, 'refreshToken').mockImplementation(mockRefreshUser);
    jest.spyOn(authApi, 'refreshSpaceMemberToken').mockImplementation(mockRefreshSpaceMember);

    // 토큰 만료 시뮬레이션
    jest.spyOn(TokenManager, 'shouldRefreshToken').mockReturnValue(true);
    jest.spyOn(SpaceMemberTokenManager, 'shouldRefreshToken').mockReturnValue(true);

    // 자동 갱신 트리거
    await act(async () => {
      jest.advanceTimersByTime(60000); // 1분 경과
    });

    expect(mockRefreshUser).toHaveBeenCalled();
    expect(mockRefreshSpaceMember).toHaveBeenCalled();
  });
});
```

### 스페이스 전환 테스트

```typescript
describe('Space Switching', () => {
  it('should switch between spaces correctly', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    // Space A 설정
    await act(async () => {
      await result.current.setSpaceAuthData({
        spaceSlug: 'space-a',
        spaceMemberId: 'member-a',
        spaceId: 'space-id-a',
        role: 'admin',
      });
    });

    expect(result.current.currentSpaceSlug).toBe('space-a');

    // Space B 추가
    await act(async () => {
      await result.current.setSpaceAuthData({
        spaceSlug: 'space-b',
        spaceMemberId: 'member-b',
        spaceId: 'space-id-b',
        role: 'member',
      });
    });

    // Space A로 다시 전환
    await act(async () => {
      await result.current.switchSpace('space-a');
    });

    expect(result.current.currentSpaceSlug).toBe('space-a');
    expect(result.current.currentSpaceMember?.role).toBe('admin');
    expect(result.current.availableSpaces).toHaveLength(2);
  });

  it('should handle WebSocket reconnection on space switch', async () => {
    const mockDisconnect = jest.fn();
    const mockConnect = jest.fn();

    // Mock WebSocket manager
    jest.spyOn(wsManager, 'disconnect').mockImplementation(mockDisconnect);
    jest.spyOn(wsManager, 'connect').mockImplementation(mockConnect);

    await act(async () => {
      await result.current.switchSpace('new-space');
    });

    expect(mockDisconnect).toHaveBeenCalled();
    expect(mockConnect).toHaveBeenCalledWith('new-space');
  });
});
```

## 7. 마이그레이션 체크리스트

### 준비 단계

- [ ] 기존 AuthContext 백업
- [ ] 테스트 환경 구성
- [ ] Feature Flag 설정
- [ ] 모니터링 대시보드 준비

### 구현 단계

- [ ] SpaceMemberTokenManager 클래스 구현 (localStorage/sessionStorage 기반)
- [ ] AuthContext 인터페이스 확장 (SpaceMember 상태 추가)
- [ ] useSpaceMemberState 훅 구현 (Space별 상태 관리)
- [ ] API 클라이언트 업데이트
  - [ ] Space 로그인 API 추가 (/auth/spaces/:spaceSlug/login)
  - [ ] SpaceMember 정보 조회 API 추가 (/api/v1/space-members/me)
  - [ ] SpaceMember 토큰 갱신 API 추가 (/auth/space-member/refresh)
  - [ ] SpaceMember 로그아웃 API 추가 (/auth/space-member/logout)
- [ ] Authorization 헤더 자동 추가 로직 구현
- [ ] 토큰 갱신 로직 통합 (User + SpaceMember)
- [ ] Space 전환 기능 구현
- [ ] WebSocket 재연결 로직 구현 (Space 전환 시)

### 테스트 단계

- [ ] 단위 테스트 작성 및 실행
- [ ] 통합 테스트 수행

## 마무리

이 가이드는 AuthContext의 SpaceMember-centric 아키텍처로의 마이그레이션을 위한 상세한 단계를 제공합니다.

점진적이고 안전한 마이그레이션을 위해 각 단계를 신중하게 진행하고, 충분한 테스트와 모니터링을 수행하시기 바랍니다.

추가 질문이나 이슈가 있으면 백엔드 팀에 문의해주세요.
