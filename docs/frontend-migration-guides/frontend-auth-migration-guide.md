# 프론트엔드 인증 헤더 구현 가이드

## 개요

Scrumble 백엔드의 인증 시스템이 User 기반에서 SpaceMember 기반으로 전환됨에 따라, 프론트엔드에서도 API 호출 시 인증 헤더 설정 방식을 변경해야 합니다.

**중요 변경사항:**

- 모든 인증은 `Authorization: Bearer {token}` 헤더만 사용

## 1. 토큰 타입 및 TTL

### 토큰 종류

1. **User Token**: Google OAuth 로그인 시 발급

   - Access Token TTL: 15분
   - Refresh Token TTL: 30일

2. **SpaceMember Token**: 특정 스페이스 로그인 시 발급
   - Access Token TTL: 1시간
   - Refresh Token TTL: 7일

### 토큰 사용 범위

- **User Token**: 사용자 정보, 스페이스 목록 관리
- **SpaceMember Token**: 스페이스 내 활동 (포스트, 댓글, 할일, 반응, 알림)

## 2. API 엔드포인트별 인증 방식

### User 인증 필요 (User Token 사용)

```
GET    /api/v1/users/me
GET    /api/v1/users/me/latest-space
POST   /api/v1/spaces
PATCH  /api/v1/spaces/:spaceSlug
GET    /api/v1/spaces/my-list
GET    /api/v1/spaces/:spaceSlug
DELETE /api/v1/spaces/:spaceSlug
POST   /auth/spaces/:spaceSlug/login
POST   /auth/refresh
POST   /auth/logout
```

### SpaceMember 인증 필요 (SpaceMember Token 사용)

```
GET    /api/v1/space-members/me
POST   /api/v1/posts/checkin
POST   /api/v1/posts/checkout
PATCH  /api/v1/posts/checkin/:postId
PATCH  /api/v1/posts/checkout/:postId
DELETE /api/v1/posts/checkin/:postId
DELETE /api/v1/posts/checkout/:postId
GET    /api/v1/posts/checkin/exists
GET    /api/v1/posts/summary
GET    /api/v1/posts/:postId/date
GET    /api/v1/posts/
GET    /api/v1/posts/query
GET    /api/v1/posts/:postId/comments
POST   /api/v1/posts/:postId/comments
DELETE /api/v1/posts/:postId/comments/:commentId
PATCH  /api/v1/posts/:postId/comments/:commentId
GET    /api/v1/:targetType/:targetId/reactions
POST   /api/v1/:targetType/:targetId/reactions
DELETE /api/v1/:targetType/:targetId/reactions
GET    /api/v1/todos/
POST   /api/v1/todos/
PATCH  /api/v1/todos/:todoId
PATCH  /api/v1/todos/:todoId/toggle
DELETE /api/v1/todos/:todoId
GET    /api/v1/notifications/
GET    /api/v1/notifications/unreadCount
POST   /api/v1/notifications/bulk-read
POST   /api/v1/notifications/mark-all-read
POST   /auth/space-member/refresh
POST   /auth/space-member/logout
```

## 3. 프론트엔드 구현 예시

### 3.1 타입 정의

```typescript
// types/auth.ts
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface UserTokens extends TokenPair {
  type: "user";
}

export interface SpaceMemberTokens extends TokenPair {
  type: "spaceMember";
  spaceSlug: string;
  spaceMemberId: string;
  role: "owner" | "admin" | "member" | "viewer";
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}
```

### 3.2 토큰 관리 서비스

