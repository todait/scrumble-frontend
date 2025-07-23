# 🚀 Scrumble 배포 가이드

> 이 문서는 Scrumble 프론트엔드의 안전한 배포를 위한 단계별 가이드입니다.
>
> 작성일: 2025-07-21
> 대상 플랫폼: Vercel

## 📋 목차
1. [배포 전 체크리스트](#배포-전-체크리스트)
2. [환경별 설정](#환경별-설정)
3. [Vercel 배포 설정](#vercel-배포-설정)
4. [CI/CD 파이프라인](#cicd-파이프라인)
5. [배포 후 검증](#배포-후-검증)
6. [롤백 절차](#롤백-절차)

---

## ✅ 배포 전 체크리스트

### 1. 코드 품질 검증
```bash
# 타입 체크
npm run type-check

# 린트 검사
npm run lint

# 빌드 테스트
npm run build

# 로컬에서 프로덕션 빌드 실행
npm run start
```

### 2. 환경변수 확인
```bash
# .env.production 파일 생성
cp .env.local .env.production

# 민감한 정보 제거 확인
grep -E "(SECRET|KEY|TOKEN)" .env.production
```

### 3. 의존성 최적화
```bash
# 미사용 패키지 확인
npx depcheck

# 패키지 취약점 검사
npm audit

# 패키지 업데이트 (주의: breaking changes 확인)
npm update
```

### 4. 성능 테스트
```bash
# Lighthouse CI 실행
npm run lighthouse

# 번들 크기 분석
npm run analyze
```

---

## 🌍 환경별 설정

### Development (개발)
```env
# .env.development
NEXT_PUBLIC_API_URL=http://localhost:8080/api
NEXT_PUBLIC_WS_URL=ws://localhost:8080/ws
NEXT_PUBLIC_ENVIRONMENT=development
```

### Staging (스테이징)
```env
# .env.staging
NEXT_PUBLIC_API_URL=https://staging-api.scrumble.todait.kr/api
NEXT_PUBLIC_WS_URL=wss://staging-api.scrumble.todait.kr/ws
NEXT_PUBLIC_ENVIRONMENT=staging
```

### Production (프로덕션)
```env
# .env.production
NEXT_PUBLIC_API_URL=https://api.scrumble.todait.kr/api
NEXT_PUBLIC_WS_URL=wss://api.scrumble.todait.kr/ws
NEXT_PUBLIC_ENVIRONMENT=production
```

### 환경별 설정 파일
```typescript
// src/config/environment.ts
interface EnvironmentConfig {
  apiUrl: string;
  wsUrl: string;
  isProduction: boolean;
  enableDebug: boolean;
  sentryDsn?: string;
}

const getConfig = (): EnvironmentConfig => {
  const env = process.env.NEXT_PUBLIC_ENVIRONMENT || 'development';
  
  switch (env) {
    case 'production':
      return {
        apiUrl: process.env.NEXT_PUBLIC_API_URL!,
        wsUrl: process.env.NEXT_PUBLIC_WS_URL!,
        isProduction: true,
        enableDebug: false,
        sentryDsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      };
    case 'staging':
      return {
        apiUrl: process.env.NEXT_PUBLIC_API_URL!,
        wsUrl: process.env.NEXT_PUBLIC_WS_URL!,
        isProduction: false,
        enableDebug: true,
        sentryDsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      };
    default:
      return {
        apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api',
        wsUrl: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080/ws',
        isProduction: false,
        enableDebug: true,
      };
  }
};

export const config = getConfig();
```

---

## 🔧 Vercel 배포 설정

### 1. vercel.json 설정
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["icn1"],
  "functions": {
    "app/api/upload/presigned-url/route.ts": {
      "maxDuration": 10
    }
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://api.scrumble.todait.kr/:path*"
    }
  ]
}
```

### 2. 환경변수 설정 (Vercel Dashboard)
```bash
# Production Environment Variables
NEXT_PUBLIC_API_URL=https://api.scrumble.todait.kr/api
NEXT_PUBLIC_WS_URL=wss://api.scrumble.todait.kr/ws
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
NEXT_PUBLIC_ENVIRONMENT=production

# Secret Environment Variables (서버사이드)
CLOUDFLARE_API_TOKEN=your-cloudflare-token
CLOUDFLARE_ACCOUNT_ID=your-account-id
R2_ACCESS_KEY_ID=your-access-key
R2_SECRET_ACCESS_KEY=your-secret-key
R2_BUCKET_NAME=scrumble-images
R2_PUBLIC_URL=https://scrumble-image.todait.kr
```

### 3. 도메인 설정
```
Production: scrumble.todait.kr
Staging: staging.scrumble.todait.kr
```

---

## 🔄 CI/CD 파이프라인

### GitHub Actions 설정
```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
  VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}

jobs:
  quality-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Type check
        run: npm run type-check
      
      - name: Lint
        run: npm run lint
      
      - name: Build
        run: npm run build
      
      - name: Run tests
        run: npm test
  
  deploy-preview:
    needs: quality-check
    runs-on: ubuntu-latest
    if: github.event_name == 'pull_request'
    steps:
      - uses: actions/checkout@v4
      
      - name: Install Vercel CLI
        run: npm install --global vercel@latest
      
      - name: Pull Vercel Environment
        run: vercel pull --yes --environment=preview --token=${{ secrets.VERCEL_TOKEN }}
      
      - name: Build Project
        run: vercel build --token=${{ secrets.VERCEL_TOKEN }}
      
      - name: Deploy to Vercel
        run: |
          DEPLOYMENT_URL=$(vercel deploy --prebuilt --token=${{ secrets.VERCEL_TOKEN }})
          echo "DEPLOYMENT_URL=$DEPLOYMENT_URL" >> $GITHUB_ENV
      
      - name: Comment on PR
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: `🚀 Preview deployment: ${process.env.DEPLOYMENT_URL}`
            })
  
  deploy-production:
    needs: quality-check
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      
      - name: Install Vercel CLI
        run: npm install --global vercel@latest
      
      - name: Pull Vercel Environment
        run: vercel pull --yes --environment=production --token=${{ secrets.VERCEL_TOKEN }}
      
      - name: Build Project
        run: vercel build --prod --token=${{ secrets.VERCEL_TOKEN }}
      
      - name: Deploy to Production
        run: vercel deploy --prebuilt --prod --token=${{ secrets.VERCEL_TOKEN }}
      
      - name: Notify Slack
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          text: 'Production deployment completed!'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

### Pre-deploy 스크립트
```json
// package.json
{
  "scripts": {
    "predeploy": "npm run type-check && npm run lint && npm run test",
    "deploy:staging": "vercel --env=preview",
    "deploy:production": "vercel --prod"
  }
}
```

---

## 🔍 배포 후 검증

### 1. 자동화된 헬스 체크
```typescript
// app/api/health/route.ts
export async function GET() {
  try {
    // API 연결 확인
    const apiResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/health`);
    const apiHealth = await apiResponse.json();
    
    // WebSocket 연결 확인
    const wsHealthy = await checkWebSocketHealth();
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.NEXT_PUBLIC_APP_VERSION || 'unknown',
      api: apiHealth,
      websocket: wsHealthy,
    });
  } catch (error) {
    return NextResponse.json(
      { status: 'unhealthy', error: error.message },
      { status: 503 }
    );
  }
}
```

### 2. 스모크 테스트
```typescript
// scripts/smoke-test.ts
const smokeTests = [
  { name: 'Homepage loads', url: '/', expectedStatus: 200 },
  { name: 'Auth page loads', url: '/auth', expectedStatus: 200 },
  { name: 'API health check', url: '/api/health', expectedStatus: 200 },
  { name: 'Static assets load', url: '/favicon.ico', expectedStatus: 200 },
];

