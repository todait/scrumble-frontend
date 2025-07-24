import type { Extension } from '@tiptap/core';
import type { MentionUser } from '../tiptap.types';

// TodoEditor 전용 확장 로더 (최소 기능만)
export async function loadTodoExtensions(
  placeholder?: string,
  mentionUsers?: MentionUser[],
  onMentionSelect?: (user: MentionUser) => void
): Promise<Extension[]> {
  // 병렬로 필요한 최소 확장만 로드
  const [
    { default: Document },
    { default: Paragraph },
    { default: Text },
    { default: History },
    { default: Bold },
    { default: Placeholder },
    mentionModule
  ] = await Promise.all([
    import('@tiptap/extension-document'),
    import('@tiptap/extension-paragraph'),
    import('@tiptap/extension-text'),
    import('@tiptap/extension-history'),
    import('@tiptap/extension-bold'),
    import('@tiptap/extension-placeholder'),
    mentionUsers ? import('./CustomMention') : Promise.resolve(null)
  ]);

  const extensions: Extension[] = [
    Document as any,
    Paragraph.configure({
      HTMLAttributes: {
        class: 'inline',
      },
    }) as any,
    Text as any,
    History as any,
    Bold.configure({
      HTMLAttributes: {
        class: 'font-bold',
      },
    }) as any,
    Placeholder.configure({
      placeholder,
      emptyEditorClass: 'is-editor-empty',
    }) as any,
  ];

  // 멘션 확장 추가 (필요한 경우만)
  if (mentionModule && mentionUsers) {
    extensions.push(mentionModule.createMentionConfig(mentionUsers, onMentionSelect) as any);
  }

  return extensions;
}