```typescript
// services/token.service.ts
class TokenService {
  private static readonly USER_ACCESS_TOKEN_KEY = "user_access_token";
  private static readonly USER_REFRESH_TOKEN_KEY = "user_refresh_token";
  private static readonly SPACE_MEMBER_TOKENS_KEY = "space_member_tokens";
  private static readonly CURRENT_SPACE_KEY = "current_space_slug";

  // User Token 관리
  setUserTokens(tokens: TokenPair): void {
    localStorage.setItem(this.USER_ACCESS_TOKEN_KEY, tokens.accessToken);
    localStorage.setItem(this.USER_REFRESH_TOKEN_KEY, tokens.refreshToken);
  }

  getUserAccessToken(): string | null {
    return localStorage.getItem(this.USER_ACCESS_TOKEN_KEY);
  }

  getUserRefreshToken(): string | null {
    return localStorage.getItem(this.USER_REFRESH_TOKEN_KEY);
  }

  clearUserTokens(): void {
    localStorage.removeItem(this.USER_ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.USER_REFRESH_TOKEN_KEY);
  }

  // SpaceMember Token 관리
  setSpaceMemberTokens(
    spaceSlug: string,
    tokens: TokenPair,
    spaceMemberId: string,
    role: string
  ): void {
    const spaceMemberTokens = this.getAllSpaceMemberTokens();
    spaceMemberTokens[spaceSlug] = {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      spaceMemberId,
      role,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(
      this.SPACE_MEMBER_TOKENS_KEY,
      JSON.stringify(spaceMemberTokens)
    );
    this.setCurrentSpace(spaceSlug);
  }

  getSpaceMemberTokens(spaceSlug: string): SpaceMemberTokens | null {
    const tokens = this.getAllSpaceMemberTokens();
    const tokenData = tokens[spaceSlug];
    if (!tokenData) return null;

    return {
      type: "spaceMember",
      accessToken: tokenData.accessToken,
      refreshToken: tokenData.refreshToken,
      spaceSlug,
      spaceMemberId: tokenData.spaceMemberId,
      role: tokenData.role as any,
    };
  }

  getCurrentSpaceMemberTokens(): SpaceMemberTokens | null {
    const currentSpace = this.getCurrentSpace();
    if (!currentSpace) return null;
    return this.getSpaceMemberTokens(currentSpace);
  }

  clearSpaceMemberTokens(spaceSlug: string): void {
    const tokens = this.getAllSpaceMemberTokens();
    delete tokens[spaceSlug];
    localStorage.setItem(this.SPACE_MEMBER_TOKENS_KEY, JSON.stringify(tokens));

    if (this.getCurrentSpace() === spaceSlug) {
      localStorage.removeItem(this.CURRENT_SPACE_KEY);
    }
  }

  clearAllTokens(): void {
    this.clearUserTokens();
    localStorage.removeItem(this.SPACE_MEMBER_TOKENS_KEY);
    localStorage.removeItem(this.CURRENT_SPACE_KEY);
  }

  // Current Space 관리
  setCurrentSpace(spaceSlug: string): void {
    localStorage.setItem(this.CURRENT_SPACE_KEY, spaceSlug);
  }

  getCurrentSpace(): string | null {
    return localStorage.getItem(this.CURRENT_SPACE_KEY);
  }

  private getAllSpaceMemberTokens(): Record<string, any> {
    const stored = localStorage.getItem(this.SPACE_MEMBER_TOKENS_KEY);
    return stored ? JSON.parse(stored) : {};
  }
}

export default new TokenService();
```

### 3.3 Axios 인터셉터 설정

