/**
 * 타임존 관련 유틸리티 함수들
 */

/**
 * 사용자의 현재 타임존을 가져옵니다.
 * @returns IANA 타임존 식별자 (예: "Asia/Seoul", "America/New_York")
 */
export const getUserTimezone = (): string => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch (error) {
    console.warn('Failed to get user timezone, falling back to UTC:', error);
    return 'UTC';
  }
};

/**
 * 타임존이 유효한지 확인합니다.
 * @param timezone IANA 타임존 식별자
 * @returns 유효한 타임존인지 여부
 */
export const isValidTimezone = (timezone: string): boolean => {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
    return true;
  } catch {
    return false;
  }
};

/**
 * 안전한 타임존 값을 반환합니다. (유효하지 않은 경우 UTC로 폴백)
 * @param timezone 검증할 타임존
 * @returns 유효한 타임존 또는 UTC
 */
export const getSafeTimezone = (timezone?: string): string => {
  if (!timezone) return getUserTimezone();
  return isValidTimezone(timezone) ? timezone : 'UTC';
};