# 🚀 Scrumble 프로덕션 준비 체크리스트

> 이 문서는 Scrumble 프론트엔드 서비스의 프로덕션 배포를 위한 준비 사항을 정리한 것입니다.
> 
> 작성일: 2025-07-21
> 대상 버전: Next.js 15.1.8

## 📋 목차
1. [긴급 개선 필요사항](#긴급-개선-필요사항)
2. [보안 체크리스트](#보안-체크리스트)
3. [성능 최적화](#성능-최적화)
4. [안정성 개선](#안정성-개선)
5. [모니터링 및 로깅](#모니터링-및-로깅)
6. [배포 준비사항](#배포-준비사항)
7. [테스트 체크리스트](#테스트-체크리스트)

---

## 🚨 긴급 개선 필요사항

### 1. 환경변수 보안 강화
**문제점**: `.env` 파일에 민감한 정보 노출
- CloudFlare API Token
- R2 Access Keys
- JWT Secret

**필수 조치**:
```bash
# 1. .env.example 파일 생성
cp .env .env.example
# 2. .env.example에서 민감한 값 제거
# 3. 실제 값은 Vercel 환경변수로 설정
```

**환경변수 관리 가이드**:
```env
# .env.example
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_WS_URL=
NEXT_PUBLIC_GOOGLE_CLIENT_ID=

# 민감한 정보는 서버 환경변수로
CLOUDFLARE_API_TOKEN=
CLOUDFLARE_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
```

### 2. 이미지 최적화 활성화
**문제점**: `next.config.ts`에서 이미지 최적화 비활성화 (`unoptimized: true`)

**해결방안**:
```typescript
// next.config.ts
const nextConfig: NextConfig = {
  images: {
    // unoptimized: true, // 제거
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'scrumble-image.todait.kr',
      },
    ],
    // Vercel 이미지 최적화 설정
    loader: 'default',
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
};
```

---

## 🔒 보안 체크리스트

### 1. 보안 헤더 설정
**middleware.ts 생성**:
```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // 보안 헤더 설정
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()'
  );
  
  // CSP 설정
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' *.google.com *.googleapis.com; " +
    "style-src 'self' 'unsafe-inline' fonts.googleapis.com; " +
    "font-src 'self' fonts.gstatic.com; " +
    "img-src 'self' data: https: blob:; " +
    "connect-src 'self' *.todait.kr wss://*.todait.kr;"
  );
  
  return response;
}
```

### 2. API 보안
- [x] JWT 토큰 만료 시간 체크
- [x] 토큰 자동 갱신 로직
- [ ] Rate limiting 구현
- [ ] CORS 설정 검증

### 3. 입력 검증
- [x] Zod 스키마 검증
- [ ] XSS 방지 (DOMPurify 적용)
- [ ] SQL Injection 방지 (백엔드 책임)

---

## ⚡ 성능 최적화

### 1. 번들 사이즈 최적화
**현재 문제점**:
- AWS SDK 전체 임포트
- HEIC 변환 라이브러리 (대용량)
- emoji-mart 전체 임포트

**개선 코드**:
```typescript
// 동적 임포트 활용
const uploadToS3 = async (file: File) => {
  const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3');
  // ...
};

// HEIC 변환 lazy loading
const convertHeicToJpeg = async (file: File) => {
  const heicConvert = await import('heic-convert');
  // ...
};
```

### 2. 번들 분석
```bash
# package.json에 추가
"scripts": {
  "analyze": "ANALYZE=true next build"
}

# next.config.ts에 추가
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});
```

### 3. 최적화 목표
- 초기 번들 사이즈: < 200KB
- FCP (First Contentful Paint): < 1.8s
- TTI (Time to Interactive): < 3.9s
- CLS (Cumulative Layout Shift): < 0.1

---

## 🛡️ 안정성 개선

### 1. WebSocket 연결 안정성
```typescript
// websocket.service.ts 개선
class WebSocketService {
  private maxReconnectAttempts = 10; // 프로덕션에서 증가
  private reconnectDelay = 1000;
  private reconnectBackoff = 1.5;
  
  private setupNetworkListener() {
    window.addEventListener('online', () => {
      if (this.shouldReconnect) {
        this.connect();
      }
    });
    
    window.addEventListener('offline', () => {
      this.showOfflineNotification();
    });
  }
}
```

### 2. 에러 바운더리 추가
```typescript
// app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ErrorBoundary>
          <Providers>
            {children}
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
```

### 3. API 재시도 로직
- [x] React Query 재시도 설정
- [ ] 특정 API별 재시도 정책
- [ ] Circuit breaker 패턴 구현

---

## 📊 모니터링 및 로깅

### 1. 에러 모니터링 (Sentry)
```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

```typescript
// sentry.client.config.ts
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay(),
  ],
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});
```

### 2. 성능 모니터링
```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
```

### 3. 로깅 전략
- 개발: console.log 허용
- 프로덕션: console.* 제거, Sentry로 전송
- 사용자 행동 추적: Mixpanel/Amplitude

---

## 🚀 배포 준비사항

### 1. 빌드 검증
```bash
# 로컬 빌드 테스트
npm run build
npm run start

# 타입 체크
npm run type-check

# 린트 검사
npm run lint
```

### 2. 환경별 설정
```typescript
// config/environment.ts
export const config = {
  api: {
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    timeout: process.env.NODE_ENV === 'production' ? 5000 : 10000,
  },
  websocket: {
    url: process.env.NEXT_PUBLIC_WS_URL,
    reconnectAttempts: process.env.NODE_ENV === 'production' ? 10 : 3,
  },
};
```

### 3. 배포 체크리스트
- [ ] 환경변수 설정 완료
- [ ] 빌드 에러 없음
- [ ] 타입 에러 없음
- [ ] 린트 에러 없음
- [ ] 테스트 통과
- [ ] 번들 사이즈 확인
- [ ] 보안 헤더 설정
- [ ] 에러 모니터링 설정
- [ ] 성능 모니터링 설정
- [ ] 백업 계획 수립

---

## 🧪 테스트 체크리스트

### 1. 기능 테스트
- [ ] 로그인/로그아웃 flow
- [ ] 체크인 작성/수정/삭제
- [ ] 리액션 추가/제거
- [ ] 알림 수신/읽음 처리
- [ ] 실시간 업데이트 (WebSocket)
- [ ] 오프라인 모드 처리

### 2. 디바이스 테스트
- [ ] 모바일 (iOS Safari, Chrome)
- [ ] 태블릿 (iPad, Android Tablet)
- [ ] 데스크톱 (Chrome, Safari, Firefox, Edge)
- [ ] PWA 설치 및 동작

### 3. 성능 테스트
- [ ] Lighthouse 점수 (Performance > 90)
- [ ] 네트워크 지연 시뮬레이션
- [ ] 대용량 데이터 처리
- [ ] 메모리 누수 확인

### 4. 보안 테스트
- [ ] OWASP Top 10 체크
- [ ] 인증/인가 우회 시도
- [ ] XSS 취약점 점검
- [ ] CSRF 방어 확인

---

## 📅 프로덕션 배포 일정

### Phase 1: 긴급 수정 (1-2일)
- 환경변수 보안
- 이미지 최적화 설정
- 보안 헤더 추가

### Phase 2: 안정성 개선 (3-5일)
- WebSocket 안정성 개선
- 에러 모니터링 설정
- 번들 최적화

### Phase 3: 최종 검증 (2-3일)
- 전체 기능 테스트
- 성능 테스트
- 보안 점검

### Phase 4: 배포 (1일)
- Stage 환경 배포
- 최종 검증
- 프로덕션 배포

---

## 📞 연락처

배포 관련 문의사항이 있으시면 아래로 연락주세요:
- 기술 책임자: [이메일]
- 긴급 연락처: [전화번호]
- Slack 채널: #scrumble-deployment

---

*이 문서는 지속적으로 업데이트됩니다. 최종 수정일: 2025-07-21*