```typescript
// api/client.ts
import axios, { AxiosError } from "axios";
import tokenService from "../services/token.service";

// API 클라이언트 생성
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request 인터셉터
apiClient.interceptors.request.use(
  (config) => {
    // API 경로에 따라 적절한 토큰 선택
    const isSpaceMemberApi =
      config.url?.includes("/posts") ||
      config.url?.includes("/todos") ||
      config.url?.includes("/notifications") ||
      config.url?.includes("/reactions") ||
      config.url?.includes("/space-members") ||
      config.url?.includes("/comments") ||
      config.url === "/auth/space-member/refresh" ||
      config.url === "/auth/space-member/logout";

    if (isSpaceMemberApi) {
      // SpaceMember API - SpaceMember 토큰 사용
      const spaceMemberTokens = tokenService.getCurrentSpaceMemberTokens();
      if (spaceMemberTokens) {
        config.headers.Authorization = `Bearer ${spaceMemberTokens.accessToken}`;
      }
    } else {
      // User API - User 토큰 사용
      const userToken = tokenService.getUserAccessToken();
      if (userToken) {
        config.headers.Authorization = `Bearer ${userToken}`;
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response 인터셉터 (토큰 갱신 로직)
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config as any;

    // 401 에러이고 아직 재시도하지 않은 경우
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const errorCode = error.response.data?.code;

      // SpaceMember 토큰 만료
      if (
        errorCode === "SPACE_MEMBER_EXPIRED" ||
        errorCode === "SPACE_MEMBER_NOT_FOUND"
      ) {
        try {
          const currentSpace = tokenService.getCurrentSpace();
          if (!currentSpace) throw new Error("No current space");

          const spaceMemberTokens =
            tokenService.getSpaceMemberTokens(currentSpace);
          if (!spaceMemberTokens) throw new Error("No space member tokens");

          // SpaceMember 토큰 갱신
          const response = await apiClient.post("/auth/space-member/refresh", {
            refresh_token: spaceMemberTokens.refreshToken,
          });

          // 새 토큰 저장
          tokenService.setSpaceMemberTokens(
            currentSpace,
            response.data,
            spaceMemberTokens.spaceMemberId,
            spaceMemberTokens.role
          );

          // 원래 요청 재시도
          originalRequest.headers.Authorization = `Bearer ${response.data.access_token}`;
          return apiClient(originalRequest);
        } catch (refreshError) {
          // SpaceMember 토큰 갱신 실패 - User 토큰으로 재로그인 필요
          const currentSpace = tokenService.getCurrentSpace();
          if (currentSpace) {
            tokenService.clearSpaceMemberTokens(currentSpace);
          }
          // 스페이스 재로그인 필요 알림
          window.dispatchEvent(
            new CustomEvent("space-auth-required", {
              detail: { spaceSlug: currentSpace },
            })
          );
          return Promise.reject(refreshError);
        }
      }

      // User 토큰 만료
      if (
        errorCode === "TOKEN_EXPIRED" ||
        errorCode === "MISSING_AUTH_HEADER"
      ) {
        try {
          const refreshToken = tokenService.getUserRefreshToken();
          if (!refreshToken) throw new Error("No refresh token");

          // User 토큰 갱신
          const response = await apiClient.post("/auth/refresh", {
            refresh_token: refreshToken,
          });

          // 새 토큰 저장
          tokenService.setUserTokens(response.data);

          // 원래 요청 재시도
          originalRequest.headers.Authorization = `Bearer ${response.data.access_token}`;
          return apiClient(originalRequest);
        } catch (refreshError) {
          // User 토큰 갱신 실패 - 완전히 재로그인 필요
          tokenService.clearAllTokens();
          window.location.href = "/login";
          return Promise.reject(refreshError);
        }
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
```

### 3.4 인증 서비스

```typescript
// services/auth.service.ts
import apiClient from "../api/client";
import tokenService from "./token.service";

class AuthService {
  // Google OAuth 콜백 처리
  async handleOAuthCallback(
    accessToken: string,
    refreshToken: string
  ): Promise<void> {
    tokenService.setUserTokens({ accessToken, refreshToken });
  }

  // 스페이스 로그인
  async loginToSpace(spaceSlug: string): Promise<void> {
    try {
      const response = await apiClient.post(`/auth/spaces/${spaceSlug}/login`);
      const { tokens, space_member_id, role } = response.data;

      tokenService.setSpaceMemberTokens(
        spaceSlug,
        tokens,
        space_member_id,
        role
      );
    } catch (error) {
      console.error("Failed to login to space:", error);
      throw error;
    }
  }

  // 현재 사용자 정보 조회
  async getCurrentUser() {
    const response = await apiClient.get("/api/v1/users/me");
    return response.data;
  }

  // 현재 스페이스 멤버 정보 조회
  async getCurrentSpaceMember() {
    const response = await apiClient.get("/api/v1/space-members/me");
    return response.data;
  }

  // User 로그아웃
  async logout(): Promise<void> {
    try {
      await apiClient.post("/auth/logout");
    } finally {
      tokenService.clearAllTokens();
      window.location.href = "/login";
    }
  }

  // SpaceMember 로그아웃
  async logoutFromSpace(): Promise<void> {
    try {
      await apiClient.post("/auth/space-member/logout");
    } finally {
      const currentSpace = tokenService.getCurrentSpace();
      if (currentSpace) {
        tokenService.clearSpaceMemberTokens(currentSpace);
      }
    }
  }

  // 토큰 갱신
  async refreshUserToken(): Promise<void> {
    const refreshToken = tokenService.getUserRefreshToken();
    if (!refreshToken) throw new Error("No refresh token");

    const response = await apiClient.post("/auth/refresh", {
      refresh_token: refreshToken,
    });

    tokenService.setUserTokens(response.data);
  }

  async refreshSpaceMemberToken(spaceSlug: string): Promise<void> {
    const tokens = tokenService.getSpaceMemberTokens(spaceSlug);
    if (!tokens) throw new Error("No space member tokens");

    const response = await apiClient.post("/auth/space-member/refresh", {
      refresh_token: tokens.refreshToken,
    });

    tokenService.setSpaceMemberTokens(
      spaceSlug,
      response.data,
      tokens.spaceMemberId,
      tokens.role
    );
  }
}

export default new AuthService();
```

