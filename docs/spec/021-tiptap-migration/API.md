# Create check-in post

## OpenAPI Specification

```yaml
openapi: 3.0.1
info:
  title: ''
  description: ''
  version: 1.0.0
paths:
  /api/v1/posts/checkin:
    post:
      summary: Create check-in post
      deprecated: false
      description: >-
        Creates a check-in post with condition score and text. Supports both
        plain text (condition_text) and Tiptap JSON format
        (condition_text_json). At least one of condition_text or
        condition_text_json must be provided.
      tags:
        - posts/CheckIn
        - posts
      parameters:
        - name: X-Timezone
          in: header
          description: spaceMember's timezone (IANA timezone)
          required: false
          example: Asia/Seoul
          schema:
            type: string
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/requests.CreateCheckInRequest'
            example: ''
      responses:
        '200':
          description: OK
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/requests.CreateCheckInPostResponse'
          headers: {}
          x-apidog-name: OK
        '400':
          description: Invalid request or missing required fields
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
          description: Unauthorized
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
      security:
        - SpaceMemberAuth: []
          x-apidog:
            schemeGroups:
              - id: IAvya37ql-nktasl8akbZ
                schemeIds:
                  - SpaceMemberAuth
            required: true
            use:
              id: IAvya37ql-nktasl8akbZ
            scopes:
              IAvya37ql-nktasl8akbZ:
                SpaceMemberAuth: []
      x-apidog-folder: posts/CheckIn
      x-apidog-status: released
      x-run-in-apidog: https://app.apidog.com/web/project/1001463/apis/api-19592571-run
components:
  schemas:
    requests.CreateCheckInRequest:
      type: object
      required:
        - condition_score
      properties:
        condition_score:
          type: integer
          maximum: 10
          minimum: 1
          examples:
            - 8
        condition_text:
          type: string
          examples:
            - 오늘은 컨디션이 좋습니다
        condition_text_json:
          type: object
          x-apidog-orders: []
          properties: {}
          x-apidog-ignore-properties: []
        images:
          type: array
          maxItems: 10
          items:
            $ref: '#/components/schemas/post.MediaFileDTO'
        posted_date:
          type: string
          examples:
            - '2024-01-15'
      x-apidog-orders:
        - condition_score
        - condition_text
        - condition_text_json
        - images
        - posted_date
      x-apidog-ignore-properties: []
      x-apidog-folder: ''
    post.MediaFileDTO:
      type: object
      required:
        - format
        - height
        - key
        - name
        - size
        - url
        - width
      properties:
        created_at:
          type: string
        format:
          description: file_type
          type: string
        height:
          type: integer
          minimum: 1
        id:
          type: string
        key:
          description: storage_key
          type: string
        name:
          description: original_name
          type: string
        size:
          type: integer
          minimum: 1
        url:
          type: string
        width:
          type: integer
          minimum: 1
      x-apidog-orders:
        - created_at
        - format
        - height
        - id
        - key
        - name
        - size
        - url
        - width
      x-apidog-ignore-properties: []
      x-apidog-folder: ''
    requests.CreateCheckInPostResponse:
      type: object
      properties:
        message:
          type: string
        post:
          $ref: '#/components/schemas/post.CheckInPostDTO'
      x-apidog-orders:
        - message
        - post
      x-apidog-ignore-properties: []
      x-apidog-folder: ''
    post.CheckInPostDTO:
      type: object
      properties:
        condition_score:
          type: integer
          examples:
            - 8
        condition_text:
          type: string
          examples:
            - 오늘은 컨디션이 좋습니다
        condition_text_json:
          type: object
          x-apidog-orders: []
          properties: {}
          x-apidog-ignore-properties: []
        created_at:
          type: string
          examples:
            - '2024-01-15T10:00:00Z'
        id:
          type: string
          examples:
            - 123e4567-e89b-12d3-a456-426614174000
        posted_at:
          type: string
          examples:
            - '2024-01-15T10:00:00Z'
        updated_at:
          type: string
          examples:
            - '2024-01-15T10:30:00Z'
      x-apidog-orders:
        - condition_score
        - condition_text
        - condition_text_json
        - created_at
        - id
        - posted_at
        - updated_at
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

# Update check-in post

## OpenAPI Specification

```yaml
openapi: 3.0.1
info:
  title: ''
  description: ''
  version: 1.0.0
