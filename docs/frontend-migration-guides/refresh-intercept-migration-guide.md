# Refresh 인터셉트 마이그레이션 가이드

## 1. 현재 구조 분석

### 기존 토큰 관리 방식

현재 시스템은 단일 사용자 토큰 관리 방식을 사용하고 있습니다:

- `TokenManager`를 통한 Access Token과 Refresh Token 관리
- 단일 Authorization 헤더 사용 (`Bearer {token}`)
- 401 에러 시 자동 토큰 갱신

### 현재 refresh 인터셉트 로직

```typescript
// 토큰 갱신 상태 관리 (대기열 방식)
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];
```

- 토큰 갱신 중 여러 요청이 동시에 발생할 경우 대기열 처리
- 첫 번째 요청이 토큰을 갱신하면 대기 중인 모든 요청이 새 토큰으로 재시도

### 대기열 처리 방식

- `isRefreshing` 플래그로 갱신 중 상태 관리
- `refreshSubscribers` 배열에 대기 중인 요청들의 콜백 저장
- 토큰 갱신 완료 시 `onTokenRefreshed`로 모든 대기 요청 처리

## 2. 변경 필요 사항

### 이중 토큰 관리 체계

- **User 토큰**: 기존 방식 유지 (`Authorization: Bearer {token}`)
- **SpaceMember 토큰**: Authorization 헤더로 전송
- 각 토큰의 독립적인 생명주기 관리

### 401 에러 처리

- 에러 코드로 User/SpaceMember 토큰 구분
- 각 토큰별 독립적인 갱신 로직
- 동시 만료 상황 처리

### 헤더 자동 설정

- API 경로에 따라 적절한 토큰 선택:
  - `/api/v1/users/*`, `/api/v1/spaces/*`: User 토큰
  - 나머지 API: SpaceMember 토큰

## 3. 마이그레이션 단계별 가이드

### 1단계: TokenManager 확장

```typescript
// token-manager.ts
export interface TokenData {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface SpaceMemberTokenData {
  accessToken: string;
  refreshToken: string;
  spaceId: string;
  expiresAt: number;
}

export class EnhancedTokenManager {
  private static readonly USER_TOKEN_KEY = 'user_tokens';
  private static readonly SPACE_MEMBER_TOKEN_KEY = 'space_member_token';

  // 사용자 토큰 관리 (기존과 동일)
  static setUserTokens(tokens: TokenData): void {
    localStorage.setItem(this.USER_TOKEN_KEY, JSON.stringify(tokens));
  }

  static getUserAccessToken(): string | null {
    const data = localStorage.getItem(this.USER_TOKEN_KEY);
    if (!data) return null;
    const tokens = JSON.parse(data) as TokenData;
    return tokens.accessToken;
  }

  static getUserRefreshToken(): string | null {
    const data = localStorage.getItem(this.USER_TOKEN_KEY);
    if (!data) return null;
    const tokens = JSON.parse(data) as TokenData;
    return tokens.refreshToken;
  }

  // SpaceMember 토큰 관리 (단일 SpaceMember)
  static setSpaceMemberToken(token: SpaceMemberTokenData): void {
    localStorage.setItem(this.SPACE_MEMBER_TOKEN_KEY, JSON.stringify(token));
  }

  static getSpaceMemberAccessToken(): string | null {
    const data = localStorage.getItem(this.SPACE_MEMBER_TOKEN_KEY);
    if (!data) return null;
    const token = JSON.parse(data) as SpaceMemberTokenData;
    if (Date.now() > token.expiresAt) {
      return null;
    }
    return token.accessToken;
  }

  static getSpaceMemberRefreshToken(): string | null {
    const data = localStorage.getItem(this.SPACE_MEMBER_TOKEN_KEY);
    if (!data) return null;
    const token = JSON.parse(data) as SpaceMemberTokenData;
    return token.refreshToken;
  }

  static getSpaceMemberData(): SpaceMemberTokenData | null {
    const data = localStorage.getItem(this.SPACE_MEMBER_TOKEN_KEY);
    return data ? JSON.parse(data) : null;
  }

  static clearAllTokens(): void {
    localStorage.removeItem(this.USER_TOKEN_KEY);
    localStorage.removeItem(this.SPACE_MEMBER_TOKEN_KEY);
  }

  static clearSpaceMemberToken(): void {
    localStorage.removeItem(this.SPACE_MEMBER_TOKEN_KEY);
  }
}
```

