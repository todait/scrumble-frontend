import { apiClient } from '../api';
import { getUserTimezone } from '../../utils/timezone';

/**
 * 특정 API 요청에서 커스텀 타임존을 사용하고 싶을 때 사용하는 헬퍼 함수들
 */

interface ApiRequestConfig {
  timezone?: string;
  headers?: Record<string, string>;
  [key: string]: unknown;
}

/**
 * 커스텀 타임존으로 API 요청을 보내는 헬퍼 함수
 * @param url 요청 URL
 * @param config 요청 설정 (timezone 포함 가능)
 * @returns API 응답
 */
export const apiClientWithTimezone = {
  get: <T = unknown>(url: string, config: ApiRequestConfig = {}) => {
    const { timezone, ...restConfig } = config;
    return apiClient.get<T>(url, {
      ...restConfig,
      headers: {
        ...restConfig.headers,
        'X-Timezone': timezone || getUserTimezone(),
      },
    });
  },

  post: <T = unknown>(url: string, data?: unknown, config: ApiRequestConfig = {}) => {
    const { timezone, ...restConfig } = config;
    return apiClient.post<T>(url, data, {
      ...restConfig,
      headers: {
        ...restConfig.headers,
        'X-Timezone': timezone || getUserTimezone(),
      },
    });
  },

  put: <T = unknown>(url: string, data?: unknown, config: ApiRequestConfig = {}) => {
    const { timezone, ...restConfig } = config;
    return apiClient.put<T>(url, data, {
      ...restConfig,
      headers: {
        ...restConfig.headers,
        'X-Timezone': timezone || getUserTimezone(),
      },
    });
  },

  delete: <T = unknown>(url: string, config: ApiRequestConfig = {}) => {
    const { timezone, ...restConfig } = config;
    return apiClient.delete<T>(url, {
      ...restConfig,
      headers: {
        ...restConfig.headers,
        'X-Timezone': timezone || getUserTimezone(),
      },
    });
  },

  patch: <T = unknown>(url: string, data?: unknown, config: ApiRequestConfig = {}) => {
    const { timezone, ...restConfig } = config;
    return apiClient.patch<T>(url, data, {
      ...restConfig,
      headers: {
        ...restConfig.headers,
        'X-Timezone': timezone || getUserTimezone(),
      },
    });
  },
};