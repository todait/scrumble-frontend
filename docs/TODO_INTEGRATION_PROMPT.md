# Todo API 연동 구현 프롬프트

## 개요
TodoContainer 컴포넌트에서 Todo API를 연동하여 실제 데이터를 저장하고 관리할 수 있도록 구현합니다.

## 현재 상황 및 변경 방향
1. **타입 구조 통일**: 
   - 현재 TodoContainer: `Todo { id, text, completedAt, date, order }`
   - 변경 후: API 구조와 일치시켜 `Todo { id, name, description, scheduledDate, order, thirdpartyUrl, parentId, originTodoId, depth, completedAt, children }`
   - Store는 임시 저장용으로 간단한 구조 유지: `TodoDraft { id, text, completed }`

2. **체크인 플로우 (CheckInWriteModal)**:
   - 어제 Todo를 조회하여 표시 (어제 날짜로 getTodos API 호출)
   - 오늘 Todo를 입력받아 로컬 store에 저장
   - 저장 버튼 클릭 시 한번에 `createTodos` API 호출
   - **모드 구분**: 현재는 new 모드만 지원, 추후 edit 모드 지원 예정

3. **체크아웃 플로우 (CheckOutWriteModal)**:
   - 오늘 Todo를 조회하여 표시
   - 각 Todo 체크 시 즉시 `toggleTodo` API 호출

## 구현 요구사항

### 1. Todo 타입 구조 변경
**위치**: `src/features/todo/types/index.ts`

```typescript
// API 구조와 일치하도록 Todo 타입 변경
export interface Todo {
  id: string;
  name: string;  // text → name으로 변경
  description?: string;
  scheduledDate: string;  // date → scheduledDate로 변경 (ISO 8601 형식)
  order: number;
  thirdpartyUrl?: string;
  parentId?: string;
  originTodoId?: string;
  depth: number;
  completedAt?: string;  // null 대신 undefined 사용, ISO 8601 형식
  children: Todo[];  // 현재는 빈 배열로 유지
}
```

### 2. 타입 변환 유틸리티 함수 작성
**위치**: `src/features/todo/utils/todoConverters.ts`

```typescript
// TodoDraft → Todo 변환 (store → TodoContainer)
export const convertTodoDraftToTodo = (
  draft: TodoDraft, 
  scheduledDate: string,
  order: number,
  parentId?: string,
  originTodoId?: string
): Todo => {
  return {
    id: draft.id,
    name: draft.text,
    description: undefined,
    scheduledDate,
    order,
    thirdpartyUrl: undefined,
    parentId: parentId || undefined,
    originTodoId: originTodoId || undefined,
    depth: 0,  // 현재는 평면 구조만 지원
    completedAt: draft.completed ? new Date().toISOString() : undefined,
    children: [],
  };
};

// 어제 Todo를 오늘로 복사할 때 사용 (origin_todo_id 처리 포함)
export const copyYesterdayTodoToToday = (
  yesterdayTodo: Todo,
  newId: string,
  todayDate: string,
  newOrder: number
): Todo => {
  return {
    ...yesterdayTodo,
    id: newId,
    scheduledDate: todayDate,
    order: newOrder,
    completedAt: undefined,  // 완료 상태 초기화
    // origin_todo_id 로직: 
    // 어제 todo에 origin_todo_id가 있으면 그것을 사용,
    // 없으면 어제 todo의 id를 사용
    originTodoId: yesterdayTodo.originTodoId || yesterdayTodo.id,
    children: [],  // 하위 항목은 복사하지 않음
  };
};

// Todo → CreateTodoItemRequest 변환
export const convertTodoToApiCreate = (todo: Todo): CreateTodoItemRequest => {
  return {
    name: todo.name,
    description: todo.description,
    scheduledDate: todo.scheduledDate,
    originTodoId: todo.originTodoId,
    thirdpartyUrl: todo.thirdpartyUrl,
    children: [],  // 현재는 평면 구조만 지원
  };
};
```

### 3. 체크인 모달 훅 구현
**위치**: `src/features/checkin/hooks/useCheckInTodos.ts`

