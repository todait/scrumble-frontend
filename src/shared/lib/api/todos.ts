/**
 * Todo 관련 API 함수들
 * 할 일 생성, 조회, 수정, 삭제, 완료 토글 등
 */

import type {
  ApiCreateTodoRequest,
  ApiTodo,
  ApiUpdateTodoRequest,
  CreateTodosApiResponse,
  GetTodosApiResponse,
  ToggleTodoApiResponse,
  UpdateTodoApiResponse,
} from '@/shared/types/api';
import type {
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
    origin_todo_id: item.originTodoId,
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
 */
const convertUpdateTodoRequestToApi = (request: Omit<UpdateTodoRequest, 'spaceSlug' | 'todoId'>): ApiUpdateTodoRequest => {
  return {
    name: request.name,
    description: request.description,
    scheduled_date: request.scheduledDate,
    order: request.order,
    thirdparty_url: request.thirdpartyUrl,
    parent_id: request.parentId,
    origin_todo_id_is_nil: request.originTodoIdIsNil,
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
    const apiRequest = convertCreateTodoRequestToApi(request);
    
    const { data } = await apiClient.post<CreateTodosApiResponse>(
      `/api/v1/spaces/${request.spaceSlug}/todos`,
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

    const { data } = await apiClient.get<GetTodosApiResponse>(
      `/api/v1/spaces/${request.spaceSlug}/todos?${queryParams.toString()}`
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
      `/api/v1/spaces/${request.spaceSlug}/todos/${request.todoId}`,
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
      `/api/v1/spaces/${request.spaceSlug}/todos/${request.todoId}/toggle`
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
    await apiClient.delete(
      `/api/v1/spaces/${request.spaceSlug}/todos/${request.todoId}`
    );
  },
};