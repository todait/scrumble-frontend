// UserTokenManager를 TokenManager로 export (기존 코드 호환성)
import { UserTokenManager } from './UserTokenManager';
export { UserTokenManager as TokenManager } from './UserTokenManager';

// 타입들 export
export * from './types';
export * from './StorageAdapter';
export * from './BaseTokenManager';

// 기존 코드 호환성을 위한 export
export const tokenStorage = {
  getAccessToken: () => UserTokenManager.getAccessToken(),
  getRefreshToken: () => UserTokenManager.getRefreshToken(),
  setTokens: (accessToken: string, refreshToken: string) =>
    UserTokenManager.setTokensLegacy(accessToken, refreshToken),
  clearTokens: () => UserTokenManager.clearTokens(),
};

// SpaceMemberTokenManager도 함께 export
export { SpaceMemberTokenManager } from './SpaceMemberTokenManager';