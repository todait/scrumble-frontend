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
    Document,
    Paragraph.configure({
      HTMLAttributes: {
        class: 'inline',
      },
    }),
    Text,
    History,
    Bold.configure({
      HTMLAttributes: {
        class: 'font-bold',
      },
    }),
    Placeholder.configure({
      placeholder,
      emptyEditorClass: 'is-editor-empty',
    }),
  ];

  // 멘션 확장 추가 (필요한 경우만)
  if (mentionModule && mentionUsers) {
    extensions.push(mentionModule.createMentionConfig(mentionUsers, onMentionSelect));
  }

  return extensions;
}