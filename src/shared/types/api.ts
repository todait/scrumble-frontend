/**
 * API 관련 공통 타입 정의
 * 백엔드 API 응답과 전체 애플리케이션에서 공통으로 사용되는 타입들
 */

/**
 * 공통 ID 타입
 * 전체 애플리케이션에서 사용되는 식별자
 */
export type ID = string;

/**
 * 날짜 문자열 타입 (ISO 8601 형식)
 * 예: "2024-01-15T10:30:00Z"
 */
export type DateString = string;

/**
 * 타임스탬프 타입 (Unix timestamp)
 */
export type Timestamp = number;

/**
 * 기본 API 응답 구조
 * 모든 API 응답에서 사용되는 공통 구조
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

/**
 * 페이지네이션 응답
 * 목록 조회 API에서 사용
 */
export interface PaginatedApiResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * 커서 기반 페이지네이션 응답
 * 무한 스크롤이나 대용량 데이터 조회에 사용
 */
export interface CursorPaginatedApiResponse<T> {
  items: T[];
  nextCursor?: string;
  hasMore: boolean;
}

/**
 * API 에러 타입
 * 에러 처리에 사용
 */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

/**
 * API 에러 응답 타입
 * 백엔드에서 반환하는 에러 응답 형식
 */
export interface ApiErrorResponse {
  error: ApiError;
  meta?: {
    timestamp: string;
  };
}

/**
 * 에러 코드 열거형
 * 백엔드와 동기화된 에러 코드 정의
 */
export enum ErrorCode {
  // Common/System errors
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  CONFLICT = 'CONFLICT',
  BAD_REQUEST = 'BAD_REQUEST',
  TOO_MANY_REQUESTS = 'TOO_MANY_REQUESTS',

  // Authentication errors
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  TOKEN_INVALID = 'TOKEN_INVALID',
  MISSING_AUTH_HEADER = 'MISSING_AUTH_HEADER',
  INVALID_AUTH_HEADER = 'INVALID_AUTH_HEADER',
  UNEXPECTED_SIGNING_METHOD = 'UNEXPECTED_SIGNING_METHOD',

  // User domain errors
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  USER_ALREADY_EXISTS = 'USER_ALREADY_EXISTS',
  INVALID_EMAIL = 'INVALID_EMAIL',
  INVALID_NAME = 'INVALID_NAME',
  EMAIL_REQUIRED = 'EMAIL_REQUIRED',
  NAME_REQUIRED = 'NAME_REQUIRED',
  NAME_TOO_LONG = 'NAME_TOO_LONG',

  // Space errors
  SPACE_NOT_FOUND = 'SPACE_NOT_FOUND',
  SPACE_ALREADY_EXISTS = 'SPACE_ALREADY_EXISTS',
  INVALID_INVITE_CODE = 'INVALID_INVITE_CODE',
  SPACE_ACCESS_DENIED = 'SPACE_ACCESS_DENIED',
  SPACE_MEMBER_NOT_FOUND = 'SPACE_MEMBER_NOT_FOUND',
  SLUG_GENERATION_FAILED = 'SLUG_GENERATION_FAILED',

  // Checkin errors
  CHECKIN_ALREADY_EXISTS = 'CHECKIN_ALREADY_EXISTS',
  INVALID_CONDITION_SCORE = 'INVALID_CONDITION_SCORE',
  CHECKIN_NOT_FOUND = 'CHECKIN_NOT_FOUND',

  // Checkout errors
  CHECKOUT_ALREADY_EXISTS = 'CHECKOUT_ALREADY_EXISTS',
  CHECKOUT_NOT_FOUND = 'CHECKOUT_NOT_FOUND',

  // Post errors
  INVALID_POST_TYPE = 'INVALID_POST_TYPE',
  CONDITION_TEXT_REQUIRED = 'CONDITION_TEXT_REQUIRED',
  REFLECTION_TEXT_REQUIRED = 'REFLECTION_TEXT_REQUIRED',
  SPACE_ID_REQUIRED = 'SPACE_ID_REQUIRED',
  INVALID_DATE_RANGE = 'INVALID_DATE_RANGE',

