import { ApiResponse, PaginatedResponse, ID } from '@/shared/types';

import { Post, PostCreateRequest, PostUpdateRequest, Reaction, Comment } from '../types/feed.types';

/**
 * 피드 관련 API 서비스
 * 체크인/체크아웃 포스트, 리액션, 댓글 등을 관리
 */
export class FeedService {
  private baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

  /**
   * 스페이스의 피드 목록을 가져옵니다
   * @param spaceId - 스페이스 ID
   * @param page - 페이지 번호 (기본값: 1)
   * @param limit - 페이지당 항목 수 (기본값: 20)
   * @param filter - 필터링 옵션 ('all' | 'checkin' | 'checkout')
   * @returns 피드 포스트 목록
   */
  async getFeedPosts(
    spaceId: ID,
    page = 1,
    limit = 20,
    filter: 'all' | 'checkin' | 'checkout' = 'all'
  ): Promise<ApiResponse<PaginatedResponse<Post>>> {
    try {
      // TODO: 실제 API 호출로 교체
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        filter,
      });

      const response = await fetch(`${this.baseURL}/spaces/${spaceId}/feed?${params}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.getAccessToken()}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch feed posts');
      }

      const data = await response.json();
      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error('Get feed posts error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * 체크인 포스트를 생성합니다
   * @param spaceId - 스페이스 ID
   * @param postData - 체크인 데이터
   * @returns 생성된 포스트
   */
  async createCheckinPost(spaceId: ID, postData: PostCreateRequest): Promise<ApiResponse<Post>> {
    try {
      // TODO: 실제 API 호출로 교체
      const response = await fetch(`${this.baseURL}/spaces/${spaceId}/checkins`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.getAccessToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkin post');
      }

      const data = await response.json();
      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error('Create checkin post error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * 체크아웃 포스트를 생성합니다
   * @param spaceId - 스페이스 ID
   * @param postData - 체크아웃 데이터
   * @returns 생성된 포스트
   */
  async createCheckoutPost(spaceId: ID, postData: PostCreateRequest): Promise<ApiResponse<Post>> {
    try {
      // TODO: 실제 API 호출로 교체
      const response = await fetch(`${this.baseURL}/spaces/${spaceId}/checkouts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.getAccessToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout post');
      }

      const data = await response.json();
      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error('Create checkout post error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * 포스트에 리액션을 추가합니다
   * @param postId - 포스트 ID
   * @param emoji - 리액션 이모지
   * @returns 업데이트된 리액션 정보
   */
  async addReaction(postId: ID, emoji: string): Promise<ApiResponse<Reaction>> {
    try {
      // TODO: 실제 API 호출로 교체
      const response = await fetch(`${this.baseURL}/posts/${postId}/reactions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.getAccessToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ emoji }),
      });

      if (!response.ok) {
        throw new Error('Failed to add reaction');
      }

      const data = await response.json();
      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error('Add reaction error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * 포스트에서 리액션을 제거합니다
   * @param postId - 포스트 ID
   * @param reactionId - 리액션 ID
   * @returns 성공 여부
   */
  async removeReaction(postId: ID, reactionId: ID): Promise<ApiResponse<void>> {
    try {
      // TODO: 실제 API 호출로 교체
      const response = await fetch(`${this.baseURL}/posts/${postId}/reactions/${reactionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.getAccessToken()}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to remove reaction');
      }

      return {
        success: true,
      };
    } catch (error) {
      console.error('Remove reaction error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * 포스트에 댓글을 추가합니다
   * @param postId - 포스트 ID
   * @param content - 댓글 내용
   * @returns 생성된 댓글
   */
  async addComment(postId: ID, content: string): Promise<ApiResponse<Comment>> {
    try {
      // TODO: 실제 API 호출로 교체
      const response = await fetch(`${this.baseURL}/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.getAccessToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        throw new Error('Failed to add comment');
      }

      const data = await response.json();
      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error('Add comment error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * 포스트를 수정합니다
   * @param postId - 포스트 ID
   * @param updateData - 수정할 데이터
   * @returns 수정된 포스트
   */
  async updatePost(postId: ID, updateData: PostUpdateRequest): Promise<ApiResponse<Post>> {
    try {
      // TODO: 실제 API 호출로 교체
      const response = await fetch(`${this.baseURL}/posts/${postId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${this.getAccessToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error('Failed to update post');
      }

      const data = await response.json();
      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error('Update post error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * 포스트를 삭제합니다
   * @param postId - 포스트 ID
   * @returns 성공 여부
   */
  async deletePost(postId: ID): Promise<ApiResponse<void>> {
    try {
      // TODO: 실제 API 호출로 교체
      const response = await fetch(`${this.baseURL}/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.getAccessToken()}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete post');
      }

      return {
        success: true,
      };
    } catch (error) {
      console.error('Delete post error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * 로컬 스토리지에서 액세스 토큰을 가져옵니다
   * TODO: 실제 토큰 관리 로직으로 교체
   */
  private getAccessToken(): string {
    // TODO: 실제 토큰 관리 시스템과 연동
    return localStorage.getItem('accessToken') || '';
  }
}

export const feedService = new FeedService();