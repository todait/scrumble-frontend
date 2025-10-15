# 구현 전 확인 필요 사항

구현을 시작하기 전에 다음 사항들을 확인해주세요.

---

## 1. 백엔드 JSON 컬럼명 확인

백엔드에서 준비된 JSON 컬럼의 정확한 이름을 알려주세요.

### 옵션 A: snake_case

```
condition_text_json
reflection_text_json
```

### 옵션 B: camelCase

```
conditionTextJson
reflectionTextJson
```

### 옵션 C: 기타

직접 입력해주세요: **\*\***\_\_\_**\*\***

**→ 답변:**

API.md 참고

---

## 2. API 요청 형식

API 요청 시 plainText와 JSON을 어떻게 보내야 하나요?

### 옵션 A: 둘 다 전송 (프론트엔드에서 plainText 추출)

```json
{
  "conditionText": "오늘은 좋은 하루!",
  "conditionTextJson": {
    "type": "doc",
    "content": [...]
  }
}
```

- 장점: 백엔드 부담 감소, 프론트엔드에서 제어
- 단점: 중복 데이터 전송

### 옵션 B: JSON만 전송 (백엔드에서 plainText 추출)

```json
{
  "conditionTextJson": {
    "type": "doc",
    "content": [...]
  }
}
```

- 장점: 단일 소스, 데이터 일관성
- 단점: 백엔드에서 Tiptap JSON 파싱 필요

**→ 답변:**

## 옵션 A

## 3. 기존 Post 데이터 처리

기존에 작성된 Post의 `conditionText`/`reflectionText`는 JSON이 없습니다. 어떻게 처리할까요?

### 옵션 A: 프론트엔드에서 분기 처리

```typescript
// TiptapViewer에서 JSON 우선, 없으면 plainText로 표시
if (post.conditionTextJson) {
  // Tiptap으로 렌더링
} else {
  // <p className="whitespace-pre-wrap">{post.conditionText}</p>
}
```

- 장점: 즉시 적용 가능, 백엔드 작업 불필요
- 단점: 이중 로직 유지 필요

### 옵션 B: 백엔드에서 마이그레이션

백엔드에서 기존 Post의 plainText를 Tiptap JSON으로 변환하여 저장

```json
{
  "conditionText": "기존 텍스트",
  "conditionTextJson": {
    "type": "doc",
    "content": [
      {
        "type": "paragraph",
        "content": [{ "type": "text", "text": "기존 텍스트" }]
      }
    ]
  }
}
```

- 장점: 단일 렌더링 로직, 코드 간결
- 단점: 백엔드 마이그레이션 작업 필요

### 옵션 C: 혼합 방식

- 신규 Post: JSON 사용
- 기존 Post: plainText 유지 (마이그레이션하지 않음)
- 기존 Post 수정 시: JSON으로 변환

**→ 답변:**

옵션 C로 혼합

---

## 4. 이미지 업로드 위치

이미지를 어디에 표시할까요?

### 옵션 A: 기존 방식 유지 (별도 영역)

```
┌─────────────────────┐
│ TiptapEditor        │
│ (텍스트 편집)       │
└─────────────────────┘
┌─────────────────────┐
│ ImagePreviewList    │
│ [img] [img] [+]     │
└─────────────────────┘
```

- 장점: 기존 코드 재사용, 드래그앤드롭 유지 쉬움
- 단점: 텍스트와 이미지 분리

### 옵션 B: Tiptap 내부 inline 이미지

```
┌─────────────────────┐
│ TiptapEditor        │
│ 텍스트 입력...      │
│ [img] [img]         │
│ 추가 텍스트...      │
└─────────────────────┘
```

- 장점: 텍스트와 이미지 자유롭게 배치
- 단점: 추가 구현 필요 (Image extension), 드래그앤드롭 재구현

**→ 답변:**

옵션 A

---

## 5. Toolbar 표시 여부

