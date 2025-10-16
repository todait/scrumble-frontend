# Backend Requirements for Comment Tiptap Integration

## 개요

댓글(Comment)에 Tiptap JSON 지원을 위해 백엔드 API에서 `content_json` 필드를 추가해야 합니다.

---

## 필수 변경 사항

### 1. Database Schema

```sql
-- comments 테이블에 content_json 컬럼 추가
ALTER TABLE "comments" 
  ADD COLUMN "content_json" jsonb DEFAULT '{"type":"doc","content":[]}';

-- GIN 인덱스 생성 (검색 성능 향상)
CREATE INDEX IF NOT EXISTS "idx_comment_content_json" 
  ON "comments" USING GIN ("content_json");
```

---

### 2. API Response 수정

다음 엔드포인트의 응답에 `content_json` 필드를 포함해야 합니다:

#### 2.1 GET /api/v1/posts (피드 목록)

**Before**:
```json
{
  "posts": [
    {
      "comments": [
        {
          "id": "...",
          "content": "댓글 내용",
          "author": {...}
        }
      ]
    }
  ]
}
```

**After**:
```json
{
  "posts": [
    {
      "comments": [
        {
          "id": "...",
          "content": "댓글 내용",
          "content_json": {
            "type": "doc",
            "content": [...]
          },
          "author": {...}
        }
      ]
    }
  ]
}
```

---

#### 2.2 GET /api/v1/posts/{postId} (포스트 상세)

**동일하게 `content_json` 필드 추가**

---

#### 2.3 POST /api/v1/posts/{postId}/comments (댓글 생성)

**Request** (이미 프론트에서 전송 중):
```json
{
  "content": "댓글 내용",
  "content_json": {
    "type": "doc",
    "content": [...]
  },
  "images": []
}
```

**Response** (확인 필요):
```json
{
  "message": "댓글이 작성되었습니다",
  "comment": {
    "id": "...",
    "content": "댓글 내용",
    "content_json": {
      "type": "doc",
      "content": [...]
    },
    "created_at": "...",
    "author": {...}
  }
}
```

---

#### 2.4 PATCH /api/v1/posts/{postId}/comments/{commentId} (댓글 수정)

**Request** (이미 프론트에서 전송 중):
```json
{
  "content": "수정된 내용",
  "content_json": {
    "type": "doc",
    "content": [...]
  },
  "images": []
}
```

**Response** (확인 필요):
```json
{
  "message": "댓글이 수정되었습니다",
  "comment": {
    "id": "...",
    "content": "수정된 내용",
    "content_json": {
      "type": "doc",
      "content": [...]
    },
    "updated_at": "...",
    "author": {...}
  }
}
```

---

## 3. WebSocket 실시간 이벤트

댓글 생성/수정 시 WebSocket으로 전송하는 이벤트에도 `content_json` 포함 필요:

```json
{
  "type": "comment.created",
  "data": {
    "comment": {
      "id": "...",
      "content": "댓글 내용",
      "content_json": {
        "type": "doc",
        "content": [...]
      },
      "author": {...}
    }
  }
}
```

---

## 4. Notification Payload

알림 페이로드에도 `content_json` 추가:

```json
{
  "type": "comment",
  "payload": {
    "comment": {
      "commentId": "...",
      "content": "댓글 내용",
      "contentJson": {
        "type": "doc",
        "content": [...]
      },
      "author": {...}
    }
  }
}
```

---

## 5. 하위 호환성

### content_json이 없는 기존 댓글 처리

**옵션 1: 프론트엔드에서 처리 (현재 방식)**
- 프론트엔드에서 `content_json`이 없으면 `content`를 Tiptap JSON으로 변환
- `normalizeApiJson(apiComment.content_json, apiComment.content)`

**옵션 2: 백엔드 마이그레이션**
- 기존 `content`를 읽어 `content_json` 생성
- `{ type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: content }] }] }`

---

## 6. 검증 사항

### 6.1 저장 시
- [ ] `content`와 `content_json` 모두 저장
- [ ] `content_json`이 null이면 빈 문서 `{"type":"doc","content":[]}` 저장
- [ ] 유효하지 않은 JSON이면 400 에러 반환

### 6.2 조회 시
- [ ] `content`와 `content_json` 모두 반환
- [ ] `content_json`이 null이면 필드 누락 또는 빈 문서 반환

---

## 7. 프론트엔드 대응

### 현재 상태
- ✅ `ApiComment.content_json` 타입 정의 완료
- ✅ `normalizeApiJson()` 구현으로 안전한 파싱
- ✅ `TiptapViewer`로 렌더링 준비 완료
- ⚠️ **백엔드 API가 `content_json`을 반환하지 않으면 plain text로 표시됨**

### 임시 해결책
- 프론트엔드에서 `content` → `content_json` 변환 사용
- `normalizeApiJson(undefined, apiComment.content)` → 항상 JSON 생성

---

## 8. 타임라인

1. **백엔드 DB 마이그레이션**: 1일
2. **백엔드 API 응답 수정**: 1일
3. **WebSocket 이벤트 수정**: 0.5일
4. **QA 및 배포**: 1일

**총 예상**: 3.5일

---

## 9. 연락처

- **백엔드 담당자**: [이름]
- **API 문서**: https://app.apidog.com/web/project/1001463
- **관련 이슈**: [이슈 번호]
