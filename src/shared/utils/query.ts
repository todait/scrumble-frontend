/**
 * React Query retry 정책: 4xx 에러는 재시도하지 않고, 그 외에는 최대 2회까지 재시도
 */
export function defaultRetry(failureCount: number, error: unknown): boolean {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as { response: { status: number } };
    if (axiosError.response?.status >= 400 && axiosError.response?.status < 500) {
      return false;
    }
  }
  return failureCount < 2;
}

/**
 * 인증이 필요한 API를 위한 retry 정책
 * 401 에러는 axios interceptor에서 토큰 리프레시를 처리하므로 1회 재시도를 허용
 */
export function authRetry(failureCount: number, error: unknown): boolean {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as { response: { status: number } };
    // 401은 axios interceptor에서 처리하므로 1회 재시도 허용
    if (axiosError.response?.status === 401) {
      return failureCount < 1;
    }
    // 다른 4xx 에러는 재시도하지 않음
    if (axiosError.response?.status >= 400 && axiosError.response?.status < 500) {
      return false;
    }
  }
  return failureCount < 2;
}
