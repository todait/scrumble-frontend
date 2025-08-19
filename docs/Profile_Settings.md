# Profile 설정 UI 개선

## 구성

// Header
프로필 설정 // title
스페이스에서 보여지는 프로필의 정보를 관리할 수 있습니다. // description

// Contents 1
프로필 // Section title
이미지 // Member AvatarURL
홍길동 // Member Name

Divider

이름 // Section Title
이름 Input // Member Name Input
멤버 리스트와 포스트에 표시되는 이름입니다. // Member Name Input Helper Text

Divider

// Contents 2
연결된 계정 // Section Title
이메일(chjw102@gmail.com) // Member Email Text
가입 날짜(2025년 3월 20일 가입) // Member Joined At

취소 저장 버튼 // Save Button

## 스타일

\*모든 스타일은 현재 프로젝트의 Tailwind class 에 맞게 변환해서 구현해야한다.

Header
{
gap: 10px
margin-bottom: 20px
}

title
{
color: #1D1D1F;
font-size: 20px;
font-weight: 700;
line-height: 120%; /_ 24px _/
}

description
{
color: #9999A2;
font-size: 15px;
font-weight: 400;
line-height: 160%; /_ 24px _/
}

Contents 1
{
margin-top: 20px
}

Section Title 과 입력 영역은
@SpaceSettingsPage 에
{/_ 스페이스 이름 수정 _/} 랑 동일한 배치 (좌측, 우측)

<div className="flex items-start justify-between gap-6">
  <h3 className="whitespace-nowrap text-[15px] font-bold text-[#1D1D1F]">스페이스 이름</h3>
  <div className="w-full max-w-[750px]">
    <input
      type="text"
      value={localSpaceName}
      onChange={handleSpaceNameChange}
      className="h-[54px] w-full rounded-[10px] border border-[#D2D2D7] bg-[#F9F9FB] px-4 text-[16px] font-normal text-[#1D1D1F] transition-colors focus:border-[#9747FF] focus:outline-none"
      placeholder="스페이스 이름 입력"
    />
  </div>
</div>
프로필, 이름, 연결된 계정 전부 동일

프로필 Section
120x120 이미지, border-radius 24px;
@SpaceSettingsPage 의 IconURL 처럼 이미지 업데이트 가능

20px gap 두고

이름
color: #6E6E73;
font-size: 15px;
font-weight: 700;
line-height: 120%; /_ 18px _/

Divider
w-full
#1D1D1F14
1px
margin-y 상하 40px

이름 Section
Input (Input 창 안에 아이콘은 Icon: ri:user-6-line 10px 우측 gap 두고 텍스트 입력창)
padding: 좌우 20px, 상하 16px

10px gap 두고 밑에 도움말 위치
멤버 리스트와 포스트에 표시되는 이름입니다.
{
color: #9999A2;
font-size: 13px;
font-weight: 400;
line-height: 160%; /_ 20.8px _/
}

Divider
w-full
#1D1D1F14
1px
margin-y 상하 40px

연결된 계정 Section (위아래 margin 20px)
Input Field 이름이랑 동일하게 존재 아이콘은 Icon: ri:google-fill
아래 도움말 위치에 가입 날짜 텍스트 위치
Email 은 수정못하므로 Input Field 비활성화

취소, 저장 버튼 (@SpaceSettingsPage 참고)
margin-top 40px

---

이름과 AvatarUrl 업데이트 가능.
API는 아래 참고.

src/shared/lib/api/members.ts (새로 파일 생성)에 api 요청 구현
src/shared/hooks/queries/useMembers.ts (새로 파일 생성)react-query 훅 구현

me/profile GET으로 로 최신 정보 받고 PATCH 로 업데이트
(@SpaceSettingsPage 랑 동일)

---

# Get my space member profile

## OpenAPI Specification

