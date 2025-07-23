# 🔒 Scrumble 보안 및 성능 개선 가이드

> 이 문서는 코드 분석을 통해 발견된 보안 취약점과 성능 문제에 대한 상세 개선 가이드입니다.
>
> 작성일: 2025-07-21
> 위험도: 🔴 높음 | 🟡 중간 | 🟢 낮음

## 📋 목차
1. [심각한 보안 취약점](#심각한-보안-취약점)
2. [성능 문제 및 메모리 누수](#성능-문제-및-메모리-누수)
3. [코드별 개선 예제](#코드별-개선-예제)
4. [보안 모범 사례](#보안-모범-사례)
5. [성능 최적화 전략](#성능-최적화-전략)

---

## 🔴 심각한 보안 취약점

### 1. JWT 토큰 저장 방식 개선

**현재 문제점**: localStorage에 JWT 토큰 저장 → XSS 공격에 취약

**개선 방안 1: httpOnly 쿠키 사용**
```typescript
// src/shared/lib/token.ts 수정
class TokenManager {
  // localStorage 대신 쿠키 사용
  private setCookie(name: string, value: string, days: number) {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    
    // httpOnly는 서버에서 설정해야 함
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Strict;Secure`;
  }
  
  private getCookie(name: string): string | null {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
  }
}
```

**개선 방안 2: 메모리 저장 + Refresh Token은 httpOnly 쿠키**
```typescript
// src/shared/contexts/AuthContext.tsx
interface AuthState {
  accessToken: string | null; // 메모리에만 저장
  user: User | null;
}

// API 요청 시 쿠키의 refresh token으로 access token 갱신
```

**백엔드 API 수정 필요**:
```typescript
// 로그인 응답 헤더에 쿠키 설정
res.setHeader('Set-Cookie', [
  `refreshToken=${refreshToken}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${30 * 24 * 60 * 60}`,
]);
```

### 2. WebSocket 토큰 전달 개선

**현재 문제점**: URL 쿼리 파라미터로 토큰 노출

**개선 코드**:
```typescript
// src/shared/services/websocket.service.ts
class WebSocketService {
  async connect(spaceSlug: string): Promise<void> {
    // 1. 토큰 없이 연결
    const url = `${this.wsUrl}/spaces/${spaceSlug}`;
    this.websocket = new WebSocket(url);
    
    // 2. 연결 후 인증 메시지 전송
    this.websocket.onopen = () => {
      const token = TokenManager.getInstance().getAccessToken();
      this.websocket.send(JSON.stringify({
        type: 'auth',
        token: token,
      }));
    };
  }
}
```

### 3. 파일 업로드 보안 강화

**개선된 presigned URL 생성**:
```typescript
// src/app/api/upload/presigned-url/route.ts
import crypto from 'crypto';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = {
  'image/jpeg': [0xFF, 0xD8, 0xFF],
  'image/png': [0x89, 0x50, 0x4E, 0x47],
  'image/gif': [0x47, 0x49, 0x46],
  'image/webp': [0x52, 0x49, 0x46, 0x46],
};

export async function POST(request: Request) {
  try {
    // Rate limiting 체크
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    if (await isRateLimited(ip)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }
    
    const body = await request.json();
    const { fileName, fileType, fileSize } = body;
    
    // 파일 크기 제한
    if (fileSize > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds limit' }, 
        { status: 400 }
      );
    }
    
    // MIME 타입 검증
    if (!ALLOWED_FILE_TYPES[fileType]) {
      return NextResponse.json(
        { error: 'Invalid file type' }, 
        { status: 400 }
      );
    }
    
    // 파일명 sanitize
    const sanitizedFileName = sanitizeFileName(fileName);
    const uniqueKey = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}-${sanitizedFileName}`;
    
    // Presigned URL 생성 시 조건 추가
    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: uniqueKey,
      ContentType: fileType,
      ContentLength: fileSize, // 크기 제한 강제
    });
    
    // 짧은 만료 시간 설정
    const uploadUrl = await getSignedUrl(r2, command, { expiresIn: 300 }); // 5분
    
    return NextResponse.json({ uploadUrl, key: uniqueKey });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

// 파일명 sanitize 함수
function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/\.{2,}/g, '.')
    .substring(0, 255);
}

// Rate limiting 구현
const requestCounts = new Map<string, { count: number; resetTime: number }>();

async function isRateLimited(ip: string): Promise<boolean> {
  const now = Date.now();
  const limit = requestCounts.get(ip);
  
  if (!limit || limit.resetTime < now) {
    requestCounts.set(ip, { count: 1, resetTime: now + 60000 }); // 1분
    return false;
  }
  
  if (limit.count >= 10) { // 분당 10회 제한
    return true;
  }
  
  limit.count++;
  return false;
}
```

### 4. 프로덕션 디버그 로그 제거

**환경별 디버그 함수**:
```typescript
// src/shared/utils/debug.ts
export const debug = (...args: any[]) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('[DEBUG]', ...args);
  }
};

// 빌드 시 자동 제거를 위한 webpack 설정
// next.config.ts
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (process.env.NODE_ENV === 'production') {
      config.optimization.minimizer.push(
        new TerserPlugin({
          terserOptions: {
            compress: {
              drop_console: true, // console.* 제거
              drop_debugger: true,
              pure_funcs: ['debug'], // debug 함수 호출 제거
            },
          },
        })
      );
    }
    return config;
  },
};
```

---

## 🟡 성능 문제 및 메모리 누수

### 1. 메모리 누수 해결

**ImageGallery 개선**:
```typescript
// src/shared/components/ui/ImageGallery.tsx
export function ImageGallery({ images }: ImageGalleryProps) {
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  
  useEffect(() => {
    const urls: string[] = [];
    
    images.forEach((image) => {
      if (image instanceof File) {
        const url = URL.createObjectURL(image);
        urls.push(url);
      } else {
        urls.push(image.url);
      }
    });
    
    setPreviewUrls(urls);
    
    // Cleanup: Object URL 해제
    return () => {
      urls.forEach((url) => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [images]);
  
  return (
    // 렌더링 코드
  );
}
```

**useImageUpload 훅 개선**:
```typescript
// src/shared/hooks/useImageUpload.ts
export function useImageUpload() {
  const [uploadingImages, setUploadingImages] = useState<Map<string, UploadingImage>>(new Map());
  const abortControllersRef = useRef<Map<string, AbortController>>(new Map());
  
  // 컴포넌트 언마운트 시 모든 업로드 취소 및 정리
  useEffect(() => {
    return () => {
      // 진행 중인 업로드 취소
      abortControllersRef.current.forEach((controller) => {
        controller.abort();
      });
      
      // Object URL 정리
      uploadingImages.forEach((image) => {
        if (image.preview?.startsWith('blob:')) {
          URL.revokeObjectURL(image.preview);
        }
      });
    };
  }, []);
  
  const uploadImage = async (file: File) => {
    const controller = new AbortController();
    const id = generateId();
    
    abortControllersRef.current.set(id, controller);
    
    try {
      // 업로드 로직
      const result = await uploadWithProgress(file, {
        signal: controller.signal,
        onProgress: (progress) => {
          // 진행률 업데이트
        },
      });
      
      return result;
    } finally {
      abortControllersRef.current.delete(id);
    }
  };
  
  return { uploadImage, uploadingImages };
}
```

### 2. 번들 최적화

**동적 임포트 확대**:
```typescript
// src/features/checkin/components/CheckInCard.tsx
const EmojiPicker = dynamic(
  () => import('@emoji-mart/react').then(mod => mod.default),
  { 
    ssr: false,
    loading: () => <div className="w-[352px] h-[435px] bg-gray-100 animate-pulse" />
  }
);

// AWS SDK 동적 로드
const uploadToS3 = async (file: File, presignedUrl: string) => {
  const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3');
  // 업로드 로직
};

// HEIC 변환 동적 로드
const convertHeicImage = async (file: File) => {
  const heicConvert = await import('heic-convert');
  // 변환 로직
};
```

**Tailwind CSS 최적화**:
```javascript
// tailwind.config.js
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  // PurgeCSS 옵션
  purge: {
    options: {
      safelist: [
        // 동적으로 생성되는 클래스들
        /^bg-/,
        /^text-/,
      ],
    },
  },
};
```

### 3. WebSocket 최적화

**개선된 재연결 로직**:
```typescript
// src/shared/services/websocket.service.ts
class OptimizedWebSocketService {
  private reconnectDelay = 1000;
  private maxReconnectDelay = 10000; // 최대 10초로 제한
  private reconnectBackoff = 1.5;
  
  private setupReconnection() {
    // 네트워크 상태 감지
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);
    
    // 페이지 visibility 변경 감지
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
  }
  
  private handleVisibilityChange = () => {
    if (document.visibilityState === 'visible' && this.shouldReconnect) {
      this.connect();
    } else if (document.visibilityState === 'hidden') {
      // 백그라운드에서는 재연결 중지
      this.pauseReconnection();
    }
  };
  
  // 구독 정리
  unsubscribeAll() {
    this.subscriptions.forEach((callback, channel) => {
      this.unsubscribe(channel, callback);
    });
    this.subscriptions.clear();
  }
}
```

### 4. 이미지 최적화

**Next.js Image 컴포넌트 최적화**:
```typescript
// src/shared/components/ui/OptimizedImage.tsx
import Image from 'next/image';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  priority?: boolean;
}

export function OptimizedImage({ src, alt, width, height, priority = false }: OptimizedImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      priority={priority}
      loading={priority ? 'eager' : 'lazy'}
      placeholder="blur"
      blurDataURL={generateBlurDataURL()} // 작은 base64 이미지
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      quality={85}
    />
  );
}

// 블러 placeholder 생성
function generateBlurDataURL(): string {
  // 1x1 픽셀 투명 이미지
  return 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...';
}
```

### 5. React Query 최적화

**일관된 캐시 설정**:
```typescript
// src/shared/lib/react-query.ts
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5분
      gcTime: 1000 * 60 * 10, // 10분
      retry: (failureCount, error) => {
        if (error instanceof ApiError && error.status === 401) {
          return false; // 인증 에러는 재시도 안 함
        }
        return failureCount < 2;
      },
      refetchOnWindowFocus: false, // 포커스 시 자동 refetch 비활성화
      refetchOnReconnect: 'always', // 네트워크 재연결 시 refetch
    },
  },
});

// 특정 쿼리별 설정
export const useCheckins = (spaceSlug: string) => {
  return useInfiniteQuery({
    queryKey: ['checkins', spaceSlug],
    queryFn: fetchCheckins,
    staleTime: 1000 * 60 * 2, // 체크인은 2분
    gcTime: 1000 * 60 * 5, // 5분
  });
};
```

---

## 🛡️ 보안 모범 사례

### Content Security Policy (CSP) 설정
```typescript
// middleware.ts
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' *.google.com *.googleapis.com;
  style-src 'self' 'unsafe-inline' fonts.googleapis.com;
  font-src 'self' fonts.gstatic.com;
  img-src 'self' data: https: blob:;
  connect-src 'self' *.todait.kr wss://*.todait.kr;
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
`;
```

### 입력 검증 강화
```typescript
// src/shared/utils/validation.ts
import DOMPurify from 'isomorphic-dompurify';
import { z } from 'zod';

// HTML 입력 sanitize
export const sanitizeHTML = (dirty: string): string => {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'br'],
    ALLOWED_ATTR: ['href', 'target'],
  });
};

