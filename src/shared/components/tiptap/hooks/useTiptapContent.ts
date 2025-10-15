import { useMemo } from 'react';
import type { JSONContent } from '@tiptap/react';

export function useTiptapContent(content: JSONContent | string | null) {
  const isJson = useMemo(() => {
    return content && typeof content === 'object' && 'type' in content;
  }, [content]);

  const plainText = useMemo(() => {
    if (isJson) {
      return extractTextFromJson(content as JSONContent);
    }
    return (content as string) || '';
  }, [content, isJson]);

  return {
    isJson,
    plainText,
    jsonContent: isJson ? (content as JSONContent) : null,
  };
}

export function extractTextFromJson(json: JSONContent): string {
  if (!json.content) return '';

  return json.content
    .map(node => {
      if (node.type === 'text') return node.text || '';
      if (node.content) return extractTextFromJson(node);
      return '';
    })
    .join('\n');
}