### 2단계: 인터셉터 수정

```typescript
// api-client.ts
import { EnhancedTokenManager } from './token-manager';
import { getUserTimezone } from '../utils/timezone';

// 토큰 타입별 갱신 상태 관리
interface RefreshState {
  isRefreshing: boolean;
  subscribers: ((token: string) => void)[];
}

const userTokenRefreshState: RefreshState = {
  isRefreshing: false,
  subscribers: [],
};

const spaceMemberTokenRefreshState: RefreshState = {
  isRefreshing: false,
  subscribers: [],
};

// API 경로에 따른 토큰 타입 결정
function determineTokenType(url: string): 'user' | 'spaceMember' {
  // User 토큰을 사용하는 경로들
  const userTokenPaths = ['/api/v1/users', '/api/v1/spaces', '/auth'];

  return userTokenPaths.some(path => url.includes(path)) ? 'user' : 'spaceMember';
}

// Axios 인스턴스 생성
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: false,
});

export const refreshApiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: false,
});

// 요청 인터셉터 수정
apiClient.interceptors.request.use(
  config => {
    const tokenType = determineTokenType(config.url || '');

    if (tokenType === 'user') {
      // User 토큰 사용
      const userToken = EnhancedTokenManager.getUserAccessToken();
      if (userToken) {
        config.headers.Authorization = `Bearer ${userToken}`;
      }
    } else {
      // SpaceMember 토큰 사용
      const spaceMemberToken = EnhancedTokenManager.getSpaceMemberAccessToken();
      if (spaceMemberToken) {
        config.headers.Authorization = `Bearer ${spaceMemberToken}`;
      }
    }

    // 타임존 헤더 추가
    config.headers['X-Timezone'] = getUserTimezone();

    return config;
  },
  error => Promise.reject(error)
);
```

### 3단계: refresh 로직 개선

