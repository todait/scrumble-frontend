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
  SPACE_INVITE: (spaceSlug: string) => `/spaces/${spaceSlug}/invite`,

  // 스페이스 내부 페이지
  SPACE_DASHBOARD: (spaceSlug: string) => `/${spaceSlug}`,
  SPACE_FEED: (spaceSlug: string) => `/${spaceSlug}/feed`,
  SPACE_CHECKIN: (spaceSlug: string) => `/${spaceSlug}/posts/checkins/new`,
  SPACE_MY_PAGE: (spaceSlug: string) => `/${spaceSlug}/my-page`,
  SPACE_NOTIFICATION: (spaceSlug: string) => `/${spaceSlug}/notification`,
  SPACE_REPORTS: (spaceSlug: string) => `/${spaceSlug}/reports`,

  // 포스트 작성
  POST_CHECKIN_NEW: (spaceSlug: string) => `/${spaceSlug}/posts/checkins/new`,
  POST_CHECKOUT_NEW: (spaceSlug: string) => `/${spaceSlug}/posts/checkouts/new`,

  // 설정
  SETTINGS: (spaceSlug: string) => `/${spaceSlug}/settings`,
  SETTINGS_SPACE: (spaceSlug: string) => `/${spaceSlug}/settings/space`,
  SETTINGS_MEMBERS: (spaceSlug: string) => `/${spaceSlug}/settings/members`,
} as const;

// 임시 스페이스 ID (개발용)
export const TEMP_SPACE_ID = 'temp-space-id';
