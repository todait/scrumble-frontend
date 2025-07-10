/**
 * Centrifugo 디버깅 헬퍼
 */

import { debug } from '@/shared/utils/debug';

export const debugCentrifugoConnection = () => {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }
  debug('Centrifugo', '🔍 Centrifugo 연결 디버그 시작');
  
  // 1. 연결 상태
  const connected = (window as any).centrifugoService?.connected;
  debug('Centrifugo', '1. 연결 상태:', connected ? '✅ 연결됨' : '❌ 연결 안됨');
  
  // 2. 구독 상태
  const postIds = (window as any).centrifugoService?.getSubscribedPostIds() || [];
  const reactionIds = (window as any).centrifugoService?.getSubscribedReactionPostIds() || [];
  debug('Centrifugo', '2. 구독된 포스트 (댓글):', postIds);
  debug('Centrifugo', '3. 구독된 포스트 (리액션):', reactionIds);
  
  // 3. 이벤트 핸들러
  const handlers = (window as any).centrifugoService?.eventHandlers;
  if (handlers) {
    debug('Centrifugo', '4. 등록된 이벤트 핸들러:');
    handlers.forEach((handlerList: any[], eventType: string) => {
      debug('Centrifugo', `   ${eventType}: ${handlerList.length}개`);
    });
  }
  
  // 4. 사용자 토큰
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      debug('Centrifugo', '5. Centrifugo 토큰:', user.centrifugoToken ? '✅ 있음' : '❌ 없음');
      if (user.centrifugoToken) {
        debug('Centrifugo', '   토큰 길이:', user.centrifugoToken.length);
        debug('Centrifugo', '   토큰 시작:', user.centrifugoToken.substring(0, 20) + '...');
      }
    } catch (e) {
      debug('Centrifugo', '5. 사용자 데이터 파싱 실패:', e);
    }
  } else {
    debug('Centrifugo', '5. ❌ localStorage에 사용자 데이터 없음');
  }
  
  // 5. 환경 변수
  debug('Centrifugo', '6. Centrifugo URL:', process.env.NEXT_PUBLIC_CENTRIFUGO_URL);
  
  // 6. 연결 시도 로그
  debug('Centrifugo', '7. 연결 시도를 위해 다음을 실행하세요:');
  debug('Centrifugo', '   forceCentrifugoConnect()');
  
  debug('Centrifugo', '🔍 Centrifugo 연결 디버그 종료');
};

// 강제 연결 시도 함수
export const forceCentrifugoConnect = async () => {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }
  debug('Centrifugo', '🔄 Centrifugo 강제 연결 시도 시양');
  
  const service = (window as any).centrifugoService;
  if (!service) {
    debug('Centrifugo', '❌ centrifugoService를 찾을 수 없습니다');
    return;
  }
  
  // 사용자 정보 가져오기
  const userStr = localStorage.getItem('user');
  if (!userStr) {
    debug('Centrifugo', '❌ 사용자 정보가 없습니다');
    return;
  }
  
  try {
    const user = JSON.parse(userStr);
    const centrifugoToken = user.centrifugoToken;
    
    if (!centrifugoToken) {
      debug('Centrifugo', '❌ centrifugo_token이 없습니다');
      debug('Centrifugo', '💡 해결 방법: 백엔드를 재시작하고 페이지를 새로고침하세요');
      return;
    }
    
    // 현재 URL에서 spaceSlug 추출
    const pathMatch = window.location.pathname.match(/\/([^\/]+)\//);
    const spaceSlug = pathMatch ? pathMatch[1] : 'unknown';
    
    debug('Centrifugo', '📡 연결 시도 중...');
    debug('Centrifugo', '  사용자 ID:', user.id);
    debug('Centrifugo', '  스페이스:', spaceSlug);
    debug('Centrifugo', '  토큰 길이:', centrifugoToken.length);
    
    try {
      await service.connect(user.id, spaceSlug, centrifugoToken);
      debug('Centrifugo', '✅ 연결 성공!');
    } catch (error) {
      debug('Centrifugo', '❌ 연결 실패:', error);
    }
    
  } catch (e) {
    debug('Centrifugo', '❌ 사용자 데이터 파싱 실패:', e);
  }
  
  debug('Centrifugo', '🔄 Centrifugo 강제 연결 시도 종료');
};

// 전역에 등록 (클라이언트 사이드에서만)
// SSR과 클라이언트 간 불일치 방지를 위해 useEffect나 별도 클라이언트 컴포넌트에서 처리
if (typeof window !== 'undefined') {
  (window as any).forceCentrifugoConnect = forceCentrifugoConnect;
}

export const testCentrifugoMessage = (postId: string, spaceSlug: string) => {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }
  debug('Centrifugo', '📡 Centrifugo 메시지 테스트 시작');
  
  const service = (window as any).centrifugoService;
  if (!service) {
    debug('Centrifugo', '❌ centrifugoService를 찾을 수 없습니다');
    return;
  }
  
  // 테스트 핸들러 등록
  const testHandler = (message: any) => {
    debug('Centrifugo', '✅ 테스트 메시지 수신:', message);
  };
  
  service.addEventListener('comment.created', testHandler);
  service.addEventListener('reaction.added', testHandler);
  
  debug('Centrifugo', `📺 채널 구독:
  - 댓글: space:${spaceSlug}:post:${postId}
  - 리액션: space:${spaceSlug}:post:${postId}:reactions`);
  
  // 구독
  service.subscribeToComments(postId);
  service.subscribeToReactions(postId);
  
  debug('Centrifugo', '⏰ 다른 브라우저에서 댓글/리액션을 추가해보세요!');
  debug('Centrifugo', '📡 Centrifugo 메시지 테스트 종료');
  
  // 30초 후 정리
  setTimeout(() => {
    service.removeEventListener('comment.created', testHandler);
    service.removeEventListener('reaction.added', testHandler);
    debug('Centrifugo', '🧹 테스트 핸들러 정리 완료');
  }, 30000);
};

// 전역에 등록 (개발 환경에서만, 클라이언트 사이드에서만)
// SSR과 클라이언트 간 불일치 방지를 위해 useEffect나 별도 클라이언트 컴포넌트에서 처리
if (typeof window !== 'undefined') {
  if (process.env.NODE_ENV === 'development') {
    (window as any).debugCentrifugoConnection = debugCentrifugoConnection;
    (window as any).testCentrifugoMessage = testCentrifugoMessage;
    
    // 재연결 관리자 디버깅 함수도 import하여 등록
    import('../utils/reconnection').then(({ debugReconnectionManager }) => {
      (window as any).debugReconnectionManager = debugReconnectionManager;
    }).catch(() => {});
  }
}