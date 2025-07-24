# Tiptap 백엔드 마이그레이션 가이드 (Golang/Fiber/EntGo/PostgreSQL)

## 개요

이 문서는 기존 텍스트 저장 방식에서 Tiptap 에디터의 JSON 형식으로 마이그레이션하는 방법을 설명합니다.

## 1. 데이터베이스 스키마 변경

### 1.1 PostgreSQL 컬럼 추가

```sql
-- 게시물 테이블
ALTER TABLE posts 
ADD COLUMN content_json JSONB,
ADD COLUMN content_format VARCHAR(10) DEFAULT 'text';

-- 댓글 테이블
ALTER TABLE comments 
ADD COLUMN content_json JSONB,
ADD COLUMN content_format VARCHAR(10) DEFAULT 'text';

-- 할일 테이블
ALTER TABLE todos 
ADD COLUMN title_json JSONB,
ADD COLUMN title_format VARCHAR(10) DEFAULT 'text';

-- 인덱스 추가 (JSON 검색 최적화)
CREATE INDEX idx_posts_content_json ON posts USING GIN (content_json);
CREATE INDEX idx_comments_content_json ON comments USING GIN (content_json);
```

### 1.2 EntGo 스키마 업데이트

```go
// ent/schema/post.go
package schema

import (
    "entgo.io/ent"
    "entgo.io/ent/schema/field"
    "encoding/json"
)

// Post holds the schema definition for the Post entity.
type Post struct {
    ent.Schema
}

// Fields of the Post.
func (Post) Fields() []ent.Field {
    return []ent.Field{
        // 기존 필드들...
        
        field.String("content").
            Optional().
            Comment("기존 텍스트 콘텐츠 (deprecated)"),
            
        field.JSON("content_json", json.RawMessage{}).
            Optional().
            Comment("Tiptap JSON 형식 콘텐츠"),
            
        field.Enum("content_format").
            Values("text", "json").
            Default("text").
            Comment("콘텐츠 형식"),
    }
}
```

```go
// ent/schema/comment.go
package schema

// Comment 스키마도 동일하게 업데이트
type Comment struct {
    ent.Schema
}

func (Comment) Fields() []ent.Field {
    return []ent.Field{
        // 기존 필드들...
        
        field.String("content").
            Optional(),
            
        field.JSON("content_json", json.RawMessage{}).
            Optional(),
            
        field.Enum("content_format").
            Values("text", "json").
            Default("text"),
    }
}
```

```go
// ent/schema/todo.go
package schema

type Todo struct {
    ent.Schema
}

func (Todo) Fields() []ent.Field {
    return []ent.Field{
        // 기존 필드들...
        
        field.String("title").
            Optional(),
            
        field.JSON("title_json", json.RawMessage{}).
            Optional(),
            
        field.Enum("title_format").
            Values("text", "json").
            Default("text"),
    }
}
```

## 2. Tiptap JSON 구조

### 2.1 기본 구조

```json
{
  "type": "doc",
  "content": [
    {
      "type": "paragraph",
      "content": [
        {
          "type": "text",
          "text": "일반 텍스트"
        },
        {
          "type": "text",
          "marks": [
            {
              "type": "bold"
            }
          ],
          "text": "굵은 텍스트"
        }
      ]
    },
    {
      "type": "bulletList",
      "content": [
        {
          "type": "listItem",
          "content": [
            {
              "type": "paragraph",
              "content": [
                {
                  "type": "text",
                  "text": "목록 항목"
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

### 2.2 멘션 구조

```json
{
  "type": "mention",
  "attrs": {
    "id": "user123",
    "label": "사용자이름"
  }
}
```

### 2.3 링크 구조

```json
{
  "type": "text",
  "marks": [
    {
      "type": "link",
      "attrs": {
        "href": "https://example.com",
        "target": "_blank"
      }
    }
  ],
  "text": "링크 텍스트"
}
```

## 3. API 엔드포인트 수정

### 3.1 DTO 정의

```go
// dto/content.go
package dto

import "encoding/json"

type ContentDTO struct {
    Format string          `json:"format" validate:"required,oneof=text json"`
    Text   string          `json:"text,omitempty"`
    JSON   json.RawMessage `json:"json,omitempty"`
}

type CreatePostRequest struct {
    Content ContentDTO     `json:"content" validate:"required"`
    Images  []ImageDTO     `json:"images,omitempty"`
}

type UpdateCommentRequest struct {
    Content ContentDTO     `json:"content" validate:"required"`
    Images  []ImageDTO     `json:"images,omitempty"`
}

type CreateTodoRequest struct {
    Title ContentDTO `json:"title" validate:"required"`
}
```

### 3.2 Fiber 핸들러 수정

```go
// handlers/post.go
package handlers

