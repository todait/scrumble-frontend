/**
 * 라우팅 경로 상수 정의
 * 하드코딩된 경로들을 중앙 관리
 */

export const ROUTES = {
  // 인증
  AUTH: '/auth',
  AUTH_CALLBACK: '/auth/callback',
  
  // 스페이스
  SPACES: '/spaces',
  SPACE_NEW: '/spaces/new',
  SPACE_WELCOME: '/spaces/welcome',
  SPACE_INVITE: (spaceId: string) => `/spaces/${spaceId}/invite`,
  
  // 스페이스 내부 페이지
  SPACE_DASHBOARD: (spaceId: string) => `/${spaceId}`,
  SPACE_FEED: (spaceId: string) => `/${spaceId}/feed`,
  SPACE_CHECKIN: (spaceId: string) => `/${spaceId}/checkin`,
  SPACE_MY_PAGE: (spaceId: string) => `/${spaceId}/my-page`,
  SPACE_ACTIVITY: (spaceId: string) => `/${spaceId}/activity`,
  SPACE_REPORTS: (spaceId: string) => `/${spaceId}/reports`,
  
  // 포스트 작성
  POST_CHECKIN_NEW: (spaceId: string) => `/${spaceId}/posts/checkins/new`,
  POST_CHECKOUT_NEW: (spaceId: string) => `/${spaceId}/posts/checkouts/new`,
  
  // 설정
  SETTINGS: (spaceId: string) => `/${spaceId}/settings`,
  SETTINGS_SPACE: (spaceId: string) => `/${spaceId}/settings/space`,
  SETTINGS_MEMBERS: (spaceId: string) => `/${spaceId}/settings/members`,
} as const;

// 임시 스페이스 ID (개발용)
export const TEMP_SPACE_ID = 'temp-space-id';