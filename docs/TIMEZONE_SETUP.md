# 타임존 헤더 설정 가이드

## 개요

모든 API 요청에 자동으로 `X-Timezone` 헤더가 포함되어 사용자의 로컬 타임존 정보를 백엔드에 전달합니다.

## 구현된 기능

### 1. 자동 타임존 헤더 추가

모든 API 요청에 `X-Timezone` 헤더가 자동으로 추가됩니다:

```typescript
// axios 인터셉터에서 자동 처리
headers: {
  'X-Timezone': 'Asia/Seoul' // 사용자의 실제 타임존
}
```

### 2. 타임존 유틸리티

```typescript
import { getUserTimezone, isValidTimezone, getSafeTimezone } from '@/shared/utils/timezone';

// 사용자 타임존 가져오기
const timezone = getUserTimezone(); // "Asia/Seoul"

// 타임존 유효성 검사
const isValid = isValidTimezone("Asia/Seoul"); // true

// 안전한 타임존 (무효한 경우 UTC로 폴백)
const safeTimezone = getSafeTimezone("Invalid/Zone"); // "UTC"
```

### 3. 타임존 관리 훅

```typescript
import { useTimezone, useTimezoneContext } from '@/shared/hooks';

function MyComponent() {
  const { timezone, setTimezone, isLoading, error } = useTimezone();
  
  // 타임존 변경
  const changeTimezone = () => {
    setTimezone("America/New_York");
  };
}
```

### 4. 커스텀 타임존 API 요청

특정 요청에서 다른 타임존을 사용하고 싶은 경우:

```typescript
import { apiClientWithTimezone } from '@/shared/lib/api/timezone';

// 특정 타임존으로 요청
const response = await apiClientWithTimezone.get('/api/posts', {
  timezone: 'America/New_York'
});
```

## 백엔드 처리

백엔드에서는 다음과 같이 헤더를 처리합니다:

```go
// 예시: Go 백엔드에서 타임존 헤더 처리
timezone := c.Get("X-Timezone")
if timezone == "" {
    timezone = "UTC" // 기본값
}

// 타임존 적용한 날짜 처리
loc, err := time.LoadLocation(timezone)
if err != nil {
    loc = time.UTC // 폴백
}

// 클라이언트 타임존으로 날짜 변환
localTime := time.Now().In(loc)
```

## 지원되는 타임존

IANA 타임존 데이터베이스의 모든 타임존을 지원합니다:

- `Asia/Seoul` (한국 표준시)
- `America/New_York` (동부 표준시)
- `Europe/London` (그리니치 표준시)
- `Asia/Tokyo` (일본 표준시)
- `UTC` (협정 세계시)

## 설정 확인

타임존 설정이 올바르게 동작하는지 확인하려면:

1. **브라우저 개발자 도구**에서 Network 탭 확인
2. API 요청의 **Request Headers**에서 `X-Timezone` 헤더 확인
3. **React DevTools**에서 TimezoneContext 상태 확인

## 문제 해결

### 타임존이 감지되지 않는 경우

```typescript
// 수동으로 타임존 설정
import { useTimezoneContext } from '@/shared/contexts';

function SettingsPage() {
  const { setTimezone } = useTimezoneContext();
  
  useEffect(() => {
    // 사용자가 선택한 타임존으로 설정
    setTimezone("Asia/Seoul");
  }, []);
}
```

### API 요청에서 타임존 헤더가 누락되는 경우

모든 API 요청은 `apiClient`를 통해 이루어져야 합니다:

```typescript
// ✅ 올바른 방법
import { apiClient } from '@/shared/lib/api';
const response = await apiClient.get('/api/posts');

// ❌ 잘못된 방법 (타임존 헤더 누락)
import axios from 'axios';
const response = await axios.get('/api/posts');
```

## 주의사항

1. **일관성**: 모든 API 요청이 동일한 `apiClient`를 사용해야 함
2. **폴백**: 무효한 타임존의 경우 자동으로 UTC로 폴백됨
3. **로컬 스토리지**: 사용자가 설정한 타임존은 브라우저에 저장됨
4. **SSR**: 서버 사이드 렌더링 시에는 UTC가 기본값으로 사용됨