  // Todo errors
  TODO_NAME_REQUIRED = 'TODO_NAME_REQUIRED',
  TODO_NAME_TOO_LONG = 'TODO_NAME_TOO_LONG',
  TODO_DESCRIPTION_TOO_LONG = 'TODO_DESCRIPTION_TOO_LONG',
  TODO_DEPTH_EXCEEDED = 'TODO_DEPTH_EXCEEDED',
  INVALID_TODO_URL = 'INVALID_TODO_URL',
}

/**
 * 토큰 쌍 타입
 * 인증 시스템에서 사용
 */
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

// =========================
// 백엔드 API 응답 타입들 (snake_case)
// =========================

/**
 * 포스트 목록 조회 API 응답 (백엔드)
 * 백엔드에서 전달되는 snake_case 형태의 데이터
 */
export interface GetPostsApiResponse {
  posts: Array<{
    id: string;
    post_type: 'checkin' | 'checkout';
    posted_at: string;
    created_at: string;
    updated_at: string;
    user_id: string;
    space_slug: string;
    author: ApiUser;
    condition_score?: number;
    condition_text?: string;
    reflection_text?: string;
    images: ApiImage[];
    comments: ApiComment[];
    reactions?: ApiReaction[];
    todo_count?: number;
  }>;
  nextCursor?: string;
  hasMore: boolean;
}

/**
 * API 댓글 타입 (백엔드에서 반환하는 snake_case 형태)
 * 재사용성을 위해 별도로 정의
 */
export interface ApiComment {
  id: string;
  post_id: string;
  author: {
    id: string;
    email: string;
    name: string;
    avatar_url: string;
  };
  content: string;
  created_at: string;
  updated_at: string;
  images?: {
    id: string;
    created_at: string;
    url: string;
    key: string;
    size: number;
    width: number;
    height: number;
    format: string;
    name: string;
  }[];
  reactions?: ApiReaction[];
}

/**
 * API 이미지 타입 (백엔드에서 반환하는 snake_case 형태)
 * 재사용성을 위해 별도로 정의
 */
export interface ApiImage {
  id: string;
  created_at: string;
  url: string;
  key: string;
  size: number;
  width: number;
  height: number;
  format: string;
  name: string;
}

/**
 * API 사용자 타입 (백엔드에서 반환하는 snake_case 형태)
 * 재사용성을 위해 별도로 정의
 */
export interface ApiUser {
  id: string;
  email: string;
  name: string;
  avatar_url: string;
}

/**
 * API 리액션 타입 (백엔드에서 반환하는 snake_case 형태)
 * 개별 리액션 정보 - 백엔드 ReactionDTO 구조
 */
export interface ApiReaction {
  user_id: string;
  emoji: string;
  created_at: string;
  author: ApiUser;
}

export interface GetFeedSummaryApiResponse {
  message: string;
  summary: {
    date: string;
    space_slug: string;
    check_in_count: number;
    check_out_count: number;
    total_workday_member_count: number;
    average_condition_score: number;
  };
}

/**
 * 최신 스페이스를 포함한 사용자 정보 API 응답 (백엔드)
 * 로그인 후 리다이렉트에 사용
 */
export interface GetUserWithLatestSpaceApiResponse {
  id: string;
  email: string;
  name: string;
  avatar_url: string;
  latest_space_slug: string;
  latest_space_name: string;
  centrifugo_token?: string;
}

/**
 * 토큰 갱신 API 응답 (백엔드)
 * 인증 토큰 갱신 시 사용
 */
export interface RefreshTokenApiResponse {
  access_token: string;
  refresh_token: string;
}

export interface ExistsCheckinApiResponse {
  exists: boolean;
}

export interface CreateCheckInApiResponse {
  message: string;
  post: {
    id: string;
    condition_score: number;
    condition_text: string;
    posted_at: string;
    created_at: string;
    updated_at: string;
  };
}

export interface CreateCheckOutApiResponse {
  message: string;
  post: {
    id: string;
    reflection_text: string;
    posted_at: string;
    created_at: string;
    updated_at: string;
  };
}

export interface UpdateCheckInApiResponse {
  message: string;
  post: {
    id: string;
    condition_score: number;
    condition_text: string;
    posted_at: string;
    created_at: string;
    updated_at: string;
  };
}

export interface UpdateCheckOutApiResponse {
  message: string;
  post: {
    id: string;
    reflection_text: string;
    posted_at: string;
    created_at: string;
    updated_at: string;
  };
}