```typescript
export const useCheckInTodos = (spaceSlug: string, mode: 'new' | 'edit' = 'new') => {
  const { selectedDate } = useDateStore();
  const { yesterdayTodos, todayTodos, setYesterdayTodos, setTodayTodos } = useCheckInTodoStore();
  
  // 어제 날짜 계산
  const yesterdayDate = new Date(selectedDate);
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayDateString = formatDateToAPIString(yesterdayDate);
  const todayDateString = formatDateToAPIString(selectedDate);
  
  // 어제 Todo 조회
  const { data: yesterdayData, isLoading: isLoadingYesterday } = useTodos({
    spaceSlug,
    date: yesterdayDateString,
    enabled: !!spaceSlug,
  });
  
  // 어제 Todo 데이터를 store에 동기화 (draft 형태로 간소화)
  useEffect(() => {
    if (yesterdayData?.todos) {
      const drafts = yesterdayData.todos.map(todo => ({
        id: todo.id,
        text: todo.name,
        completed: !!todo.completedAt,
      }));
      setYesterdayTodos(drafts);
    }
  }, [yesterdayData, setYesterdayTodos]);
  
  // Todo 저장 함수
  const { mutate: createTodos, isPending: isSaving } = useCreateTodos(spaceSlug);
  
  const saveTodos = useCallback(async (todosWithOrigin: Map<string, Todo>) => {
    // new 모드에서만 createTodos 호출
    if (mode !== 'new') {
      console.warn('Edit mode is not supported yet');
      return Promise.resolve();
    }
    
    // todosWithOrigin Map에서 Todo 목록 추출
    const todosToCreate = Array.from(todosWithOrigin.values())
      .filter(todo => !todo.completedAt) // 완료되지 않은 것만
      .map(todo => convertTodoToApiCreate(todo));
    
    if (todosToCreate.length === 0) {
      return Promise.resolve();
    }
    
    return new Promise((resolve, reject) => {
      createTodos(
        { todos: todosToCreate },
        {
          onSuccess: () => resolve(true),
          onError: (error) => reject(error),
        }
      );
    });
  }, [mode, createTodos]);
  
  // 어제 Todo를 오늘로 가져오는 헬퍼 함수
  const getYesterdayTodoData = useCallback((todoId: string): Todo | undefined => {
    if (!yesterdayData?.todos) return undefined;
    
    // yesterdayData.todos에서 해당 ID의 Todo 찾기
    const findTodoById = (todos: Todo[], id: string): Todo | undefined => {
      for (const todo of todos) {
        if (todo.id === id) return todo;
        const found = findTodoById(todo.children, id);
        if (found) return found;
      }
      return undefined;
    };
    
    return findTodoById(yesterdayData.todos, todoId);
  }, [yesterdayData]);
  
  return {
    isLoadingYesterday,
    saveTodos,
    isSaving,
    getYesterdayTodoData,
    todayDateString,
  };
};
```

### 4. 체크아웃 모달 훅 구현
**위치**: `src/features/checkout/hooks/useCheckOutTodos.ts`

```typescript
export const useCheckOutTodos = (spaceSlug: string) => {
  const { selectedDate } = useDateStore();
  const { todayTodos, setTodayTodos } = useCheckOutTodoStore();
  const todayDateString = formatDateToAPIString(selectedDate);
  
  // 오늘 Todo 조회
  const { data: todayData, isLoading } = useTodos({
    spaceSlug,
    date: todayDateString,
    enabled: !!spaceSlug,
  });
  
  // 오늘 Todo 데이터를 store에 동기화 (draft 형태로 간소화)
  useEffect(() => {
    if (todayData?.todos) {
      const drafts = todayData.todos.map(todo => ({
        id: todo.id,
        text: todo.name,
        completed: !!todo.completedAt,
      }));
      setTodayTodos(drafts);
    }
  }, [todayData, setTodayTodos]);
  
  // Todo 토글 함수
  const { mutate: toggleTodo } = useToggleTodo(spaceSlug);
  
  const handleToggleTodo = useCallback((todoId: string) => {
    // 낙관적 업데이트
    const todos = todayTodos.map(todo =>
      todo.id === todoId ? { ...todo, completed: !todo.completed } : todo
    );
    setTodayTodos(todos);
    
    // API 호출
    toggleTodo(
      { todoId },
      {
        onError: () => {
          // 실패 시 롤백
          setTodayTodos(todayTodos);
        },
      }
    );
  }, [todayTodos, setTodayTodos, toggleTodo]);
  
  // 실제 Todo 데이터를 가져오는 헬퍼 함수
  const getTodoData = useCallback((todoId: string): Todo | undefined => {
    if (!todayData?.todos) return undefined;
    
    const findTodoById = (todos: Todo[], id: string): Todo | undefined => {
      for (const todo of todos) {
        if (todo.id === id) return todo;
        const found = findTodoById(todo.children, id);
        if (found) return found;
      }
      return undefined;
    };
    
    return findTodoById(todayData.todos, todoId);
  }, [todayData]);
  
  return {
    isLoading,
    handleToggleTodo,
    todayData: todayData?.todos || [],
    getTodoData,
  };
};
```

