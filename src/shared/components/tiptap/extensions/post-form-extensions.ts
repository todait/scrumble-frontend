import type { Extension } from '@tiptap/core';
import type { MentionUser } from '../tiptap.types';

// PostForm 전용 확장 로더
export async function loadPostFormExtensions(
  placeholder?: string,
  mentionUsers?: MentionUser[],
  onMentionSelect?: (user: MentionUser) => void
): Promise<Extension[]> {
  // 병렬로 필요한 확장만 로드
  const [
    { default: Document },
    { default: Paragraph },
    { default: Text },
    { default: History },
    { default: Bold },
    { default: BulletList },
    { default: ListItem },
    { default: Placeholder },
    { AutoLink },
    mentionModule
  ] = await Promise.all([
    import('@tiptap/extension-document'),
    import('@tiptap/extension-paragraph'),
    import('@tiptap/extension-text'),
    import('@tiptap/extension-history'),
    import('@tiptap/extension-bold'),
    import('@tiptap/extension-bullet-list'),
    import('@tiptap/extension-list-item'),
    import('@tiptap/extension-placeholder'),
    import('./AutoLink'),
    mentionUsers ? import('./CustomMention') : Promise.resolve(null)
  ]);

  const extensions: Extension[] = [
    Document as any,
    Paragraph as any,
    Text as any,
    History as any,
    Bold.configure({
      HTMLAttributes: {
        class: 'font-bold',
      },
    }) as any,
    BulletList.configure({
      HTMLAttributes: {
        class: 'list-disc pl-5 space-y-1',
      },
    }) as any,
    ListItem.configure({
      HTMLAttributes: {
        class: 'leading-normal',
      },
    }) as any,
    Placeholder.configure({
      placeholder,
      emptyEditorClass: 'is-editor-empty',
    }) as any,
    AutoLink as any,
  ];

  // 멘션 확장 추가 (필요한 경우만)
  if (mentionModule && mentionUsers) {
    extensions.push(mentionModule.createMentionConfig(mentionUsers, onMentionSelect) as any);
  }

  return extensions;
}