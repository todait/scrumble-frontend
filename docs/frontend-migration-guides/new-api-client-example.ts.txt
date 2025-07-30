import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

// API 경로 패턴 정의
const USER_AUTH_PATTERNS = [
  /^\/api\/v1\/users\//,
  /^\/api\/v1\/spaces\//,
  /^\/api\/v1\/auth\//,
];

const SPACE_MEMBER_AUTH_PATTERNS = [
  /^\/api\/v1\/posts\//,
  /^\/api\/v1\/todos\//,
  /^\/api\/v1\/notifications\//,
  /^\/api\/v1\/reactions\//,
  /^\/api\/v1\/checkins\//,
  /^\/api\/v1\/members\//,
];

// 토큰 타입 정의
type TokenType = 'user' | 'spaceMember';

// 토큰 저장소 인터페이스
interface TokenStorage {
  getUserToken(): string | null;
  setUserToken(token: string): void;
  removeUserToken(): void;
  
  getSpaceMemberToken(spaceId: string): string | null;
  setSpaceMemberToken(spaceId: string, token: string): void;
  removeSpaceMemberToken(spaceId: string): void;
  
  getCurrentSpaceId(): string | null;
  setCurrentSpaceId(spaceId: string): void;
}

// 토큰 매니저 구현
class TokenManager implements TokenStorage {
  private readonly USER_TOKEN_KEY = 'user_token';
  private readonly SPACE_TOKEN_PREFIX = 'space_token_';
  private readonly CURRENT_SPACE_KEY = 'current_space_id';
  
  getUserToken(): string | null {
    return localStorage.getItem(this.USER_TOKEN_KEY);
  }
  
  setUserToken(token: string): void {
    localStorage.setItem(this.USER_TOKEN_KEY, token);
  }
  
  removeUserToken(): void {
    localStorage.removeItem(this.USER_TOKEN_KEY);
  }
  
  getSpaceMemberToken(spaceId: string): string | null {
    return localStorage.getItem(`${this.SPACE_TOKEN_PREFIX}${spaceId}`);
  }
  
  setSpaceMemberToken(spaceId: string, token: string): void {
    localStorage.setItem(`${this.SPACE_TOKEN_PREFIX}${spaceId}`, token);
  }
  
  removeSpaceMemberToken(spaceId: string): void {
    localStorage.removeItem(`${this.SPACE_TOKEN_PREFIX}${spaceId}`);
  }
  
  getCurrentSpaceId(): string | null {
    return localStorage.getItem(this.CURRENT_SPACE_KEY);
  }
  
  setCurrentSpaceId(spaceId: string): void {
    localStorage.setItem(this.CURRENT_SPACE_KEY, spaceId);
  }
  
  // 모든 Space 토큰 제거
  removeAllSpaceTokens(): void {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(this.SPACE_TOKEN_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  }
}

// API 클라이언트 클래스
class ApiClient {
  private axiosInstance: AxiosInstance;
  private tokenManager: TokenManager;
  private isRefreshingUserToken = false;
  private isRefreshingSpaceToken = false;
  private failedUserQueue: Array<(token: string) => void> = [];
  private failedSpaceQueue: Array<(token: string) => void> = [];
  
  constructor(baseURL: string, tokenManager: TokenManager) {
    this.tokenManager = tokenManager;
    
    // Axios 인스턴스 생성
    this.axiosInstance = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    // 요청 인터셉터 설정
    this.setupRequestInterceptor();
    
    // 응답 인터셉터 설정
    this.setupResponseInterceptor();
  }
  
  // API 경로에 따른 토큰 타입 결정
  private getTokenTypeForPath(path: string): TokenType | null {
    if (USER_AUTH_PATTERNS.some(pattern => pattern.test(path))) {
      return 'user';
    }
    
    if (SPACE_MEMBER_AUTH_PATTERNS.some(pattern => pattern.test(path))) {
      return 'spaceMember';
    }
    
    return null;
  }
  
  // 요청 인터셉터 - 토큰 자동 추가
  private setupRequestInterceptor(): void {
    this.axiosInstance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const tokenType = this.getTokenTypeForPath(config.url || '');
        
        if (tokenType === 'user') {
          const userToken = this.tokenManager.getUserToken();
          if (userToken) {
            config.headers.Authorization = `Bearer ${userToken}`;
          }
        } else if (tokenType === 'spaceMember') {
          const currentSpaceId = this.tokenManager.getCurrentSpaceId();
          if (currentSpaceId) {
            const spaceMemberToken = this.tokenManager.getSpaceMemberToken(currentSpaceId);
            if (spaceMemberToken) {
              config.headers.Authorization = `Bearer ${spaceMemberToken}`;
            }
          }
        }
        
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
  }
  
  // 응답 인터셉터 - 401 에러 처리 및 토큰 갱신
  private setupResponseInterceptor(): void {
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
        
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          const tokenType = this.getTokenTypeForPath(originalRequest.url || '');
          
          if (tokenType === 'user') {
            return this.handleUserTokenRefresh(originalRequest);
          } else if (tokenType === 'spaceMember') {
            return this.handleSpaceMemberTokenRefresh(originalRequest);
          }
        }
        
