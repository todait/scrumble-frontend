/**
 * Todo 관련 API 함수들
 * 할 일 생성, 조회, 수정, 삭제, 완료 토글 등
 */

import type {
  ApiCreateTodoRequest,
  ApiTodo,
  ApiUpdateTodoRequest,
  ApiBulkUpdateTodosRequest,
  BulkUpdateTodosApiResponse,
  CreateTodosApiResponse,
  GetTodosApiResponse,
  ToggleTodoApiResponse,
  UpdateTodoApiResponse,
} from '@/shared/types/api';
import type {
  BulkUpdateTodosRequest,
  BulkUpdateTodosResponse,
  CreateTodosRequest,
  CreateTodosResponse,
  DeleteTodoRequest,
  DeleteTodoResponse,
  GetTodosRequest,
  GetTodosResponse,
  Todo,
  ToggleTodoRequest,
  ToggleTodoResponse,
  UpdateTodoRequest,
  UpdateTodoResponse,
} from '@/shared/types/todo';
import { debug } from '@/shared/utils/debug';
import { apiClient } from '../api';

/**
 * 백엔드 API 응답을 프론트엔드 타입으로 변환하는 함수
 * snake_case에서 camelCase로 변환
 */
const convertApiTodoToTodo = (apiTodo: ApiTodo): Todo => {
  return {
    id: apiTodo.id,
    name: apiTodo.name,
    description: apiTodo.description,
    scheduledDate: apiTodo.scheduled_date,
    order: apiTodo.order,
    thirdpartyUrl: apiTodo.thirdparty_url,
    parentId: apiTodo.parent_id,
    originTodoId: apiTodo.origin_todo_id,
    depth: apiTodo.depth,
    completedAt: apiTodo.completed_at,
    children: apiTodo.children.map(convertApiTodoToTodo),
  };
};

/**
 * 프론트엔드 Todo 생성 요청을 백엔드 API 요청으로 변환하는 함수
 * camelCase에서 snake_case로 변환
 */
const convertCreateTodoRequestToApi = (request: CreateTodosRequest): ApiCreateTodoRequest => {
  const convertItem = (item: CreateTodosRequest['todos'][0]): ApiCreateTodoRequest['todos'][0] => ({
    name: item.name,
    description: item.description,
    scheduled_date: item.scheduledDate,
    origin_todo_id: item.originTodoId === null ? '' : item.originTodoId,
    thirdparty_url: item.thirdpartyUrl,
    children: item.children.map(convertItem),
  });

  return {
    todos: request.todos.map(convertItem),
  };
};

/**
 * 프론트엔드 Todo 수정 요청을 백엔드 API 요청으로 변환하는 함수
 * camelCase에서 snake_case로 변환
 * completed_at 필드: undefined일 때는 제외, null이나 빈 문자열은 그대로 전달
 */
const convertUpdateTodoRequestToApi = (
  request: Omit<UpdateTodoRequest, 'todoId'>
): ApiUpdateTodoRequest => {
  return {
    name: request.name,
    description: request.description,
    scheduled_date: request.scheduledDate,
    order: request.order,
    thirdparty_url: request.thirdpartyUrl,
    parent_id: request.parentId,
    origin_todo_id: request.originTodoId === null ? '' : request.originTodoId,
    ...(request.completedAt !== undefined && { completed_at: request.completedAt }),
  };
};

/**
 * 프론트엔드 Todo 일괄 업데이트 요청을 백엔드 API 요청으로 변환하는 함수
 * camelCase에서 snake_case로 변환
 * completed_at 필드: undefined일 때는 제외, null이나 빈 문자열은 그대로 전달
 */
const convertBulkUpdateTodoRequestToApi = (
  request: BulkUpdateTodosRequest
): ApiBulkUpdateTodosRequest => {
  return {
    scheduled_date: request.scheduledDate,
    todos: request.todos.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description,
      scheduled_date: item.scheduledDate,
      order: item.order,
      thirdparty_url: item.thirdpartyUrl,
      parent_id: item.parentId,
      origin_todo_id: item.originTodoId === null ? '' : item.originTodoId,
      ...(item.completedAt !== undefined && { completed_at: item.completedAt }),
    })),
  };
};

/**
 * Todo 관련 API 함수들
 */
export const todosApi = {
  /**
   * 할 일 생성
   * @param request 할 일 생성 요청
   * @returns 성공 메시지
   */
  createTodos: async (request: CreateTodosRequest): Promise<CreateTodosResponse> => {
    request.todos.forEach(todo => {
      debug('createTodos', String(todo.name));
      debug('createTodos', String(todo.description));
      debug('createTodos', String(todo.scheduledDate));
      debug('createTodos', String(todo.originTodoId));
      debug('createTodos', String(todo.thirdpartyUrl));
      debug('createTodos', String(todo.children.length));
    });

    const apiRequest = convertCreateTodoRequestToApi(request);

    const { data } = await apiClient.post<CreateTodosApiResponse>(
      `/api/v1/todos`,
      apiRequest
    );

    return {
      message: data.message,
    };
  },

  /**
   * 날짜별 할 일 조회
   * @param request 할 일 조회 요청
   * @returns 할 일 목록 (계층적 구조)
   */
  getTodos: async (request: GetTodosRequest): Promise<GetTodosResponse> => {
    const queryParams = new URLSearchParams();
    queryParams.append('date', request.date);
    
    // spaceMemberId가 있으면 쿼리 파라미터에 추가
    if (request.spaceMemberId) {
      queryParams.append('spaceMemberID', request.spaceMemberId);
    }

    const { data } = await apiClient.get<GetTodosApiResponse>(
      `/api/v1/todos?${queryParams.toString()}`
    );

    return {
      todos: data.todos.map(convertApiTodoToTodo),
    };
  },

  /**
   * 할 일 수정
   * @param request 할 일 수정 요청
   * @returns 성공 메시지
   */
  updateTodo: async (request: UpdateTodoRequest): Promise<UpdateTodoResponse> => {
    const apiRequest = convertUpdateTodoRequestToApi(request);

    const { data } = await apiClient.patch<UpdateTodoApiResponse>(
      `/api/v1/todos/${request.todoId}`,
      apiRequest
    );

    return {
      message: data.message,
    };
  },

  /**
   * 할 일 완료 상태 토글
   * @param request 할 일 완료 토글 요청
   * @returns 성공 메시지
   */
  toggleTodo: async (request: ToggleTodoRequest): Promise<ToggleTodoResponse> => {
    const { data } = await apiClient.patch<ToggleTodoApiResponse>(
      `/api/v1/todos/${request.todoId}/toggle`
    );

    return {
      message: data.message,
    };
  },

  /**
   * 할 일 삭제
   * @param request 할 일 삭제 요청
   * @returns 빈 응답 (204 No Content)
   */
  deleteTodo: async (request: DeleteTodoRequest): Promise<DeleteTodoResponse> => {
    await apiClient.delete(`/api/v1/todos/${request.todoId}`);
  },

  /**
   * 할 일 일괄 업데이트
   * @param request 할 일 일괄 업데이트 요청
   * @returns 일괄 업데이트 결과
   */
  bulkUpdateTodos: async (request: BulkUpdateTodosRequest): Promise<BulkUpdateTodosResponse> => {
    const apiRequest = convertBulkUpdateTodoRequestToApi(request);

    const { data } = await apiClient.post<BulkUpdateTodosApiResponse>(
      `/api/v1/todos`,
      apiRequest
    );

    return {
      message: data.message,
      result: data.result,
    };
  },
};
