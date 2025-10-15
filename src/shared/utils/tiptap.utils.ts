import type { JSONContent } from '@tiptap/core';

/**
 * JSON 문자열을 안전하게 파싱
 * @param input - 파싱할 입력값 (문자열 또는 기타)
 * @returns 파싱된 객체 또는 undefined
 */
export const safeParseJson = <T = any>(input: unknown): T | undefined => {
  if (typeof input !== 'string') return undefined;
  try {
    return JSON.parse(input) as T;
  } catch {
    return undefined;
  }
};

/**
 * 유효한 Tiptap 문서인지 확인
 * @param json - 검증할 JSON 객체
 * @returns Tiptap 문서 여부
 */
export const isValidTiptapDoc = (json: any): boolean =>
  !!json && typeof json === 'object' && json.type === 'doc';

/**
 * 빈 Tiptap 문서 생성
 * @returns 빈 Tiptap 문서
 */
export const emptyDoc = (): JSONContent => ({
  type: 'doc',
  content: [{ type: 'paragraph' }],
});

/**
 * 일반 텍스트를 Tiptap 문서로 변환
 * @param text - 변환할 텍스트
 * @returns Tiptap 문서
 */
export const textToDoc = (text: string): JSONContent => ({
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: text ? [{ type: 'text', text }] : undefined,
    },
  ],
});

/**
 * API 응답의 JSON 필드를 정규화
 * - stringified JSON → object
 * - 유효하지 않은 경우 fallbackText를 문서로 변환
 *
 * @param maybeJson - API에서 받은 JSON 필드 (object, string, 또는 undefined)
 * @param fallbackText - JSON이 유효하지 않을 때 사용할 텍스트
 * @returns 정규화된 JSONContent 또는 undefined
 */
export const normalizeApiJson = (
  maybeJson: unknown,
  fallbackText?: string
): JSONContent | undefined => {
  // 문자열이면 파싱 시도, 아니면 그대로 사용
  const parsed = typeof maybeJson === 'string' ? safeParseJson<JSONContent>(maybeJson) : maybeJson;

  // 유효한 Tiptap 문서면 그대로 반환
  if (isValidTiptapDoc(parsed)) return parsed as JSONContent;

  // 유효하지 않으면 fallbackText를 문서로 변환
  if (fallbackText && fallbackText.length > 0) return textToDoc(fallbackText);

  return undefined;
};

/**
 * Tiptap JSON에서 일반 텍스트 추출
 * @param json - Tiptap JSON 문서
 * @param fallbackText - JSON이 없거나 유효하지 않을 때 사용할 텍스트
 * @returns 추출된 일반 텍스트
 */
export const extractPlainText = (json?: JSONContent, fallbackText = ''): string => {
  if (!json || !isValidTiptapDoc(json)) return fallbackText || '';

  const walk = (node: any): string => {
    if (!node) return '';
    if (node.type === 'text') return node.text || '';
    if (Array.isArray(node.content)) return node.content.map(walk).join('');
    return '';
  };

  return walk(json);
};

/**
 * Tiptap JSON이 비어있는지 확인
 * @param json - 확인할 JSON 문서
 * @returns 비어있으면 true
 */
export const isEmptyJson = (json?: JSONContent): boolean => {
  if (!json || !isValidTiptapDoc(json)) return true;
  const text = extractPlainText(json);
  return text.trim().length === 0;
};