### 5. 모달 컴포넌트 수정

#### CheckInWriteModal.tsx 수정사항:
```typescript
// hooks 추가
const { 
  isLoadingYesterday, 
  saveTodos, 
  isSaving, 
  getYesterdayTodoData,
  todayDateString 
} = useCheckInTodos(spaceSlug, 'new');

// 어제 날짜 계산 추가
const yesterdayDate = new Date(selectedDate);
yesterdayDate.setDate(yesterdayDate.getDate() - 1);
const yesterdayDateString = formatDateToAPIString(yesterdayDate);

// 초기 임시 데이터 제거 (useEffect 삭제)

// Todo 데이터 관리용 Map (origin_todo_id 추적)
const [todosWithOrigin, setTodosWithOrigin] = useState<Map<string, Todo>>(new Map());

// handleBringToToday 수정 (origin_todo_id 로직 포함)
const handleBringToToday = useCallback((selectedTodos: Todo[]) => {
  const todosToImport = selectedTodos.filter(todo => !broughtTodoIds.has(todo.id));
  
  if (todosToImport.length === 0) {
    alert('선택한 항목들은 이미 가져왔습니다.');
    return;
  }
  
  const maxOrder = todayTodos.length > 0 ? Math.max(...todayTodos.map(t => t.order)) : 0;
  const newTodosWithOrigin = new Map(todosWithOrigin);
  
  todosToImport.forEach((todo, index) => {
    const yesterdayTodoData = getYesterdayTodoData(todo.id);
    if (!yesterdayTodoData) return;
    
    const newId = `temp-${Date.now()}-${index}`;
    const newTodo = copyYesterdayTodoToToday(
      yesterdayTodoData,
      newId,
      todayDateString,
      maxOrder + (index + 1) * 10
    );
    
    newTodosWithOrigin.set(newId, newTodo);
  });
  
  setTodosWithOrigin(newTodosWithOrigin);
  // ... 나머지 로직
}, [todayTodos, broughtTodoIds, todosWithOrigin, getYesterdayTodoData, todayDateString]);

// handleTodoComplete 수정
const handleTodoComplete = async () => {
  setIsProcessing(true);
  
  try {
    await saveTodos(todosWithOrigin);
    
    // 체크인 생성 확인 로직...
  } catch (error) {
    // 에러 처리...
  }
};

// convertToTodos 함수는 삭제하고, 실제 Todo 타입 사용
// 새로운 함수 추가
const convertDraftsToTodos = (drafts: TodoDraft[]): Todo[] => {
  return drafts.map((draft, index) => 
    convertTodoDraftToTodo(
      draft,
      formatDateToAPIString(selectedDate),
      (index + 1) * 10
    )
  );
};

// TodoContainer props 수정
<TodoContainer
  ref={todoContainerRef}
  yesterdayTodos={convertDraftsToTodos(yesterdayTodos)}
  todayTodos={convertDraftsToTodos(todayTodos)}
  isEditable={true}
  onUpdateYesterdayTodos={handleUpdateYesterdayTodos}
  onUpdateTodayTodos={handleUpdateTodayTodos}
  onToggleComplete={handleToggleComplete}
  forceEditMode={true}
  onSaveTodos={handleTodoComplete}
  isProcessing={isProcessing || isSaving || isLoadingYesterday}
/>
```

