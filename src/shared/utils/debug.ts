// 디버그 로깅 헬퍼
const logCache = new Map<string, { lastLogged: number; count: number }>();
const THROTTLE_TIME = 2000; // 2초
const MAX_REPEATED_LOGS = 3; // 최대 3번까지만 연속 로그 허용

// 클라이언트 사이드에서만 실행되도록 처리
const getCurrentTime = () => {
  // SSR 환경에서는 사용 안함
  if (typeof window === 'undefined') {
    return 0;
  }
  return Date.now();
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const debug = (type: string, message: string, data?: any) => {
  if (process.env.NODE_ENV !== 'development' || typeof window === 'undefined') {
    return;
  }

  const logKey = `${type}:${message}`;
  const now = getCurrentTime();
  const cached = logCache.get(logKey);

  // 같은 메시지가 너무 자주 반복되면 스로틀링
  if (cached) {
    if (now - cached.lastLogged < THROTTLE_TIME) {
      cached.count++;
      if (cached.count > MAX_REPEATED_LOGS) {
        return; // 너무 많이 반복된 로그는 출력하지 않음
      }
    } else {
      // 시간이 충분히 지났으면 카운트 리셋
      cached.count = 1;
      cached.lastLogged = now;
    }
  } else {
    logCache.set(logKey, { lastLogged: now, count: 1 });
  }

  // 특정 반복적인 메시지들은 필터링
  const shouldSkip = [
    'Viewport subscription effect triggered',
    'Connection state changed',
    'Post became visible',
    'Post became hidden',
    'Visible posts changed',
    'Observing post',
    'Unobserving post'
  ].some(skipMessage => message.includes(skipMessage));

  if (shouldSkip) {
    return;
  }

  // eslint-disable-next-line no-console
  console.log(`[${type}] ${message}`, data || '');
};
