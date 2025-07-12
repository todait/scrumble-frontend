#### 1. CollapseTodoListSection

- Collapse 기능이 되는 컴포넌트는 무조건 "가져오기" 기능을 포함할 필요가 없음.
- "가져오기" 영역은 TodoList 컴포넌트에 통합되어야 함.
- Collapse 컴포넌트는 순수하게 Collapse 기능만 담당하도록 유지. (e.g., 아코디언 스타일의 펼침/접힘 UI만 구현)
- "가져오기" 로직은 TodoList에서 별도로 처리하여 컴포넌트의 책임을 분리.
- 옵션 유무에 따라서 Collapse가 열릴 때 useTodos 쿼리 호출 (e.g., lazy loading with Tanstack Query의 useQuery, enabled: isOpen).

#### 2. TodoList / TodoItem

- "가져오기" 관련 처리 로직을 TodoList에 추가 (위 섹션 참조).
- 현재 너무 많은 로직이 컴포넌트 내에 산재해 있음: TodoList 상태를 깔끔하게 정리 필요 (e.g., useReducer나 custom hook으로 상태 중앙화).
- UI 기능이 아닌 로직 함수는 별도 파일로 분리 (e.g., utils 폴더나 custom hooks 사용: useTodoLogic.ts 같은 파일 생성).
- 키보드 처리 로직 분리 (e.g., useKeyboardHandler custom hook으로 추출).
- 전반적으로 로직 코드가 많아 컴포넌트 코드가 복잡: 컴포넌트 코드를 간결화 (e.g., 로직을 hooks로 이동시켜 JSX 중심으로 유지).

#### 3. TodoList 개선사항

- 체크 모드에서 체크 시 UI에 즉각 반영되지 않음: Optimistic UI Update 적용 (e.g., 체크 시 로컬 상태 먼저 업데이트, 서버 응답 후 동기화. useReactions 훅이나 Tanstack Query의 mutateOptimistic 참고).
  - 서버 응답 처리 필요 (e.g., 에러 시 롤백).
- 체크 모드에서 체크 버튼 클릭 이벤트가 제대로 처리되지 않음: 클릭 이벤트 핸들러 추가 및 버튼 상태 업데이트 (e.g., disabled 상태나 loading indicator).
- 체크 모드에서 전체 체크 UI 반영이 안 되어 버튼 상태 업데이트 안 됨: 상태 동기화 로직 강화 (e.g., useEffect로 서버 응답 감지).

#### 4. TodoContainer

- TodoContainer는 현재 세 가지 유즈케이스를 처리해야 함:
  - CheckInWriteModal: 어제의 Todo (Collapse + 가져오기 기능) + 오늘의 Todo 생성.
  - CheckOutWriteModal: 오늘의 Todo (체크 모드).
  - PostContent {/_ Todo 리스트 섹션 _/}: Collapse된 오늘의 Todo 리스트 (체크 모드).
    - 기본적으로 Collapse 상태로 시작.
    - Collapse가 열릴 때 useTodos 쿼리 호출 (e.g., lazy loading with Tanstack Query의 useQuery, enabled: isOpen).
- TodoContainer를 더 유연하게 설계: props로 모드 전달 (e.g., mode: 'checkIn' | 'checkOut' | 'postContent')하여 내부 로직 분기.

# 추가 고려 사항

1. **전반적인 아키텍처 보충**:

   - React 베스트 프랙티스 강조: "컴포넌트는 SRP (Single Responsibility Principle)를 따르도록 하세요. e.g., UI 컴포넌트와 비즈니스 로직 분리."
   - 상태 관리: "전역 상태가 필요하다면 Tanstack Query나 Zustand 같은 라이브러리를 고려. 로컬 상태는 useState/useReducer로."
   - 에러 핸들링: "서버 요청 시 에러 처리와 로딩 상태를 추가 (e.g., isLoading, error props)."

2. **CollapseTodoListSection 보충**:

   - 왜 분리? "이 컴포넌트를 순수하게 유지하면 재사용성이 높아짐. e.g., 다른 섹션에서도 Collapse를 사용할 수 있음."
   - 구현 아이디어: "가져오기 로직은 TodoList의 useEffect나 custom hook으로 이동."

3. **TodoList / TodoItem 보충**:

   - 로직 분리 예시: "e.g., useTodoActions hook: createTodo, updateTodo, deleteTodo 함수 포함."
   - 키보드 처리: "Accessibility를 위해 aria 속성과 키보드 이벤트 (Enter, Arrow keys) 지원. useKeyboardNavigation hook으로 추출."
   - 간결화 팁: "컴포넌트 내 로직을 간결하게"

4. **TodoList 개선사항 보충**:

   - Optimistic UI 상세: "Tanstack체크 시 local cache 먼저 업데이트, 서버 실패 시 revert. @useReactions 참고"
   - 버튼 문제: "체크 버튼에 onClick 핸들러 추가, 그리고 isChecked 상태로 버튼 UI 변경 (e.g., 체크 아이콘 토글)."
   - 성능 고려: "많은 Todo 아이템 시 virtual list (react-window) 도입."

5. **TodoContainer 보충**:
   - 유즈케이스 분기: "Switch-case나 if-else로 모드별 렌더링. 공통 로직은 useTodoContainer hook으로 추출."
   - 쿼리 호출: "Collapse open 시 query enabled: true로 설정해 불필요한 API 호출 방지."
   - 추가 요구: "모바일/데스크탑 반응형 디자인 고려 (e.g., Collapse가 모바일에서 자동 펼침)."