export interface DeleteCheckInApiResponse {
  message: string;
}

export interface DeleteCheckOutApiResponse {
  message: string;
}

// =========================
// Todo API 응답 타입들
// =========================

/**
 * Todo 생성 API 응답 (백엔드)
 * 계층적 구조의 Todo 생성 성공 시 반환
 */
export interface CreateTodosApiResponse {
  message: string;
}

/**
 * Todo 조회 API 응답 (백엔드)
 * 날짜별 Todo 목록 조회 시 반환
 */
export interface GetTodosApiResponse {
  todos: ApiTodo[];
}

/**
 * Todo 수정 API 응답 (백엔드)
 * Todo 필드 수정 성공 시 반환
 */
export interface UpdateTodoApiResponse {
  message: string;
}

/**
 * Todo 완료 토글 API 응답 (백엔드)
 * Todo 완료 상태 토글 성공 시 반환
 */
export interface ToggleTodoApiResponse {
  message: string;
}

/**
 * API Todo 타입 (백엔드에서 반환하는 snake_case 형태)
 * 계층적 구조의 Todo 데이터
 */
export interface ApiTodo {
  id: string;
  name: string;
  description?: string;
  scheduled_date: string;
  order: number;
  thirdparty_url?: string;
  parent_id?: string;
  origin_todo_id?: string;
  depth: number;
  completed_at?: string;
  children: ApiTodo[];
}

/**
 * Todo 생성 요청 타입 (백엔드로 전송하는 snake_case 형태)
 * 계층적 구조의 Todo 생성 시 사용
 */
/**
 * Todo 생성 요청 아이템 타입 (재귀적 구조)
 * 계층적 구조의 Todo 생성 시 사용
 */
export interface ApiCreateTodoItem {
  name: string;
  description?: string;
  scheduled_date: string;
  origin_todo_id?: string;
  thirdparty_url?: string;
  children: ApiCreateTodoItem[];
}

export interface ApiCreateTodoRequest {
  todos: ApiCreateTodoItem[];
}

/**
 * Todo 수정 요청 타입 (백엔드로 전송하는 snake_case 형태)
 * Todo 필드 부분 수정 시 사용
 */
export interface ApiUpdateTodoRequest {
  name?: string;
  description?: string;
  scheduled_date?: string;
  order?: number;
  thirdparty_url?: string;
  parent_id?: string;
  origin_todo_id_is_nil?: boolean;
  completed_at?: string; // ISO 8601 형식 (RFC3339), null/"" 시 미완료로 설정
}

/**
 * Todo 일괄 업데이트 요청 타입 (백엔드로 전송하는 snake_case 형태)
 * 여러 Todo를 한 번에 생성/수정/삭제할 때 사용
 */
export interface ApiBulkUpdateTodosRequest {
  scheduled_date: string; // YYYY-MM-DD 형식 (필수)
  todos: ApiBulkUpdateTodoItem[];
}

/**
 * Todo 일괄 업데이트 아이템 타입 (재귀적 구조)
 * 일괄 업데이트 시 각 Todo 아이템에 사용
 */
export interface ApiBulkUpdateTodoItem {
  id?: string; // UUID, 없으면 새로 생성
  name?: string;
  description?: string;
  scheduled_date?: string; // YYYY-MM-DD 형식
  order?: number;
  thirdparty_url?: string;
  parent_id?: string; // UUID
  origin_todo_id_is_nil?: boolean; // true 시 origin_todo_id를 null로 설정
  completed_at?: string; // ISO 8601 형식 (RFC3339), null/"" 시 미완료로 설정
}

/**
 * Todo 일괄 업데이트 결과 타입 (백엔드에서 반환하는 snake_case 형태)
 * 일괄 업데이트 성공 시 반환되는 결과
 */
export interface ApiBulkUpdateResult {
  created: number; // 생성된 할 일 개수
  updated: number; // 수정된 할 일 개수
  deleted: number; // 삭제된 할 일 개수
}

/**
 * Todo 일괄 업데이트 API 응답 (백엔드)
 * 일괄 업데이트 성공 시 반환
 */
export interface BulkUpdateTodosApiResponse {
  message: string;
  result: ApiBulkUpdateResult;
}
