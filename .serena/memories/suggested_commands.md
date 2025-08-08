# Scrumble Frontend 개발 명령어

## 개발 명령어
```bash
# 개발 서버 실행 (Turbopack 사용)
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm run start
```

## 코드 품질 관리
```bash
# ESLint 실행
npm run lint

# ESLint 자동 수정
npm run lint:fix

# Prettier 포맷팅
npm run format

# Prettier 체크
npm run format:check

# TypeScript 타입 체크
npm run type-check
```

## 테스트
```bash
# 테스트 실행
npm test

# 테스트 watch 모드
npm run test:watch

# 테스트 커버리지
npm run test:coverage
```

## Git 명령어 (macOS)
```bash
# 상태 확인
git status

# 변경사항 확인
git diff

# 파일 추가
git add .

# 커밋 (Claude Code signature 제거 필요)
git commit -m "feat: 기능 설명"

# 브랜치 확인
git branch

# 브랜치 전환
git checkout branch-name
```

## 시스템 유틸리티 (macOS/Darwin)
```bash
# 디렉토리 목록
ls -la

# 디렉토리 이동
cd directory-name

# 파일 검색
find . -name "*.ts"

# 내용 검색
grep -r "검색어" .

# 프로세스 확인
ps aux | grep node

# 포트 사용 확인
lsof -i :3000
```

## 백엔드 연동
백엔드는 http://localhost:8080 에서 실행되어야 하며, Google OAuth 인증 테스트를 위해서는 `.env.local` 파일에 올바른 credential 설정이 필요합니다.