```yaml
openapi: 3.0.1
info:
  title: ''
  description: ''
  version: 1.0.0
paths:
  /api/v1/space-members/me/profile:
    get:
      summary: Get my space member profile
      deprecated: false
      description: >-
        Retrieves the profile information of the currently authenticated space
        member
      tags:
        - space-members
        - space-members
      parameters:
        - name: X-Timezone
          in: header
          description: User's timezone (IANA timezone)
          required: false
          example: Asia/Seoul
          schema:
            type: string
        - name: Authorization
          in: header
          description: ''
          required: false
          example: Bearer {{space_member_access_token}}
          schema:
            type: string
      responses:
        '200':
          description: OK
          content:
            application/json:
              schema:
                $ref: >-
                  #/components/schemas/github_com_todait_scrumble-backend_internal_interfaces_http_handlers_requests.GetSpaceMemberResponse
          headers: {}
          x-apidog-name: OK
        '401':
          description: Unauthorized - invalid or missing space member token
          content:
            application/json:
              schema:
                type: object
                additionalProperties:
                  type: string
                x-apidog-orders: []
                properties: {}
                x-apidog-ignore-properties: []
          headers: {}
          x-apidog-name: Unauthorized
        '404':
          description: Space member not found
          content:
            application/json:
              schema:
                type: object
                additionalProperties:
                  type: string
                x-apidog-orders: []
                properties: {}
                x-apidog-ignore-properties: []
          headers: {}
          x-apidog-name: Record Not Found
        '500':
          description: Internal Server Error
          content:
            application/json:
              schema:
                type: object
                additionalProperties:
                  type: string
                x-apidog-orders: []
                properties: {}
                x-apidog-ignore-properties: []
          headers: {}
          x-apidog-name: Server Error
      security: []
      x-apidog-folder: space-members
      x-apidog-status: released
      x-run-in-apidog: https://app.apidog.com/web/project/1001463/apis/api-20382104-run
components:
  schemas:
    github_com_todait_scrumble-backend_internal_interfaces_http_handlers_requests.GetSpaceMemberResponse:
      type: object
      properties:
        space_member:
          $ref: >-
            #/components/schemas/github_com_todait_scrumble-backend_internal_application_space.SpaceMemberDTO
      x-apidog-orders:
        - space_member
      x-apidog-ignore-properties: []
      x-apidog-folder: ''
    github_com_todait_scrumble-backend_internal_application_space.SpaceMemberDTO:
      description: Space member information with user details
      type: object
      properties:
        avatarURL:
          type: string
          examples:
            - https://avatar.example.com/user.jpg
        email:
          type: string
          examples:
            - user@example.com
        id:
          type: string
          examples:
            - 550e8400-e29b-41d4-a716-446655440000
        joinedAt:
          type: string
          examples:
            - '2024-01-15T09:00:00Z'
        name:
          type: string
          examples:
            - John Doe
        role:
          type: string
          enum:
            - owner
            - admin
            - member
            - viewer
          examples:
            - member
        userId:
          type: string
          examples:
            - 550e8400-e29b-41d4-a716-446655440001
      x-apidog-orders:
        - avatarURL
        - email
        - id
        - joinedAt
        - name
        - role
        - userId
      x-apidog-ignore-properties: []
      x-apidog-folder: ''
  securitySchemes:
    Bearer:
      description: Type "Bearer" followed by a space and JWT token.
      type: apikey
      name: Authorization
      in: header
    BearerAuth:
      description: >-
        User authentication - Type "Bearer" followed by a space and user access
        token.
      type: apikey
      name: Authorization
      in: header
    SpaceMemberCookie:
      description: >-
        Space member authentication using JWT cookie format:
        scrumble_token_{spaceSlug}_access={token}
      type: apikey
      name: Cookie
      in: header
    SpaceMemberAuth:
      description: >-
        Space member authentication - Type "Bearer" followed by a space and
        space member access token.
      type: apikey
      name: Authorization
      in: header
servers: []
security: []
```

---

# Update my space member profile

## OpenAPI Specification

