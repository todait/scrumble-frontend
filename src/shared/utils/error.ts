import { AxiosError } from 'axios';
import { ApiErrorResponse, ErrorCode } from '@/shared/types/api';

/**
 * API 에러에서 에러 코드를 추출하는 유틸리티 함수
 */
export function getErrorCode(error: unknown): ErrorCode | null {
  if (error instanceof AxiosError && error.response?.data) {
    const errorResponse = error.response.data as ApiErrorResponse;
    return errorResponse.error?.code as ErrorCode;
  }
  return null;
}

/**
 * API 에러에서 에러 메시지를 추출하는 유틸리티 함수
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof AxiosError && error.response?.data) {
    const errorResponse = error.response.data as ApiErrorResponse;
    return errorResponse.error?.message || '알 수 없는 오류가 발생했습니다.';
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return '알 수 없는 오류가 발생했습니다.';
}

/**
 * 특정 에러 코드인지 확인하는 유틸리티 함수
 */
export function isErrorCode(error: unknown, code: ErrorCode): boolean {
  return getErrorCode(error) === code;
}

/**
 * 체크인 관련 에러인지 확인하는 유틸리티 함수
 */
export function isCheckinError(error: unknown): boolean {
  const code = getErrorCode(error);
  return code === ErrorCode.CHECKIN_ALREADY_EXISTS || 
         code === ErrorCode.CHECKIN_NOT_FOUND ||
         code === ErrorCode.INVALID_CONDITION_SCORE ||
         code === ErrorCode.CONDITION_TEXT_REQUIRED;
}

/**
 * 인증 관련 에러인지 확인하는 유틸리티 함수
 */
export function isAuthError(error: unknown): boolean {
  const code = getErrorCode(error);
  return code === ErrorCode.UNAUTHORIZED ||
         code === ErrorCode.TOKEN_EXPIRED ||
         code === ErrorCode.TOKEN_INVALID ||
         code === ErrorCode.MISSING_AUTH_HEADER ||
         code === ErrorCode.INVALID_AUTH_HEADER;
}

/**
 * 권한 관련 에러인지 확인하는 유틸리티 함수
 */
export function isForbiddenError(error: unknown): boolean {
  const code = getErrorCode(error);
  return code === ErrorCode.FORBIDDEN || code === ErrorCode.SPACE_ACCESS_DENIED;
}