import (
    "github.com/gofiber/fiber/v2"
    "encoding/json"
)

func CreatePost(c *fiber.Ctx) error {
    var req dto.CreatePostRequest
    if err := c.BodyParser(&req); err != nil {
        return c.Status(400).JSON(fiber.Map{
            "error": "Invalid request body",
        })
    }

    // 유효성 검사
    if err := validate.Struct(req); err != nil {
        return c.Status(400).JSON(fiber.Map{
            "error": err.Error(),
        })
    }

    // EntGo를 사용한 게시물 생성
    tx, err := db.Tx(c.Context())
    if err != nil {
        return err
    }

    postCreate := tx.Post.Create()
    
    // 형식에 따라 적절한 필드에 저장
    switch req.Content.Format {
    case "json":
        postCreate.
            SetContentJSON(req.Content.JSON).
            SetContentFormat("json")
    case "text":
        postCreate.
            SetContent(req.Content.Text).
            SetContentFormat("text")
    }

    post, err := postCreate.Save(c.Context())
    if err != nil {
        tx.Rollback()
        return err
    }

    return tx.Commit()
}

func GetPost(c *fiber.Ctx) error {
    id := c.Params("id")
    
    post, err := db.Post.
        Query().
        Where(post.ID(id)).
        First(c.Context())
    
    if err != nil {
        return c.Status(404).JSON(fiber.Map{
            "error": "Post not found",
        })
    }

    // 응답 형식 결정
    var content dto.ContentDTO
    content.Format = post.ContentFormat
    
    switch post.ContentFormat {
    case "json":
        content.JSON = post.ContentJSON
    case "text":
        content.Text = post.Content
    }

    return c.JSON(fiber.Map{
        "id":      post.ID,
        "content": content,
        // 기타 필드들...
    })
}
```

## 4. 데이터 마이그레이션

### 4.1 기존 텍스트를 Tiptap JSON으로 변환

```go
// migration/text_to_json.go
package migration

import (
    "encoding/json"
    "strings"
)

type TiptapDoc struct {
    Type    string          `json:"type"`
    Content []TiptapContent `json:"content"`
}

type TiptapContent struct {
    Type    string           `json:"type"`
    Content []TiptapNode     `json:"content,omitempty"`
    Text    string           `json:"text,omitempty"`
    Marks   []TiptapMark     `json:"marks,omitempty"`
    Attrs   map[string]any   `json:"attrs,omitempty"`
}

type TiptapNode struct {
    Type  string         `json:"type"`
    Text  string         `json:"text,omitempty"`
    Marks []TiptapMark   `json:"marks,omitempty"`
}

type TiptapMark struct {
    Type  string         `json:"type"`
    Attrs map[string]any `json:"attrs,omitempty"`
}

// 텍스트를 Tiptap JSON으로 변환
func TextToTiptapJSON(text string) (json.RawMessage, error) {
    // 줄바꿈으로 단락 분리
    lines := strings.Split(text, "\n")
    
    doc := TiptapDoc{
        Type:    "doc",
        Content: []TiptapContent{},
    }
    
    for _, line := range lines {
        if line == "" {
            continue
        }
        
        paragraph := TiptapContent{
            Type: "paragraph",
            Content: []TiptapNode{
                {
                    Type: "text",
                    Text: line,
                },
            },
        }
        
        doc.Content = append(doc.Content, paragraph)
    }
    
    return json.Marshal(doc)
}

// 배치 마이그레이션 실행
func MigratePostsToJSON(ctx context.Context) error {
    // 텍스트 형식의 모든 게시물 조회
    posts, err := db.Post.
        Query().
        Where(post.ContentFormat("text")).
        All(ctx)
    
    if err != nil {
        return err
    }
    
    for _, p := range posts {
        jsonContent, err := TextToTiptapJSON(p.Content)
        if err != nil {
            log.Printf("Failed to convert post %s: %v", p.ID, err)
            continue
        }
        
        // JSON 형식으로 업데이트
        err = db.Post.
            UpdateOneID(p.ID).
            SetContentJSON(jsonContent).
            SetContentFormat("json").
            Exec(ctx)
            
        if err != nil {
            log.Printf("Failed to update post %s: %v", p.ID, err)
        }
    }
    
    return nil
}
```

## 5. 유틸리티 함수

### 5.1 JSON에서 텍스트 추출

```go
// utils/tiptap.go
package utils

import (
    "encoding/json"
    "strings"
)