async function runSmokeTests(baseUrl: string) {
  console.log(`Running smoke tests on ${baseUrl}...`);
  
  for (const test of smokeTests) {
    try {
      const response = await fetch(`${baseUrl}${test.url}`);
      if (response.status === test.expectedStatus) {
        console.log(`✅ ${test.name}`);
      } else {
        console.error(`❌ ${test.name} - Expected ${test.expectedStatus}, got ${response.status}`);
        process.exit(1);
      }
    } catch (error) {
      console.error(`❌ ${test.name} - ${error.message}`);
      process.exit(1);
    }
  }
  
  console.log('✨ All smoke tests passed!');
}

// 실행
runSmokeTests(process.env.DEPLOYMENT_URL || 'https://scrumble.todait.kr');
```

### 3. 성능 모니터링
```bash
# Lighthouse CI 설정
# lighthouserc.js
module.exports = {
  ci: {
    collect: {
      url: ['https://scrumble.todait.kr'],
      numberOfRuns: 3,
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['warn', { minScore: 0.9 }],
        'categories:best-practices': ['warn', { minScore: 0.9 }],
        'categories:seo': ['warn', { minScore: 0.9 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
```

---

## 🔙 롤백 절차

### 1. 즉시 롤백 (Vercel Dashboard)
1. Vercel Dashboard → Deployments 탭
2. 이전 성공한 배포 선택
3. "Promote to Production" 클릭
4. 확인 후 즉시 롤백 완료

### 2. Git 기반 롤백
```bash
# 이전 커밋으로 롤백
git revert HEAD
git push origin main

# 특정 커밋으로 롤백
git revert <commit-hash>
git push origin main
```

### 3. 긴급 핫픽스
```bash
# 핫픽스 브랜치 생성
git checkout -b hotfix/critical-bug main

# 수정 작업
# ...

# 머지 및 배포
git checkout main
git merge --no-ff hotfix/critical-bug
git push origin main
```

### 4. 롤백 후 조치
- [ ] 롤백 원인 분석
- [ ] 포스트모템 작성
- [ ] 재발 방지 대책 수립
- [ ] 테스트 케이스 추가

---

## 📊 배포 메트릭

### 주요 지표
- 배포 성공률: > 95%
- 평균 배포 시간: < 5분
- 롤백 빈도: < 5%
- 다운타임: 0

### 모니터링 대시보드
- Vercel Analytics: 성능 메트릭
- Sentry: 에러 추적
- Uptime Robot: 가용성 모니터링
- Google Analytics: 사용자 행동 분석

---

## 🚨 비상 연락망

### 배포 관련 이슈 발생 시
1. Slack #scrumble-alerts 채널 확인
2. 온콜 엔지니어 연락
3. 필요시 롤백 진행
4. 이슈 트래킹 시스템에 기록

---

*이 가이드는 지속적으로 업데이트됩니다. 최종 수정일: 2025-07-21*