```yaml
openapi: 3.0.1
info:
  title: ''
  description: ''
  version: 1.0.0
paths:
  /api/v1/space-members/me/profile:
    patch:
      summary: Update my space member profile
      deprecated: false
      description: >-
        Updates the profile information (name and avatar URL) of the currently
        authenticated space member
      tags:
        - space-members
        - space-members
      parameters:
        - name: X-Timezone
          in: header
          description: User's timezone (IANA timezone)
          required: false
          example: Asia/Seoul
          schema:
            type: string
      requestBody:
        content:
          application/json:
            schema:
              $ref: >-
                #/components/schemas/github_com_todait_scrumble-backend_internal_interfaces_http_handlers_requests.UpdateSpaceMemberProfileRequest
      responses:
        '200':
          description: OK
          content:
            application/json:
              schema:
                $ref: >-
                  #/components/schemas/github_com_todait_scrumble-backend_internal_interfaces_http_handlers_requests.UpdateSpaceMemberProfileResponse
          headers: {}
          x-apidog-name: OK
        '400':
          description: Invalid request body
          content:
            application/json:
              schema:
                type: object
                additionalProperties:
                  type: string
                x-apidog-orders: []
                properties: {}
                x-apidog-ignore-properties: []
          headers: {}
          x-apidog-name: Bad Request
        '401':
          description: Unauthorized - invalid or missing space member token
          content:
            application/json:
              schema:
                type: object
                additionalProperties:
                  type: string
                x-apidog-orders: []
                properties: {}
                x-apidog-ignore-properties: []
          headers: {}
          x-apidog-name: Unauthorized
        '404':
          description: Space member not found
          content:
            application/json:
              schema:
                type: object
                additionalProperties:
                  type: string
                x-apidog-orders: []
                properties: {}
                x-apidog-ignore-properties: []
          headers: {}
          x-apidog-name: Record Not Found
        '500':
          description: Internal Server Error
          content:
            application/json:
              schema:
                type: object
                additionalProperties:
                  type: string
                x-apidog-orders: []
                properties: {}
                x-apidog-ignore-properties: []
          headers: {}
          x-apidog-name: Server Error
      security: []
      x-apidog-folder: space-members
      x-apidog-status: released
      x-run-in-apidog: https://app.apidog.com/web/project/1001463/apis/api-20382105-run
components:
  schemas:
    github_com_todait_scrumble-backend_internal_interfaces_http_handlers_requests.UpdateSpaceMemberProfileRequest:
      type: object
      properties:
        avatar_url:
          type: string
        name:
          type: string
      x-apidog-orders:
        - avatar_url
        - name
      x-apidog-ignore-properties: []
      x-apidog-folder: ''
    github_com_todait_scrumble-backend_internal_interfaces_http_handlers_requests.UpdateSpaceMemberProfileResponse:
      type: object
      properties:
        message:
          type: string
        space_member:
          $ref: >-
            #/components/schemas/github_com_todait_scrumble-backend_internal_application_space.SpaceMemberDTO
      x-apidog-orders:
        - message
        - space_member
      x-apidog-ignore-properties: []
      x-apidog-folder: ''
    github_com_todait_scrumble-backend_internal_application_space.SpaceMemberDTO:
      description: Space member information with user details
      type: object
      properties:
        avatarURL:
          type: string
          examples:
            - https://avatar.example.com/user.jpg
        email:
          type: string
          examples:
            - user@example.com
        id:
          type: string
          examples:
            - 550e8400-e29b-41d4-a716-446655440000
        joinedAt:
          type: string
          examples:
            - '2024-01-15T09:00:00Z'
        name:
          type: string
          examples:
            - John Doe
        role:
          type: string
          enum:
            - owner
            - admin
            - member
            - viewer
          examples:
            - member
        userId:
          type: string
          examples:
            - 550e8400-e29b-41d4-a716-446655440001
      x-apidog-orders:
        - avatarURL
        - email
        - id
        - joinedAt
        - name
        - role
        - userId
      x-apidog-ignore-properties: []
      x-apidog-folder: ''
  securitySchemes:
    Bearer:
      description: Type "Bearer" followed by a space and JWT token.
      type: apikey
      name: Authorization
      in: header
    BearerAuth:
      description: >-
        User authentication - Type "Bearer" followed by a space and user access
        token.
      type: apikey
      name: Authorization
      in: header
    SpaceMemberCookie:
      description: >-
        Space member authentication using JWT cookie format:
        scrumble_token_{spaceSlug}_access={token}
      type: apikey
      name: Cookie
      in: header
    SpaceMemberAuth:
      description: >-
        Space member authentication - Type "Bearer" followed by a space and
        space member access token.
      type: apikey
      name: Authorization
      in: header
servers: []
security: []
```