#### CheckOutWriteModal.tsx 수정사항:
```typescript
// hooks 추가
const { isLoading, handleToggleTodo, todayData } = useCheckOutTodos(spaceSlug);

// 초기 임시 데이터 제거 (useEffect 삭제)

// handleToggleComplete 수정
const handleToggleComplete = (todoId: string, _isYesterday: boolean) => {
  handleToggleTodo(todoId);
};

// store 데이터 대신 API 데이터 직접 사용
// TodoContainer props 수정
<TodoContainer
  ref={todoContainerRef}
  yesterdayTodos={[]}
  todayTodos={todayData}  // API에서 받은 실제 Todo 데이터 사용
  isEditable={!isLoading}
  onUpdateTodayTodos={handleUpdateTodayTodos}
  onToggleComplete={handleToggleComplete}
  forceEditMode={false}
  onSaveTodos={handleTodoComplete}
  isProcessing={isProcessing || isLoading}
  customButtonText={(completedCount, totalCount) => {
    const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
    return `${completedCount}개 완료 • (${percentage}%)`;
  }}
  customButtonIcon={<RiCheckFill className="h-4 w-4" />}
  hideNoTodosButton={true}
/>
```

## 주의사항 및 고려사항

### 1. 타입 마이그레이션
- 모든 Todo 관련 컴포넌트에서 `text` → `name` 변경 필요
- `date` → `scheduledDate` 변경 필요
- `null` → `undefined` 변경 (completedAt 등)
- TodoItem, TodoList 등 하위 컴포넌트도 타입 변경 필요

### 2. origin_todo_id 로직
- 어제 Todo를 오늘로 가져올 때:
  - 어제 Todo에 `origin_todo_id`가 있으면 → 그 값을 사용
  - 어제 Todo에 `origin_todo_id`가 없으면 → 어제 Todo의 `id`를 사용
- 이를 통해 Todo의 원본 추적 가능

### 3. 모드 구분 (체크인)
- 현재: `new` 모드만 지원 (새로운 Todo 추가)
- 추후: `edit` 모드 지원 예정 (기존 Todo 업데이트 API 구현 시)

### 4. 계층 구조
- 현재는 평면 구조만 지원 (`children: []`, `depth: 0`)
- 추후 계층 구조 지원 시 UI/UX 변경 필요

### 5. 에러 처리
- API 호출 실패 시 적절한 에러 메시지 표시
- 낙관적 업데이트 실패 시 롤백 처리
- 네트워크 오류, 권한 오류 구분 처리

### 6. 성능 최적화
- 불필요한 리렌더링 방지
- 캐시 무효화 전략 적절히 사용
- TodoDraft는 UI 편집용 간소화된 타입으로 유지

### 7. UX 개선
- 로딩 상태 표시
- 저장 중 UI 비활성화
- 성공/실패 피드백 제공
- 체크아웃에서는 실시간 토글 반영

## 구현 순서

### Phase 1: 타입 구조 변경
1. `src/features/todo/types/index.ts`에서 Todo 타입 변경
2. TodoItem, TodoList, TodoContainer 등 모든 컴포넌트에서 타입 변경 반영
3. `text` → `name`, `date` → `scheduledDate` 일괄 변경

### Phase 2: 유틸리티 함수 구현
1. `src/features/todo/utils/todoConverters.ts` 파일 생성
2. 타입 변환 함수들 구현
3. origin_todo_id 로직 포함

### Phase 3: 체크인 모달 구현
1. `src/features/checkin/hooks/useCheckInTodos.ts` 생성
2. CheckInWriteModal 컴포넌트 수정
3. 어제 Todo 조회 및 오늘 Todo 저장 로직 구현

### Phase 4: 체크아웃 모달 구현
1. `src/features/checkout/hooks/useCheckOutTodos.ts` 생성
2. CheckOutWriteModal 컴포넌트 수정
3. 오늘 Todo 조회 및 토글 로직 구현

### Phase 5: 테스트 및 디버깅
1. 각 플로우별 동작 확인
2. 에러 케이스 테스트
3. 성능 최적화

## 테스트 시나리오

1. **체크인 플로우**:
   - 어제 Todo가 정상적으로 로드되는지 확인
   - 어제 Todo를 오늘로 가져올 때 origin_todo_id가 올바르게 설정되는지 확인
   - 오늘 Todo 입력 및 수정이 가능한지 확인
   - 저장 시 API 호출이 정상적으로 되는지 확인

2. **체크아웃 플로우**:
   - 오늘 Todo가 정상적으로 로드되는지 확인
   - 체크 시 즉시 API 호출이 되는지 확인
   - 토글 상태가 UI에 반영되는지 확인
   - 완료율이 정확히 계산되는지 확인

3. **에러 케이스**:
   - 네트워크 오류 시 적절한 처리
   - 권한 오류 시 적절한 메시지 표시
   - 낙관적 업데이트 실패 시 롤백 확인