// 체크인 메시지 검증
export const CheckinMessageSchema = z.string()
  .min(1, '메시지를 입력해주세요')
  .max(500, '메시지는 500자까지 입력 가능합니다')
  .transform(sanitizeHTML);
```

---

## 📈 성능 최적화 전략

### 1. 코드 스플리팅 전략
```typescript
// 라우트별 코드 스플리팅
const FeedPage = dynamic(() => import('@/features/feed/pages/FeedPage'));
const NotificationPage = dynamic(() => import('@/features/notifications/pages/NotificationPage'));
const CheckInPage = dynamic(() => import('@/features/checkin/pages/CheckInPage'));
```

### 2. 리소스 힌트 추가
```html
<!-- app/layout.tsx -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://scrumble-image.todait.kr" />
<link rel="dns-prefetch" href="https://api.todait.kr" />
```

### 3. 서비스 워커 캐싱
```javascript
// public/sw.js
self.addEventListener('fetch', (event) => {
  if (event.request.destination === 'image') {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request).then((response) => {
          return caches.open('images-v1').then((cache) => {
            cache.put(event.request, response.clone());
            return response;
          });
        });
      })
    );
  }
});
```

---

## 📊 모니터링 구현

### 성능 메트릭 수집
```typescript
// src/shared/utils/performance.ts
export const reportWebVitals = (metric: any) => {
  const body = JSON.stringify({
    name: metric.name,
    value: metric.value,
    id: metric.id,
    label: metric.label,
  });
  
  // Analytics 엔드포인트로 전송
  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/analytics', body);
  }
};
```

---

*이 가이드는 지속적으로 업데이트됩니다. 최종 수정일: 2025-07-21*