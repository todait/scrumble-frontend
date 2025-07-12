# TODO 컴포넌트 리팩토링 분석 결과

## 1. TodoContainer.tsx

### 현재 문제점
- 8개의 useState로 인한 복잡한 상태 관리
- 가져오기 로직이 컴포넌트에 직접 구현되어 있음
- 모드별 분기 로직이 복잡함

### 개선 방안
1. **상태 관리 통합**
   ```typescript
   // useTodoContainer.ts (새로운 custom hook)
   interface TodoContainerState {
     viewMode: TodoMode;
     selectedYesterdayIds: string[];
     isYesterdayCollapsed: boolean;
     isTodayCollapsed: boolean;
     broughtTodoIds: Set<string>;
     todoIdMapping: Map<string, string>;
   }
   
   // useReducer 또는 단일 state 객체로 관리
   ```

2. **가져오기 로직 분리**
   ```typescript
   // useTodoBring.ts (새로운 custom hook)
   export function useTodoBring() {
     const [broughtTodoIds, setBroughtTodoIds] = useState<Set<string>>(new Set());
     const [todoIdMapping, setTodoIdMapping] = useState<Map<string, string>>(new Map());
     
     const handleBringToToday = useCallback(...);
     const handleUpdateWithTracking = useCallback(...);
     
     return { broughtTodoIds, todoIdMapping, handleBringToToday, handleUpdateWithTracking };
   }
   ```

3. **불필요한 코드 제거**
   - 91번, 97번 줄의 주석 처리된 console.log 제거

## 2. CollapseSection.tsx

### 현재 상태
- ✅ 이미 요구사항을 충족
- ✅ 순수하게 Collapse 기능만 담당
- ✅ 깔끔한 구조

### 개선사항
- 추가 개선 불필요

## 3. TodoList.tsx

### 현재 문제점
- 14개의 props로 인한 복잡한 인터페이스
- 선택 관련 로직이 컴포넌트에 직접 구현
- 가져오기 UI가 TodoList에 포함

### 개선 방안
1. **선택 로직 분리**
   ```typescript
   // useTodoSelection.ts (새로운 custom hook)
   export function useTodoSelection(todos: Todo[], disabledIds: Set<string>) {
     const [selectedIds, setSelectedIds] = useState<string[]>([]);
     const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null);
     
     const handleToggleSelect = useCallback(...);
     const handleShiftSelectRange = useCallback(...);
     const stats = calculateSelectionStats(todos, selectedIds);
     
     return {
       selectedIds,
       setSelectedIds,
       handleToggleSelect,
       handleShiftSelectRange,
       stats,
     };
   }
   ```

2. **가져오기 버튼 분리**
   ```typescript
   // TodoBringButton.tsx (새로운 컴포넌트)
   interface TodoBringButtonProps {
     todos: Todo[];
     selectedIds: string[];
     disabledIds: Set<string>;
     onBringToToday: (selectedTodos: Todo[]) => void;
   }
   
   export function TodoBringButton({ todos, selectedIds, disabledIds, onBringToToday }: TodoBringButtonProps) {
     const stats = calculateSelectionStats(todos, selectedIds);
     const canBring = stats.totalCount > 0;
     
     // 가져오기 버튼 UI 렌더링
   }
   ```

3. **Props 정리**
   - 관련된 props를 객체로 그룹화
   - 선택 관련 props를 옵셔널하게 만들어 유연성 증가

## 4. 추가 개선사항

### Optimistic UI Update
- 현재 TodoContainer에서 구현된 Optimistic Update를 전역적으로 적용
- React Query의 optimistic update 기능 활용 검토

### 에러 처리
- 서버 요청 실패 시 롤백 로직 추가
- 사용자에게 에러 메시지 표시

### 성능 최적화
- 많은 Todo 항목이 있을 때를 위한 가상 스크롤링 고려
- React.memo를 활용한 불필요한 리렌더링 방지

## 구현 우선순위

1. **높음**: TodoList의 선택 로직을 custom hook으로 분리
2. **높음**: TodoContainer의 상태 관리 통합
3. **중간**: 가져오기 버튼을 별도 컴포넌트로 분리
4. **낮음**: Optimistic UI Update 개선
5. **낮음**: 성능 최적화 (필요시)