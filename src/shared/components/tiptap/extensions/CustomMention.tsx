'use client';

import Mention from '@tiptap/extension-mention';
import { ReactRenderer } from '@tiptap/react';
import type { SuggestionOptions, SuggestionProps } from '@tiptap/suggestion';
import tippy, { Instance } from 'tippy.js';
import { MentionList } from '../components/MentionList';
import type { MentionUser } from '../tiptap.types';

export const CustomMention = Mention.extend({
  name: 'customMention',

  addOptions() {
    return {
      ...Mention.options,
      HTMLAttributes: {
        class: 'mention',
      },
      renderLabel({ options, node }: any) {
        return `@${node.attrs.label ?? node.attrs.id}`;
      },
      suggestion: {
        items: ({ query }: { query: string }) => {
          // 이 함수는 실제 사용 시 외부에서 주입됩니다
          return [];
        },
        render: () => {
          let component: ReactRenderer | null = null;
          let popup: Instance[] | null = null;

          return {
            onStart: (props: any) => {
              component = new ReactRenderer(MentionList, {
                props,
                editor: props.editor,
              });

              if (!props.clientRect) {
                return;
              }

              popup = tippy('body', {
                getReferenceClientRect: props.clientRect as any,
                appendTo: () => document.body,
                content: component.element,
                showOnCreate: true,
                interactive: true,
                trigger: 'manual',
                placement: 'bottom-start',
              });
            },

            onUpdate(props: any) {
              component?.updateProps(props);

              if (!props.clientRect) {
                return;
              }

              popup?.[0]?.setProps({
                getReferenceClientRect: props.clientRect as any,
              });
            },

            onKeyDown(props: any) {
              if (props.event?.key === 'Escape') {
                popup?.[0]?.hide();
                return true;
              }

              return (component?.ref as any)?.onKeyDown?.(props) ?? false;
            },

            onExit() {
              popup?.[0]?.destroy();
              component?.destroy();
              popup = null;
              component = null;
            },
          };
        },
      } as any,
    };
  },
});

// Mention 설정을 생성하는 헬퍼 함수
export function createMentionConfig(
  users: MentionUser[],
  onMentionSelect?: (user: MentionUser) => void
) {
  return CustomMention.configure({
    HTMLAttributes: {
      class: 'mention',
    },
    suggestion: {
      items: ({ query }: { query: string }) => {
        const lowercaseQuery = query.toLowerCase();
        return users.filter(user => 
          user.name.toLowerCase().includes(lowercaseQuery) ||
          (user.email && user.email.toLowerCase().includes(lowercaseQuery))
        );
      },
      command: ({ editor, range, props }: any) => {
        // 멘션 삽입
        editor
          .chain()
          .focus()
          .insertContentAt(range, [
            {
              type: 'customMention',
              attrs: {
                id: props.id,
                label: props.name,
              },
            },
            {
              type: 'text',
              text: ' ',
            },
          ])
          .run();

        // 콜백 호출
        if (onMentionSelect) {
          onMentionSelect(props as MentionUser);
        }
      },
    },
  });
}