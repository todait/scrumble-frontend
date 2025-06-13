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