paths:
  /api/v1/posts/checkin/{postId}:
    patch:
      summary: Update check-in post
      deprecated: false
      description: >-
        Updates a check-in post's condition score and text. Supports both plain
        text (condition_text) and Tiptap JSON format (condition_text_json). At
        least one of condition_text or condition_text_json must be provided.
      tags:
        - posts/CheckIn
        - posts
      parameters:
        - name: postId
          in: path
          description: Post ID
          required: true
          example: ''
          schema:
            type: string
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/requests.UpdateCheckInRequest'
      responses:
        '200':
          description: OK
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/requests.UpdateCheckInPostResponse'
          headers: {}
          x-apidog-name: OK
        '400':
          description: Invalid request or missing required fields
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
          description: Unauthorized
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
          description: Not Found
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
      security:
        - SpaceMemberAuth: []
          x-apidog:
            schemeGroups:
              - id: fdvUuofNvL9wRgoF15zmc
                schemeIds:
                  - SpaceMemberAuth
            required: true
            use:
              id: fdvUuofNvL9wRgoF15zmc
            scopes:
              fdvUuofNvL9wRgoF15zmc:
                SpaceMemberAuth: []
      x-apidog-folder: posts/CheckIn
      x-apidog-status: released
      x-run-in-apidog: https://app.apidog.com/web/project/1001463/apis/api-19592574-run
components:
  schemas:
    requests.UpdateCheckInRequest:
      type: object
      required:
        - condition_score
      properties:
        condition_score:
          type: integer
          maximum: 10
          minimum: 1
          examples:
            - 8
        condition_text:
          type: string
          examples:
            - 오늘은 컨디션이 좋습니다
        condition_text_json:
          type: object
          x-apidog-orders: []
          properties: {}
          x-apidog-ignore-properties: []
        images:
          type: array
          maxItems: 10
          items:
            $ref: '#/components/schemas/post.MediaFileDTO'
      x-apidog-orders:
        - condition_score
        - condition_text
        - condition_text_json
        - images
      x-apidog-ignore-properties: []
      x-apidog-folder: ''
    post.MediaFileDTO:
      type: object
      required:
        - format
        - height
        - key
        - name
        - size
        - url
        - width
      properties:
        created_at:
          type: string
        format:
          description: file_type
          type: string
        height:
          type: integer
          minimum: 1
        id:
          type: string
        key:
          description: storage_key
          type: string
        name:
          description: original_name
          type: string
        size:
          type: integer
          minimum: 1
        url:
          type: string
        width:
          type: integer
          minimum: 1
      x-apidog-orders:
        - created_at
        - format
        - height
        - id
        - key
        - name
        - size
        - url
        - width
      x-apidog-ignore-properties: []
      x-apidog-folder: ''
    requests.UpdateCheckInPostResponse:
      type: object
      properties:
        message:
          type: string
        post:
          $ref: '#/components/schemas/post.CheckInPostDTO'
      x-apidog-orders:
        - message
        - post
      x-apidog-ignore-properties: []
      x-apidog-folder: ''
    post.CheckInPostDTO:
      type: object
      properties:
        condition_score:
          type: integer
          examples:
            - 8
        condition_text:
          type: string
          examples:
            - 오늘은 컨디션이 좋습니다
        condition_text_json:
          type: object
          x-apidog-orders: []
          properties: {}
          x-apidog-ignore-properties: []
        created_at:
          type: string
          examples:
            - '2024-01-15T10:00:00Z'
        id:
          type: string
          examples:
            - 123e4567-e89b-12d3-a456-426614174000
        posted_at:
          type: string
          examples:
            - '2024-01-15T10:00:00Z'
        updated_at:
          type: string
          examples:
            - '2024-01-15T10:30:00Z'
      x-apidog-orders:
        - condition_score
        - condition_text
        - condition_text_json
        - created_at
        - id
        - posted_at
        - updated_at
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

