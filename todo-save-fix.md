# 투두리스트 Save 시 빈 배열 처리 개선

## 문제 상황
- 투두리스트 save 시 todo list가 빈 배열이면 API가 제대로 호출되지 않는 문제 발생
- 서버의 `bulkUpdateTodos` API는 `todos: []` 빈 배열을 받아야 해당 날짜의 모든 투두를 삭제함
- 기존 코드에서는 `todos.length === 0`일 때 early return하여 API 호출을 스킵하고 있었음

## 해결 방안
`useSaveTodos` 훅에서 빈 배열에 대한 early return 로직을 제거하고, 빈 배열도 API에 전송하도록 수정

### 수정된 코드 위치
- 파일: `/workspace/src/shared/hooks/queries/useTodos.ts`
- 함수: `useSaveTodos` (라인 348-378)

### 수정 내용
```typescript
// 기존 코드 (문제 있음)
if (todos.length === 0) {
  return Promise.resolve();
}

// 수정된 코드 (개선됨)
// 빈 투두 배열도 API에 전송하여 삭제 처리가 가능하도록 함
return new Promise<void>((resolve, reject) => {
  bulkUpdateTodos(
    {
      scheduledDate,
      todos: todos.map(todo => ({...})),
    },
    {
      onSuccess: () => resolve(),
      onError: (error) => reject(error),
    }
  );
});
```

## 기대 효과
1. **삭제 처리 개선**: 빈 배열이 API에 전송되어 서버에서 모든 투두를 삭제할 수 있음
2. **일관성 유지**: 투두 추가/수정/삭제 모든 케이스에서 API 호출이 일관되게 처리됨
3. **UX 개선**: 사용자가 모든 투두를 삭제했을 때 실제로 서버에서도 삭제가 처리됨

## 영향받는 컴포넌트
- `PostContent.tsx`: 피드에서 투두 저장 시
- `CheckInWriteModal.tsx`: 체크인 시 투두 저장 시
- `CheckOutWriteModal.tsx`: 체크아웃 시 투두 저장 시

## 검증 방법
1. 투두 목록에서 모든 투두를 삭제한 후 저장
2. 서버에서 해당 날짜의 투두가 모두 삭제되었는지 확인
3. API 요청이 `todos: []` 빈 배열과 함께 전송되는지 확인

## 추가 고려사항
- 기존 코드에서는 성능상의 이유로 빈 배열일 때 API 호출을 스킵했을 수 있음
- 하지만 `bulkUpdateTodos` API의 동작 방식상 빈 배열 전송이 필요함
- 서버 부하는 미미할 것으로 예상됨