### 3.5 API 사용 예시

```typescript
// api/posts.api.ts
import apiClient from "./client";

export const postsApi = {
  // 체크인 포스트 생성
  async createCheckIn(content: string, todos?: string[]) {
    const response = await apiClient.post("/api/v1/posts/checkin", {
      content,
      todos,
    });
    return response.data;
  },

  // 체크인 포스트 수정
  async updateCheckIn(postId: string, content: string) {
    const response = await apiClient.patch(`/api/v1/posts/checkin/${postId}`, {
      content,
    });
    return response.data;
  },

  // 포스트 목록 조회
  async getPosts(params?: { date?: string; page?: number; limit?: number }) {
    const response = await apiClient.get("/api/v1/posts/", { params });
    return response.data;
  },

  // 포스트와 댓글 조회
  async getPostWithComments(postId: string) {
    const response = await apiClient.get(`/api/v1/posts/${postId}/comments`);
    return response.data;
  },
};

// api/spaces.api.ts
import apiClient from "./client";

export const spacesApi = {
  // 내 스페이스 목록 조회
  async getMySpaces() {
    const response = await apiClient.get("/api/v1/spaces/my-list");
    return response.data;
  },

  // 스페이스 생성
  async createSpace(data: {
    name: string;
    slug: string;
    description?: string;
  }) {
    const response = await apiClient.post("/api/v1/spaces", data);
    return response.data;
  },

  // 스페이스 정보 조회
  async getSpace(spaceSlug: string) {
    const response = await apiClient.get(`/api/v1/spaces/${spaceSlug}`);
    return response.data;
  },
};
```

### 3.6 React Hook 예시

```typescript
// hooks/useAuth.ts
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import authService from "../services/auth.service";
import tokenService from "../services/token.service";

export function useAuth() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentSpace, setCurrentSpace] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const userToken = tokenService.getUserAccessToken();
      const currentSpaceSlug = tokenService.getCurrentSpace();

      setIsAuthenticated(!!userToken);
      setCurrentSpace(currentSpaceSlug);
      setIsLoading(false);
    };

    checkAuth();

    // 스페이스 인증 필요 이벤트 리스너
    const handleSpaceAuthRequired = async (event: CustomEvent) => {
      const { spaceSlug } = event.detail;
      try {
        await authService.loginToSpace(spaceSlug);
      } catch (error) {
        console.error("Failed to re-authenticate to space:", error);
        router.push("/spaces");
      }
    };

    window.addEventListener(
      "space-auth-required",
      handleSpaceAuthRequired as any
    );

    return () => {
      window.removeEventListener(
        "space-auth-required",
        handleSpaceAuthRequired as any
      );
    };
  }, [router]);

  const switchSpace = async (spaceSlug: string) => {
    try {
      await authService.loginToSpace(spaceSlug);
      setCurrentSpace(spaceSlug);
      router.push(`/spaces/${spaceSlug}`);
    } catch (error) {
      console.error("Failed to switch space:", error);
      throw error;
    }
  };

  const logout = async () => {
    await authService.logout();
  };

  return {
    isAuthenticated,
    currentSpace,
    isLoading,
    switchSpace,
    logout,
  };
}
```

