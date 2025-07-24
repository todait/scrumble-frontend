# Tiptap 에디터 통합 리뷰 빠른 시작 가이드

## 🚀 리뷰 시작하기 (5분)

### 1단계: 자동 리뷰 실행
```bash
# 전체 자동 검증 실행
npm run review

# 예상 출력:
🚀 Tiptap 에디터 통합 자동 리뷰 시작
📁 1. 아키텍처 구조 검증...
✅ 모든 필수 파일 존재
🔒 2. 타입 안전성 검증...
✅ TypeScript 타입 검사 통과
# ... (전체 검증 과정)
🎯 최종 점수: 85/100
📋 전체 결과: ✅ 통과
```

### 2단계: 결과 확인
```bash
# 상세 보고서 확인
cat review-report.json

# Critical 이슈가 있다면 즉시 수정 필요
# High Priority는 우선 수정 권장
```

## 📋 핵심 검증 포인트 (10분)

### ✅ 반드시 확인해야 할 3가지

#### 1. 기존 기능 호환성
```bash
# PostForm 통합 확인
grep -r "PostFormEditor" src/shared/components/ui/PostForm.tsx
# 결과: PostFormEditor 컴포넌트 사용 확인

# textareaRef 완전 제거 확인  
grep -r "textareaRef" src/shared/components/ui/CommentSection.tsx
# 결과: 빈 결과여야 함 (완전 제거됨)
```

#### 2. 이미지 업로드 호환성
```bash
# ImageUploadHook 인터페이스 확인
grep -A 20 "interface ImageUploadHook" src/shared/components/tiptap/tiptap.types.ts
# 결과: 10개 속성 모두 존재해야 함
```

#### 3. 성능 최적화
```bash
# 동적 import 사용 확인  
grep -r "Promise.all" src/shared/components/tiptap/extensions/
# 결과: 모든 extension 파일에서 동적 로딩 확인
```

## 🧪 수동 테스트 (15분)

### 시나리오 1: PostForm 기본 동작
```bash
1. npm run dev 실행
2. http://localhost:3000/dashboard 접속
3. PostForm 에디터 클릭
4. "테스트 **볼드** 텍스트" 입력
5. Cmd+Enter로 제출
6. ✅ 정상 동작 확인
```

### 시나리오 2: CommentSection 수정 모드
```bash
1. 댓글이 있는 포스트 페이지 접속
2. 댓글 수정 버튼 클릭
3. 기존 내용이 에디터에 로드되는지 확인
4. 내용 수정 후 Enter로 저장
5. Escape로 취소 동작 확인
6. ✅ 정상 동작 확인
```

### 시나리오 3: 이미지 업로드 
```bash
1. PostForm에서 이미지 파일 드래그앤드롭
2. 업로드 진행 상태 표시 확인
3. 완료된 이미지 미리보기 확인
4. ✅ 기존 시스템과 동일한 동작 확인
```

## 🎯 통과 기준

### ✅ 자동 검증 통과 기준
- **점수**: 80점 이상
- **Critical Issues**: 0개
- **타입 검사**: 통과
- **단위 테스트**: 모두 통과

### ✅ 수동 검증 통과 기준
- **PostForm**: 기존 기능 100% 동일
- **CommentSection**: 기존 기능 100% 동일  
- **이미지 업로드**: 기존 시스템과 완전 호환
- **키보드 단축키**: 모든 단축키 정상 동작

## 🚨 자주 발견되는 이슈들

### Critical Issues
```bash
❌ "PostForm에 PostFormEditor 통합되지 않음"
→ 해결: src/shared/components/ui/PostForm.tsx에서 textarea를 PostFormEditor로 교체

❌ "ImageUploadHook 인터페이스 불완전"  
→ 해결: tiptap.types.ts에서 누락된 속성 추가

❌ "TypeScript 타입 에러 존재"
→ 해결: npm run type-check로 에러 확인 후 수정
```

### High Priority Issues
```bash
⚠️ "ARIA 속성 누락"
→ 해결: 에디터 컴포넌트에 role="textbox", aria-label 추가

⚠️ "테스트 커버리지 부족"
→ 해결: 추가 테스트 케이스 작성

⚠️ "순환 의존성 발견"  
→ 해결: import 구조 리팩토링
```

## 📊 리뷰 체크리스트 요약

```markdown
## 빠른 체크리스트

### 자동 검증 (5분)
- [ ] `npm run review` 실행 
- [ ] 점수 80점 이상
- [ ] Critical Issues 0개

### 수동 검증 (10분)  
- [ ] PostForm 텍스트 입력/제출 정상
- [ ] CommentSection 새 댓글/수정 정상
- [ ] 이미지 업로드 기존과 동일
- [ ] 키보드 단축키 모두 동작

### 호환성 검증 (5분)
- [ ] 기존 Props 모두 동일
- [ ] 시각적 스타일 동일  
- [ ] 에러 처리 동일
- [ ] 상태 관리 로직 동일

### 성능 검증 (5분)
- [ ] 초기 로딩 2초 이내
- [ ] 타이핑 지연 없음
- [ ] 번들 크기 적절
- [ ] 메모리 누수 없음

총 소요시간: **약 25분**
```

## 🔧 문제 해결

### 자동 리뷰 실패 시
```bash
# 의존성 문제
npm install

# 타입 검사 실패  
npm run type-check
# → 에러 메시지 확인 후 수정

# 테스트 실패
npm test
# → 실패한 테스트 확인 후 수정

# 빌드 실패
npm run build
# → 빌드 에러 확인 후 수정
```

### 수동 테스트 실패 시
```bash
# 개발 서버 문제
npm run dev
# → 에러 메시지 확인

# 백엔드 연결 확인
# API 서버가 localhost:8080에서 실행 중인지 확인

# 브라우저 캐시 클리어
# 개발자 도구 → Network → Disable cache
```

## 📞 도움이 필요할 때

### 리뷰 관련 문의
1. **자동 리뷰 오류**: `review-report.json` 파일과 함께 문의
2. **기능 동작 이상**: 브라우저 개발자 도구 콘솔 에러와 함께 문의  
3. **성능 이슈**: `npm run review` 결과와 함께 문의

### 빠른 해결 링크
- [상세 리뷰 가이드](./code-review-guide.md)
- [체크리스트](./review-checklist.md)  
- [테스트 가이드](./component-usage-guide.md)

---

이 가이드를 통해 **25분 이내**에 Tiptap 에디터 통합을 철저히 검증하고 안전한 배포를 보장할 수 있습니다! 🚀