        return Promise.reject(error);
      }
    );
  }
  
  // User 토큰 갱신 처리
  private async handleUserTokenRefresh(originalRequest: InternalAxiosRequestConfig): Promise<any> {
    if (this.isRefreshingUserToken) {
      // 이미 갱신 중이면 대기
      return new Promise((resolve) => {
        this.failedUserQueue.push((token: string) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          resolve(this.axiosInstance(originalRequest));
        });
      });
    }
    
    this.isRefreshingUserToken = true;
    
    try {
      // 토큰 갱신 API 호출
      const response = await axios.post('/api/v1/auth/refresh', {
        refreshToken: localStorage.getItem('user_refresh_token'),
      });
      
      const { accessToken, refreshToken } = response.data;
      
      // 새 토큰 저장
      this.tokenManager.setUserToken(accessToken);
      localStorage.setItem('user_refresh_token', refreshToken);
      
      // 대기 중인 요청 처리
      this.processQueue(this.failedUserQueue, accessToken);
      
      // 원본 요청 재시도
      originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      return this.axiosInstance(originalRequest);
      
    } catch (refreshError) {
      // 갱신 실패 시 로그아웃 처리
      this.processQueue(this.failedUserQueue, null);
      this.tokenManager.removeUserToken();
      localStorage.removeItem('user_refresh_token');
      
      // 로그인 페이지로 리다이렉트
      window.location.href = '/login';
      return Promise.reject(refreshError);
      
    } finally {
      this.isRefreshingUserToken = false;
      this.failedUserQueue = [];
    }
  }
  
  // SpaceMember 토큰 갱신 처리
  private async handleSpaceMemberTokenRefresh(originalRequest: InternalAxiosRequestConfig): Promise<any> {
    if (this.isRefreshingSpaceToken) {
      // 이미 갱신 중이면 대기
      return new Promise((resolve) => {
        this.failedSpaceQueue.push((token: string) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          resolve(this.axiosInstance(originalRequest));
        });
      });
    }
    
    this.isRefreshingSpaceToken = true;
    const currentSpaceId = this.tokenManager.getCurrentSpaceId();
    
    if (!currentSpaceId) {
      return Promise.reject(new Error('No current space selected'));
    }
    
    try {
      // SpaceMember 토큰 갱신 API 호출
      const response = await axios.post(`/api/v1/spaces/${currentSpaceId}/refresh`, {
        refreshToken: localStorage.getItem(`space_refresh_token_${currentSpaceId}`),
      }, {
        headers: {
          'Authorization': `Bearer ${this.tokenManager.getUserToken()}`,
        },
      });
      
      const { accessToken, refreshToken } = response.data;
      
      // 새 토큰 저장
      this.tokenManager.setSpaceMemberToken(currentSpaceId, accessToken);
      localStorage.setItem(`space_refresh_token_${currentSpaceId}`, refreshToken);
      
      // 대기 중인 요청 처리
      this.processQueue(this.failedSpaceQueue, accessToken);
      
      // 원본 요청 재시도
      originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      return this.axiosInstance(originalRequest);
      
    } catch (refreshError) {
      // 갱신 실패 시 Space 토큰만 제거
      this.processQueue(this.failedSpaceQueue, null);
      this.tokenManager.removeSpaceMemberToken(currentSpaceId);
      localStorage.removeItem(`space_refresh_token_${currentSpaceId}`);
      
      // Space 선택 페이지로 리다이렉트
      window.location.href = '/spaces';
      return Promise.reject(refreshError);
      
    } finally {
      this.isRefreshingSpaceToken = false;
      this.failedSpaceQueue = [];
    }
  }
  
  // 대기 중인 요청 처리
  private processQueue(queue: Array<(token: string | null) => void>, token: string | null): void {
    queue.forEach((callback) => {
      if (token) {
        callback(token);
      }
    });
  }
  
  // Axios 인스턴스 반환
  get client(): AxiosInstance {
    return this.axiosInstance;
  }
}

// API 클라이언트 싱글톤 인스턴스 생성
const tokenManager = new TokenManager();
const apiClient = new ApiClient(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080', tokenManager);

// 내보내기
export { apiClient, tokenManager, TokenManager, ApiClient };
export type { TokenStorage, TokenType };

// 사용 예제
/*
// User API 호출
const fetchUserProfile = async () => {
  const response = await apiClient.client.get('/api/v1/users/profile');
  return response.data;
};

// Space API 호출
const fetchSpaces = async () => {
  const response = await apiClient.client.get('/api/v1/spaces');
  return response.data;
};

// SpaceMember API 호출 (현재 Space의 토큰 사용)
const fetchPosts = async () => {
  const response = await apiClient.client.get('/api/v1/posts');
  return response.data;
};

// Space 전환
const switchSpace = (spaceId: string) => {
  tokenManager.setCurrentSpaceId(spaceId);
  // 필요하면 SpaceMember 토큰 발급 요청
};
*/