# Create check-out post

## OpenAPI Specification

```yaml
openapi: 3.0.1
info:
  title: ''
  description: ''
  version: 1.0.0
paths:
  /api/v1/posts/checkout:
    post:
      summary: Create check-out post
      deprecated: false
      description: >-
        Creates a check-out post with reflection text. Supports both plain text
        (reflection_text) and Tiptap JSON format (reflection_text_json). At
        least one of reflection_text or reflection_text_json must be provided.
      tags:
        - posts/CheckOut
        - posts
      parameters:
        - name: X-Timezone
          in: header
          description: spaceMember's timezone (IANA timezone)
          required: false
          example: Asia/Seoul
          schema:
            type: string
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/requests.CreateCheckOutRequest'
      responses:
        '200':
          description: OK
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/requests.CreateCheckOutPostResponse'
          headers: {}
          x-apidog-name: OK
        '400':
          description: Invalid request or missing required fields
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
          description: Unauthorized
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
      security:
        - SpaceMemberAuth: []
          x-apidog:
            schemeGroups:
              - id: XflPcIyxi-ROT7HA2yVGq
                schemeIds:
                  - SpaceMemberAuth
            required: true
            use:
              id: XflPcIyxi-ROT7HA2yVGq
            scopes:
              XflPcIyxi-ROT7HA2yVGq:
                SpaceMemberAuth: []
      x-apidog-folder: posts/CheckOut
      x-apidog-status: released
      x-run-in-apidog: https://app.apidog.com/web/project/1001463/apis/api-19592575-run
components:
  schemas:
    requests.CreateCheckOutRequest:
      type: object
      properties:
        images:
          type: array
          maxItems: 10
          items:
            $ref: '#/components/schemas/post.MediaFileDTO'
        posted_date:
          type: string
          examples:
            - '2024-01-15'
        reflection_text:
          type: string
          examples:
            - 오늘 작업 회고입니다
        reflection_text_json:
          type: object
          x-apidog-orders: []
          properties: {}
          x-apidog-ignore-properties: []
      x-apidog-orders:
        - images
        - posted_date
        - reflection_text
        - reflection_text_json
      x-apidog-ignore-properties: []
      x-apidog-folder: ''
    post.MediaFileDTO:
      type: object
      required:
        - format
        - height
        - key
        - name
        - size
        - url
        - width
      properties:
        created_at:
          type: string
        format:
          description: file_type
          type: string
        height:
          type: integer
          minimum: 1
        id:
          type: string
        key:
          description: storage_key
          type: string
        name:
          description: original_name
          type: string
        size:
          type: integer
          minimum: 1
        url:
          type: string
        width:
          type: integer
          minimum: 1
      x-apidog-orders:
        - created_at
        - format
        - height
        - id
        - key
        - name
        - size
        - url
        - width
      x-apidog-ignore-properties: []
      x-apidog-folder: ''
    requests.CreateCheckOutPostResponse:
      type: object
      properties:
        message:
          type: string
        post:
          $ref: '#/components/schemas/post.CheckOutPostDTO'
      x-apidog-orders:
        - message
        - post
      x-apidog-ignore-properties: []
      x-apidog-folder: ''
    post.CheckOutPostDTO:
      type: object
      properties:
        created_at:
          type: string
          examples:
            - '2024-01-15T10:00:00Z'
        id:
          type: string
          examples:
            - 123e4567-e89b-12d3-a456-426614174000
        posted_at:
          type: string
          examples:
            - '2024-01-15T10:00:00Z'
        reflection_text:
          type: string
          examples:
            - 오늘 작업 회고입니다
        reflection_text_json:
          type: object
          x-apidog-orders: []
          properties: {}
          x-apidog-ignore-properties: []
        updated_at:
          type: string
          examples:
            - '2024-01-15T10:30:00Z'
      x-apidog-orders:
        - created_at
        - id
        - posted_at
        - reflection_text
        - reflection_text_json
        - updated_at
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

# Update check-out post

## OpenAPI Specification

```yaml
openapi: 3.0.1
info:
  title: ''
  description: ''
  version: 1.0.0