```typescript
// 에러 응답에서 토큰 타입 식별
interface TokenErrorResponse {
  error: string;
  code?: string; // 'USER_TOKEN_EXPIRED' | 'SPACE_MEMBER_TOKEN_EXPIRED'
}

// 토큰 갱신 엔드포인트
const TOKEN_REFRESH_ENDPOINTS = {
  user: '/auth/refresh',
  spaceMember: '/auth/space-member/refresh',
};

// 사용자 토큰 갱신 함수
async function refreshUserToken(): Promise<string> {
  const refreshToken = EnhancedTokenManager.getUserRefreshToken();
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  const response = await refreshApiClient.post(TOKEN_REFRESH_ENDPOINTS.user, {
    refreshToken,
  });

  const tokenData = response.data;
  EnhancedTokenManager.setUserTokens(tokenData);

  return tokenData.accessToken;
}

// SpaceMember 토큰 갱신 함수
async function refreshSpaceMemberToken(): Promise<string> {
  const refreshToken = EnhancedTokenManager.getSpaceMemberRefreshToken();
  const spaceMemberData = EnhancedTokenManager.getSpaceMemberData();

  if (!refreshToken || !spaceMemberData) {
    throw new Error('No space member refresh token available');
  }

  const response = await refreshApiClient.post(TOKEN_REFRESH_ENDPOINTS.spaceMember, {
    refreshToken,
    spaceId: spaceMemberData.spaceId,
  });

  const tokenData = response.data;
  EnhancedTokenManager.setSpaceMemberToken(tokenData);

  return tokenData.accessToken;
}

// 대기 중인 요청들 처리
const onTokenRefreshed = (token: string, refreshState: RefreshState) => {
  refreshState.subscribers.forEach(callback => callback(token));
  refreshState.subscribers = [];
};

const addRefreshSubscriber = (callback: (token: string) => void, refreshState: RefreshState) => {
  refreshState.subscribers.push(callback);
};

// 응답 인터셉터 수정
apiClient.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // 에러 코드로 토큰 타입 확인
      const errorData = error.response.data as TokenErrorResponse;
      const isUserTokenError = errorData.code === 'USER_TOKEN_EXPIRED';
      const isSpaceMemberTokenError = errorData.code === 'SPACE_MEMBER_TOKEN_EXPIRED';

      // 명시적인 에러 코드가 없으면 URL로 판단
      const tokenType = isUserTokenError
        ? 'user'
        : isSpaceMemberTokenError
          ? 'spaceMember'
          : determineTokenType(originalRequest.url || '');

      if (tokenType === 'user') {
        // 사용자 토큰 갱신 처리
        if (!userTokenRefreshState.isRefreshing) {
          userTokenRefreshState.isRefreshing = true;

          try {
            const newToken = await refreshUserToken();

            // 대기 중인 요청들 처리
            onTokenRefreshed(newToken, userTokenRefreshState);

            // React Query 캐시 무효화
            if (queryClientInstance) {
              queryClientInstance.invalidateQueries({ queryKey: ['auth'] });
              window.dispatchEvent(new CustomEvent('userTokenRefreshed'));
            }

            // 원래 요청 재시도
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return apiClient(originalRequest);
          } catch (refreshError) {
            // 갱신 실패 - 로그아웃
            handleAuthFailure();
            return Promise.reject(refreshError);
          } finally {
            userTokenRefreshState.isRefreshing = false;
          }
        }

        // 갱신 중이면 대기
        return new Promise(resolve => {
          addRefreshSubscriber((token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(apiClient(originalRequest));
          }, userTokenRefreshState);
        });
      } else {
        // SpaceMember 토큰 갱신 처리
        if (!spaceMemberTokenRefreshState.isRefreshing) {
          spaceMemberTokenRefreshState.isRefreshing = true;

          try {
            const newToken = await refreshSpaceMemberToken();

            // 대기 중인 요청들 처리
            onTokenRefreshed(newToken, spaceMemberTokenRefreshState);

            // React Query 캐시 무효화
            if (queryClientInstance) {
              const spaceMemberData = EnhancedTokenManager.getSpaceMemberData();
              if (spaceMemberData) {
                queryClientInstance.invalidateQueries({
                  queryKey: ['space', spaceMemberData.spaceId],
                });
              }
              window.dispatchEvent(new CustomEvent('spaceMemberTokenRefreshed'));
            }

            // 원래 요청 재시도
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return apiClient(originalRequest);
          } catch (refreshError) {
            // SpaceMember 토큰 갱신 실패
            EnhancedTokenManager.clearSpaceMemberToken();
            window.dispatchEvent(new CustomEvent('spaceMemberTokenExpired'));
            return Promise.reject(refreshError);
          } finally {
            spaceMemberTokenRefreshState.isRefreshing = false;
          }
        }

        // 갱신 중이면 대기
        return new Promise(resolve => {
          addRefreshSubscriber((token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(apiClient(originalRequest));
          }, spaceMemberTokenRefreshState);
        });
      }
    }

    return Promise.reject(error);
  }
);
```

### 4단계: 에러 처리 개선

```typescript
// error-handler.ts
function handleAuthFailure(): void {
  EnhancedTokenManager.clearAllTokens();

  if (queryClientInstance) {
    queryClientInstance.cancelQueries();
    queryClientInstance.clear();
    queryClientInstance.removeQueries();
  }

  window.dispatchEvent(new CustomEvent('authenticationFailed'));

  if (typeof window !== 'undefined' && !window.location.pathname.includes('/auth')) {
    window.location.replace('/auth');
  }
}

// SpaceMember 토큰 만료 처리
window.addEventListener('spaceMemberTokenExpired', () => {
  const spaceMemberData = EnhancedTokenManager.getSpaceMemberData();

  if (spaceMemberData) {
    // 해당 Space 관련 쿼리 무효화
    if (queryClientInstance) {
      queryClientInstance.invalidateQueries({
        queryKey: ['space', spaceMemberData.spaceId],
      });
    }

    // Space 재선택 페이지로 이동
    if (typeof window !== 'undefined') {
      window.location.replace('/spaces/select');
    }
  }
});
```

## 4. 구현 예시 코드

### 수정된 API 호출 예시