Tiptap 에디터에 편집 툴바를 표시할까요?

### 옵션 A: 툴바 표시

```
┌────────────────────────────┐
│ [B] [I] [•] [1] [🔗]       │
├────────────────────────────┤
│ TiptapEditor               │
│                            │
└────────────────────────────┘
```

- 장점: 사용자에게 친숙, 기능 발견 쉬움
- 단점: 추가 UI 공간 차지

### 옵션 B: 툴바 없음 (단축키만)

```
┌────────────────────────────┐
│ TiptapEditor               │
│                            │
└────────────────────────────┘
```

- 장점: 깔끔한 UI, 기존 textarea와 유사
- 단점: 기능 발견 어려움, 단축키 안내 필요

### 옵션 C: 포커스 시 플로팅 툴바

```
          [B] [I] [🔗]
┌────────────────────────────┐
│ TiptapEditor               │
│ 선택한 텍스트...           │
└────────────────────────────┘
```

- 장점: 필요할 때만 표시, 공간 효율
- 단점: 구현 복잡도 증가

**→ 답변:**

옵션 C: 포커스 시 플로팅 툴바

---

## 6. 지원할 기능 범위

기본적인 텍스트 편집 기능 외에 어떤 기능을 지원할까요?

### 필수 기능 (체크)

- [x] Bold (Ctrl+B)
- [x] Italic (Ctrl+I)
- [x] Bullet List
- [x] Ordered List
- [x] Link

### 추가 고려 기능 (선택)

- [ ] Heading (H1, H2, H3)
- [x] Strike through
- [x] Blockquote (인용구)
- [x] Code block (코드 블록)
- [ ] Horizontal rule (구분선)
- [x] Underline
- [ ] Text color
- [ ] Highlight

**→ 답변:** (체크해주세요)

체크 완료

---

## 7. 스타일 가이드

Tiptap 에디터의 스타일을 어떻게 설정할까요?

### 옵션 A: 기존 textarea와 동일

```css
.tiptap-editor {
  font-size: 15px;
  line-height: 160%;
  color: #1d1d1f;
  padding: 10px;
  min-height: 240px;
  /* 기존 textarea와 동일한 스타일 */
}
```

### 옵션 B: 더 리치한 스타일

```css
.tiptap-editor {
  font-size: 15px;
  line-height: 1.7;
  /* 리스트 스타일, 링크 색상 등 강조 */
}
```

**→ 답변:**

기존 textarea 와 거의 동일한 스타이을 가져가고 (색깔 포함)
리스트 스타일, 링크 색상 등 일부 강조 필요

---

## 8. 테스트 범위

어떤 수준의 테스트를 원하시나요?

### 옵션 A: 최소 테스트

- 기본 작성/조회 기능만 수동 테스트

### 옵션 B: 중간 테스트

- 컴포넌트 단위 테스트
- 기본 통합 테스트

### 옵션 C: 전체 테스트

- 컴포넌트 단위 테스트
- 통합 테스트
- E2E 테스트
- 접근성 테스트

**→ 답변:**

옵션 A -> 대신 작업 완료시 QA 리스트 작성 필요

---

## 9. 마이그레이션 일정

언제까지 완료를 목표로 하시나요?

- 예상 일정: **\_** 일
- 우선순위:
  - [ ] 빠른 구현 (간단한 기능)
  - [ ] 완성도 (모든 기능 완벽)
  - [ ] 재사용성 (향후 확장 고려)

**→ 답변:**

마이그레이션은 현재 예정되어있지 않음
빠른 구현으로 1차 테스트 가능하게 하고 -> 완성도를 올리고 -> 재사용성 대응
(Todo Input 이나 Comment Input 도 이어서 연동을 할 예정)

---

## 10. 추가 요구사항

위에서 언급되지 않은 추가 요구사항이 있다면 적어주세요.

**→ 답변:**

없다.