paths:
  /api/v1/posts/checkout/{postId}:
    patch:
      summary: Update check-out post
      deprecated: false
      description: >-
        Updates a check-out post's reflection text. Supports both plain text
        (reflection_text) and Tiptap JSON format (reflection_text_json). At
        least one of reflection_text or reflection_text_json must be provided.
      tags:
        - posts/CheckOut
        - posts
      parameters:
        - name: postId
          in: path
          description: Post ID
          required: true
          example: ''
          schema:
            type: string
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/requests.UpdateCheckOutRequest'
      responses:
        '200':
          description: OK
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/requests.UpdateCheckOutPostResponse'
          headers: {}
          x-apidog-name: OK
        '400':
          description: Invalid request or missing required fields
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
          description: Unauthorized
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
          description: Not Found
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
      security:
        - SpaceMemberAuth: []
          x-apidog:
            schemeGroups:
              - id: 8Xsf-tgKAvwmjZczce_ac
                schemeIds:
                  - SpaceMemberAuth
            required: true
            use:
              id: 8Xsf-tgKAvwmjZczce_ac
            scopes:
              8Xsf-tgKAvwmjZczce_ac:
                SpaceMemberAuth: []
      x-apidog-folder: posts/CheckOut
      x-apidog-status: released
      x-run-in-apidog: https://app.apidog.com/web/project/1001463/apis/api-19592577-run
components:
  schemas:
    requests.UpdateCheckOutRequest:
      type: object
      properties:
        images:
          type: array
          maxItems: 10
          items:
            $ref: '#/components/schemas/post.MediaFileDTO'
        reflection_text:
          type: string
          examples:
            - 오늘 작업 회고입니다
        reflection_text_json:
          type: object
          x-apidog-orders: []
          properties: {}
          x-apidog-ignore-properties: []
      x-apidog-orders:
        - images
        - reflection_text
        - reflection_text_json
      x-apidog-ignore-properties: []
      x-apidog-folder: ''
    post.MediaFileDTO:
      type: object
      required:
        - format
        - height
        - key
        - name
        - size
        - url
        - width
      properties:
        created_at:
          type: string
        format:
          description: file_type
          type: string
        height:
          type: integer
          minimum: 1
        id:
          type: string
        key:
          description: storage_key
          type: string
        name:
          description: original_name
          type: string
        size:
          type: integer
          minimum: 1
        url:
          type: string
        width:
          type: integer
          minimum: 1
      x-apidog-orders:
        - created_at
        - format
        - height
        - id
        - key
        - name
        - size
        - url
        - width
      x-apidog-ignore-properties: []
      x-apidog-folder: ''
    requests.UpdateCheckOutPostResponse:
      type: object
      properties:
        message:
          type: string
        post:
          $ref: '#/components/schemas/post.CheckOutPostDTO'
      x-apidog-orders:
        - message
        - post
      x-apidog-ignore-properties: []
      x-apidog-folder: ''
    post.CheckOutPostDTO:
      type: object
      properties:
        created_at:
          type: string
          examples:
            - '2024-01-15T10:00:00Z'
        id:
          type: string
          examples:
            - 123e4567-e89b-12d3-a456-426614174000
        posted_at:
          type: string
          examples:
            - '2024-01-15T10:00:00Z'
        reflection_text:
          type: string
          examples:
            - 오늘 작업 회고입니다
        reflection_text_json:
          type: object
          x-apidog-orders: []
          properties: {}
          x-apidog-ignore-properties: []
        updated_at:
          type: string
          examples:
            - '2024-01-15T10:30:00Z'
      x-apidog-orders:
        - created_at
        - id
        - posted_at
        - reflection_text
        - reflection_text_json
        - updated_at
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