```typescript
// api/auth.ts
export const authApi = {
  // 사용자 로그인
  async login(credentials: LoginCredentials) {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  },

  // 사용자 토큰 갱신 (이미 인터셉터에서 처리)
  async refreshToken(refreshToken: string) {
    const response = await refreshApiClient.post('/auth/refresh', {
      refreshToken,
    });
    return response.data;
  },
};

// api/space.ts
export const spaceApi = {
  // Space 목록 조회 (User 토큰 사용)
  async getSpaces() {
    const response = await apiClient.get('/api/v1/spaces');
    return response.data;
  },

  // Space 선택 (SpaceMember 토큰 발급)
  async selectSpace(spaceId: string) {
    const response = await apiClient.post(`/api/v1/spaces/${spaceId}/select`);
    // SpaceMember 토큰 저장
    EnhancedTokenManager.setSpaceMemberToken(response.data);
    return response.data;
  },
};

// api/checkin.ts
export const checkinApi = {
  // 체크인 생성 (SpaceMember 토큰 사용)
  async createCheckin(data: CheckinData) {
    const response = await apiClient.post('/api/v1/checkins', data);
    return response.data;
  },

  // 체크인 목록 조회 (SpaceMember 토큰 사용)
  async getCheckins() {
    const response = await apiClient.get('/api/v1/checkins');
    return response.data;
  },
};
```

### React Hook 예시

```typescript
// hooks/useAuth.ts
export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentSpace, setCurrentSpace] = useState<SpaceData | null>(null);

  useEffect(() => {
    const checkAuth = () => {
      const userToken = EnhancedTokenManager.getUserAccessToken();
      const spaceMemberData = EnhancedTokenManager.getSpaceMemberData();

      setIsAuthenticated(!!userToken);
      setCurrentSpace(spaceMemberData);
    };

    checkAuth();

    // 토큰 갱신 이벤트 리스너
    const handleUserTokenRefresh = () => checkAuth();
    const handleSpaceMemberTokenRefresh = () => checkAuth();

    window.addEventListener('userTokenRefreshed', handleUserTokenRefresh);
    window.addEventListener('spaceMemberTokenRefreshed', handleSpaceMemberTokenRefresh);

    return () => {
      window.removeEventListener('userTokenRefreshed', handleUserTokenRefresh);
      window.removeEventListener('spaceMemberTokenRefreshed', handleSpaceMemberTokenRefresh);
    };
  }, []);

  const selectSpace = async (spaceId: string) => {
    try {
      const { spaceApi } = await import('../api/space');
      const tokenData = await spaceApi.selectSpace(spaceId);
      setCurrentSpace(tokenData);
    } catch (error) {
      console.error('Failed to select space:', error);
      throw error;
    }
  };

  const logout = () => {
    EnhancedTokenManager.clearAllTokens();
    setIsAuthenticated(false);
    setCurrentSpace(null);
    window.location.replace('/auth');
  };

  return { isAuthenticated, currentSpace, selectSpace, logout };
}
```

## 5. 테스트 시나리오

### 사용자 토큰 만료

```typescript
// test/user-token-expiry.test.ts
describe('User token expiry', () => {
  it('should refresh user token on 401', async () => {
    // 1. 401 응답 설정
    mockServer.use(
      rest.get('/api/v1/users/me', (req, res, ctx) => {
        return res.once(
          ctx.status(401),
          ctx.json({
            error: 'Token expired',
            code: 'USER_TOKEN_EXPIRED',
          })
        );
      })
    );

    // 2. Refresh 엔드포인트 모킹
    mockServer.use(
      rest.post('/auth/refresh', (req, res, ctx) => {
        return res(
          ctx.json({
            accessToken: 'new-user-access-token',
            refreshToken: 'new-user-refresh-token',
            expiresAt: Date.now() + 3600000,
          })
        );
      })
    );

    // 3. API 호출
    const result = await apiClient.get('/api/v1/users/me');

    // 4. 검증
    expect(result.status).toBe(200);
    expect(EnhancedTokenManager.getUserAccessToken()).toBe('new-user-access-token');
  });
});
```

### SpaceMember 토큰 만료

```typescript
// test/space-member-token-expiry.test.ts
describe('SpaceMember token expiry', () => {
  it('should refresh space member token on 401', async () => {
    // 0. SpaceMember 토큰 설정
    EnhancedTokenManager.setSpaceMemberToken({
      accessToken: 'old-space-token',
      refreshToken: 'space-refresh-token',
      spaceId: 'space-123',
      expiresAt: Date.now() + 3600000,
    });

    // 1. 401 응답 설정
    mockServer.use(
      rest.get('/api/v1/checkins', (req, res, ctx) => {
        return res.once(
          ctx.status(401),
          ctx.json({
            error: 'Space member token expired',
            code: 'SPACE_MEMBER_TOKEN_EXPIRED',
          })
        );
      })
    );

    // 2. Space token refresh 모킹
    mockServer.use(
      rest.post('/auth/space-member/refresh', (req, res, ctx) => {
        return res(
          ctx.json({
            accessToken: 'new-space-access-token',
            refreshToken: 'new-space-refresh-token',
            spaceId: 'space-123',
            expiresAt: Date.now() + 3600000,
          })
        );
      })
    );

    // 3. API 호출
    const result = await apiClient.get('/api/v1/checkins');

    // 4. 검증
    expect(result.status).toBe(200);
    expect(EnhancedTokenManager.getSpaceMemberAccessToken()).toBe('new-space-access-token');
  });
});
```