// Tiptap JSON에서 순수 텍스트 추출
func ExtractTextFromTiptapJSON(jsonData json.RawMessage) (string, error) {
    var doc TiptapDoc
    if err := json.Unmarshal(jsonData, &doc); err != nil {
        return "", err
    }
    
    var texts []string
    extractText(&doc, &texts)
    
    return strings.Join(texts, "\n"), nil
}

func extractText(node interface{}, texts *[]string) {
    switch n := node.(type) {
    case *TiptapDoc:
        for _, content := range n.Content {
            extractText(&content, texts)
        }
    case *TiptapContent:
        if n.Type == "text" {
            *texts = append(*texts, n.Text)
        } else if n.Content != nil {
            for _, child := range n.Content {
                extractText(&child, texts)
            }
        }
    case *TiptapNode:
        if n.Type == "text" {
            *texts = append(*texts, n.Text)
        }
    }
}

// 멘션 추출
func ExtractMentionsFromTiptapJSON(jsonData json.RawMessage) ([]string, error) {
    var doc TiptapDoc
    if err := json.Unmarshal(jsonData, &doc); err != nil {
        return nil, err
    }
    
    var mentions []string
    extractMentions(&doc, &mentions)
    
    return mentions, nil
}

func extractMentions(node interface{}, mentions *[]string) {
    switch n := node.(type) {
    case *TiptapDoc:
        for _, content := range n.Content {
            extractMentions(&content, mentions)
        }
    case *TiptapContent:
        if n.Type == "mention" && n.Attrs != nil {
            if id, ok := n.Attrs["id"].(string); ok {
                *mentions = append(*mentions, id)
            }
        } else if n.Content != nil {
            for _, child := range n.Content {
                extractMentions(&child, mentions)
            }
        }
    }
}
```

### 5.2 검색 기능 구현

```go
// handlers/search.go
package handlers

func SearchPosts(c *fiber.Ctx) error {
    query := c.Query("q")
    if query == "" {
        return c.Status(400).JSON(fiber.Map{
            "error": "Search query is required",
        })
    }
    
    // PostgreSQL JSONB 검색
    posts, err := db.Post.
        Query().
        Where(
            post.Or(
                // 기존 텍스트 검색
                post.ContentContains(query),
                // JSON 콘텐츠 검색
                post.ContentJSONContains(query),
            ),
        ).
        All(c.Context())
    
    if err != nil {
        return err
    }
    
    return c.JSON(posts)
}
```

## 6. 프론트엔드 통합

### 6.1 JSON 변환 유틸리티

```typescript
// utils/tiptap-converter.ts

// HTML을 JSON으로 변환 (에디터에서 자동 처리)
export const getJSON = (editor: Editor) => {
  return editor.getJSON();
};

// JSON을 HTML로 변환 (표시용)
export const generateHTML = (json: any, extensions: any[]) => {
  return generateHTML(json, extensions);
};

// 서버로 전송할 형식
export interface ContentPayload {
  format: 'json' | 'text';
  json?: any;
  text?: string;
}

export const prepareContent = (editor: Editor): ContentPayload => {
  return {
    format: 'json',
    json: editor.getJSON(),
  };
};
```

## 7. 주의사항 및 권장사항

### 7.1 데이터베이스 최적화

1. **JSONB 인덱싱**: PostgreSQL의 GIN 인덱스를 활용하여 JSON 검색 성능 최적화
2. **부분 인덱스**: 자주 검색되는 JSON 경로에 대한 부분 인덱스 생성

```sql
-- 멘션 검색 최적화
CREATE INDEX idx_posts_mentions ON posts USING GIN ((content_json -> 'content'));
```

### 7.2 API 버전 관리

1. **하위 호환성**: 기존 text 형식과 새로운 json 형식 모두 지원
2. **점진적 마이그레이션**: 클라이언트가 준비될 때까지 양쪽 형식 모두 처리

### 7.3 성능 고려사항

1. **캐싱**: 자주 조회되는 JSON 콘텐츠의 텍스트 버전 캐싱
2. **지연 로딩**: 목록 조회 시 JSON 콘텐츠는 필요시에만 로드

### 7.4 보안

1. **JSON 검증**: 클라이언트에서 받은 JSON 구조 검증
2. **XSS 방지**: HTML 렌더링 시 적절한 sanitization 적용

## 8. 마이그레이션 체크리스트

- [ ] 데이터베이스 스키마 업데이트
- [ ] EntGo 스키마 재생성 (`go generate ./ent`)
- [ ] API 엔드포인트 수정
- [ ] 기존 데이터 마이그레이션 스크립트 실행
- [ ] 검색 기능 업데이트
- [ ] 클라이언트 코드 업데이트
- [ ] 성능 테스트
- [ ] 롤백 계획 수립