# SSR 및 SEO 최적화 가이드

## 현재 적용된 최적화

### ✅ 메타데이터 및 SEO
- **메타 태그**: title, description, keywords 설정
- **오픈그래프**: Facebook, LinkedIn 등 소셜 미디어 공유 최적화
- **트위터 카드**: Twitter 공유 최적화
- **구조화된 데이터**: JSON-LD로 SoftwareApplication 스키마 구현
- **Canonical URL**: 중복 콘텐츠 방지
- **Site Verification**: Google, Naver 사이트 인증

### ✅ 서버사이드 렌더링 (SSR)
- **서버 컴포넌트**: `page.tsx`는 서버 컴포넌트로 메타데이터 처리
- **클라이언트 분리**: `LandingPageWrapper`로 클라이언트 로직 분리
- **Hydration 최적화**: `isMounted` 상태로 클라이언트 전용 컴포넌트 관리

### ✅ 성능 최적화
- **Dynamic Import**: StickyCTA, DemoModal 동적 로딩
- **Lazy Loading**: 필요 시점에 컴포넌트 로드
- **Passive Listeners**: 스크롤 이벤트 최적화
- **Web Vitals**: 성능 메트릭 모니터링 준비

### ✅ 검색 엔진 최적화
- **Sitemap**: 동적 sitemap.xml 생성
- **Robots.txt**: 크롤링 규칙 설정
- **인덱싱**: googleBot 설정으로 완전 인덱싱 허용

## 추가 권장사항

### 이미지 최적화
```tsx
import Image from 'next/image';

// 기존
<img src="/logo.png" alt="Logo" />

// 권장
<Image 
  src="/logo.png" 
  alt="Logo" 
  width={200} 
  height={100}
  priority // LCP 이미지의 경우
/>
```

### 폰트 최적화
```tsx
// app/layout.tsx
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});
```

### 링크 프리페치
```tsx
import Link from 'next/link';

// 자동 프리페치
<Link href="/about" prefetch>
  About
</Link>
```

## 체크리스트

### SEO 필수 항목
- [x] 메타 태그 (title, description)
- [x] 오픈그래프 태그
- [x] 트위터 카드
- [x] 구조화된 데이터 (JSON-LD)
- [x] Sitemap
- [x] Robots.txt
- [x] Canonical URL
- [ ] 다국어 지원 (hreflang)
- [ ] RSS 피드

### 성능 최적화
- [x] 서버 컴포넌트 활용
- [x] Dynamic Import
- [x] Lazy Loading
- [ ] 이미지 최적화 (next/image)
- [ ] 폰트 최적화
- [ ] 번들 크기 최적화
- [ ] 캐싱 전략

### 접근성
- [ ] ARIA 레이블
- [ ] 키보드 네비게이션
- [ ] 스크린 리더 지원
- [ ] 색상 대비 (WCAG AA)

## 측정 도구

### Core Web Vitals
- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1

### 테스트 도구
1. **Google PageSpeed Insights**: https://pagespeed.web.dev/
2. **Google Search Console**: 인덱싱 상태 확인
3. **Lighthouse**: Chrome DevTools 내장
4. **Schema Validator**: https://validator.schema.org/
5. **Open Graph Debugger**: https://developers.facebook.com/tools/debug/

## 배포 전 체크리스트

1. [ ] 모든 메타데이터 실제 URL로 변경
2. [ ] og-image.png 파일 추가 (1200x630)
3. [ ] Google Analytics/Tag Manager 설정
4. [ ] 사이트맵 제출 (Google Search Console)
5. [ ] 실제 도메인으로 canonical URL 업데이트
6. [ ] HTTPS 인증서 확인
7. [ ] 404 페이지 구현
8. [ ] 로딩 상태 및 에러 바운더리

## 모니터링

### 권장 모니터링 서비스
- **Vercel Analytics**: Next.js 통합 분석
- **Google Analytics 4**: 사용자 행동 분석
- **Sentry**: 에러 트래킹
- **Hotjar**: 히트맵 및 세션 리플레이