### 동시 토큰 만료

```typescript
// test/concurrent-token-expiry.test.ts
describe('Concurrent token expiry', () => {
  it('should handle multiple 401s with queue', async () => {
    let refreshCallCount = 0;

    // 401 응답 설정 (처음 3번)
    let errorCount = 0;
    mockServer.use(
      rest.get('/api/v1/checkins', (req, res, ctx) => {
        if (errorCount < 3) {
          errorCount++;
          return res.once(
            ctx.status(401),
            ctx.json({
              error: 'Token expired',
              code: 'SPACE_MEMBER_TOKEN_EXPIRED',
            })
          );
        }
        return res(ctx.json({ data: 'success' }));
      })
    );

    mockServer.use(
      rest.post('/auth/space-member/refresh', (req, res, ctx) => {
        refreshCallCount++;
        return res(
          ctx.json({
            accessToken: 'new-space-token',
            refreshToken: 'new-space-refresh-token',
            spaceId: 'space-123',
            expiresAt: Date.now() + 3600000,
          })
        );
      })
    );

    // 여러 요청 동시 실행
    const promises = [
      apiClient.get('/api/v1/checkins'),
      apiClient.get('/api/v1/checkins'),
      apiClient.get('/api/v1/checkins'),
    ];

    await Promise.all(promises);

    // Refresh는 한 번만 호출되어야 함
    expect(refreshCallCount).toBe(1);
  });
});
```

## 6. 마이그레이션 체크리스트

### 준비 단계

- [x] 백엔드 API가 에러 코드 (`USER_TOKEN_EXPIRED`, `SPACE_MEMBER_TOKEN_EXPIRED`)를 반환하는지 확인
- [x] 토큰 갱신 엔드포인트 확인:
  - [x] User: `POST /auth/refresh`
  - [x] SpaceMember: `POST /auth/space-member/refresh`
- [x] API 경로 패턴 정의 확인 (User vs SpaceMember 토큰 사용 구분)

### 구현 단계

- [x] EnhancedTokenManager 클래스 구현 - SpaceMemberTokenManager로 구현
- [x] 기존 TokenManager에서 EnhancedTokenManager로 마이그레이션 - 기존 TokenManager 유지하며 SpaceMemberTokenManager 추가
- [x] API 클라이언트 인터셉터 수정:
  - [x] URL 기반 토큰 타입 결정 로직
  - [x] Authorization 헤더 관리
- [x] 토큰 타입별 refresh 로직 구현
- [x] 에러 처리 로직 개선

### 테스트 단계

- [ ] 단위 테스트 작성 (TokenManager) - ❌ 미구현
- [ ] 통합 테스트 작성 (API 인터셉터) - ❌ 미구현

### 배포 단계

- [ ] 기존 토큰 마이그레이션 스크립트 준비 - ❌ 미구현
- [ ] 점진적 롤아웃 계획 수립 - ❌ 미구현
- [ ] 모니터링 및 에러 추적 설정 - ❌ 미구현

## 주의사항

1. **토큰 저장 보안**

   - localStorage 사용 시 XSS 공격 주의
   - 토큰 만료 시간 검증 필수

2. **성능 최적화**

   - 불필요한 토큰 갱신 방지
   - 토큰 만료 시간 사전 체크
   - 대기열 방식으로 중복 갱신 방지

3. **에러 처리**

   - 에러 코드로 정확한 토큰 타입 식별
   - 네트워크 오류와 인증 오류 구분
   - 사용자 친화적인 에러 메시지

4. **동시성 제어**

   - Race condition 방지
   - 토큰 타입별 독립적인 갱신 상태 관리
   - 대기열 메커니즘으로 중복 요청 방지

5. **하위 호환성**

   - 기존 User 토큰 로직 유지
   - SpaceMember 토큰 추가 시 영향 최소화
