// 동적 로더를 사용하여 번들 크기 최적화
// 각 에디터 타입별로 필요한 확장만 동적으로 로드

export { loadPostFormExtensions } from './post-form-extensions';
export { loadCommentExtensions } from './comment-extensions';
export { loadTodoExtensions } from './todo-extensions';

// 타입 재내보내기
export type { MentionUser } from '../tiptap.types';

// 레거시 지원을 위한 동기 함수들 (점진적 마이그레이션용)
// 주의: 이 함수들은 deprecated이며 향후 제거될 예정입니다
import type { Extension } from '@tiptap/core';
import type { MentionUser as MentionUserType } from '../tiptap.types';

let cachedBaseExtensions: Promise<any[]> | null = null;

async function getCachedBaseExtensions() {
  if (!cachedBaseExtensions) {
    cachedBaseExtensions = Promise.all([
      import('@tiptap/extension-document'),
      import('@tiptap/extension-paragraph'),
      import('@tiptap/extension-text'),
      import('@tiptap/extension-history'),
      import('@tiptap/extension-bold'),
      import('@tiptap/extension-bullet-list'),
      import('@tiptap/extension-list-item'),
      import('@tiptap/extension-placeholder'),
    ]);
  }
  return cachedBaseExtensions;
}

/**
 * @deprecated 대신 loadPostFormExtensions를 사용하세요
 */
export const getPostFormExtensions = (
  placeholder?: string,
  mentionUsers?: MentionUserType[],
  onMentionSelect?: (user: MentionUserType) => void
): Extension[] => {
  console.warn('getPostFormExtensions는 deprecated되었습니다. loadPostFormExtensions를 사용하세요.');
  // 동기 함수에서는 기본값 반환 (실제 사용 시 비동기 로더 사용 권장)
  return [];
};

/**
 * @deprecated 대신 loadCommentExtensions를 사용하세요
 */
export const getCommentExtensions = (
  placeholder?: string,
  mentionUsers?: MentionUserType[],
  onMentionSelect?: (user: MentionUserType) => void
): Extension[] => {
  console.warn('getCommentExtensions는 deprecated되었습니다. loadCommentExtensions를 사용하세요.');
  return [];
};

/**
 * @deprecated 대신 loadTodoExtensions를 사용하세요
 */
export const getTodoExtensions = (
  placeholder?: string,
  mentionUsers?: MentionUserType[],
  onMentionSelect?: (user: MentionUserType) => void
): Extension[] => {
  console.warn('getTodoExtensions는 deprecated되었습니다. loadTodoExtensions를 사용하세요.');
  return [];
};