## 4. 마이그레이션 체크리스트

### 4.1 준비 단계

- [ ] 토큰 저장소를 localStorage로 통일

### 4.2 토큰 관리 구현

- [ ] TokenService 구현 (User/SpaceMember 토큰 분리 관리)
- [ ] 토큰 타입별 TTL 관리 로직 추가
- [ ] 현재 활성 스페이스 관리 로직 구현

### 4.3 API 클라이언트 수정

- [ ] Request 인터셉터에서 API 경로별 토큰 선택 로직 구현
- [ ] Response 인터셉터에서 토큰 타입별 갱신 로직 구현
- [ ] 모든 API 호출에서 `Authorization` 헤더만 사용하도록 수정

### 4.4 인증 플로우 구현

- [ ] Google OAuth 콜백 처리 (User 토큰 저장)
- [ ] 스페이스 로그인 구현 (SpaceMember 토큰 저장)
- [ ] 스페이스 전환 시 자동 로그인 로직 추가
- [ ] 토큰 만료 시 자동 갱신 및 재시도 로직 구현

### 4.5 에러 처리

- [ ] `SPACE_MEMBER_EXPIRED` 에러 처리
- [ ] `SPACE_MEMBER_NOT_FOUND` 에러 처리
- [ ] `TOKEN_EXPIRED` 에러 처리
- [ ] 토큰 갱신 실패 시 적절한 리다이렉트 처리

### 4.6 테스트

- [ ] User API 호출 테스트
- [ ] SpaceMember API 호출 테스트
- [ ] 토큰 자동 갱신 테스트
- [ ] 스페이스 전환 테스트
- [ ] 로그아웃 테스트

## 5. 주의사항

1. **토큰 저장**: 모든 토큰은 localStorage에 저장
2. **헤더 형식**: 모든 인증은 `Authorization: Bearer {token}` 형식만 사용
3. **토큰 분리**: User 토큰과 SpaceMember 토큰을 명확히 분리하여 관리
4. **자동 갱신**: 401 에러 시 토큰 타입에 따라 적절한 갱신 API 호출
5. **스페이스 독립성**: 각 스페이스별로 독립적인 SpaceMember 토큰 관리

## 6. 에러 코드 참조

| 코드                         | 설명                       | 처리 방법                          |
| ---------------------------- | -------------------------- | ---------------------------------- |
| `TOKEN_EXPIRED`              | User 토큰 만료             | User refresh token으로 갱신        |
| `MISSING_AUTH_HEADER`        | Authorization 헤더 누락    | 토큰 확인 후 재전송                |
| `SPACE_MEMBER_EXPIRED`       | SpaceMember 토큰 만료      | SpaceMember refresh token으로 갱신 |
| `SPACE_MEMBER_NOT_FOUND`     | SpaceMember를 찾을 수 없음 | 스페이스 재로그인 필요             |
| `SPACE_MEMBER_NO_PERMISSION` | 권한 부족                  | 에러 메시지 표시                   |

## 7. 보안 고려사항

1. **토큰 노출 방지**:

   - 토큰을 URL 파라미터로 전달하지 않기
   - 콘솔 로그에 토큰 출력하지 않기
   - 에러 메시지에 토큰 포함하지 않기

2. **토큰 검증**:

   - 토큰 만료 시간 클라이언트에서도 체크
   - 의심스러운 활동 시 토큰 무효화

3. **HTTPS 사용**:

   - 프로덕션 환경에서는 반드시 HTTPS 사용
   - 개발 환경에서도 가능한 HTTPS 사용 권장

4. **토큰 갱신**:
   - Refresh token은 한 번만 사용 (사용 후 새로운 refresh token 발급)
   - 동시에 여러 탭에서 갱신 시도 방지 로직 필요
