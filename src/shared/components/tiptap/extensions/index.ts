import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import type { AnyExtension } from '@tiptap/core';

function dedupeExtensions(extensions: AnyExtension[]) {
  const seen = new Set<string>();
  return extensions.filter(extension => {
    if (!extension?.name) {
      return true;
    }
    if (seen.has(extension.name)) {
      return false;
    }
    seen.add(extension.name);
    return true;
  });
}

export function getDefaultExtensions(placeholder?: string) {
  return dedupeExtensions([
    StarterKit.configure({
      heading: false,
      bulletList: {
        HTMLAttributes: {
          class: 'list-disc pl-6',
        },
      },
      orderedList: {
        HTMLAttributes: {
          class: 'list-decimal pl-6',
        },
      },
      codeBlock: {
        HTMLAttributes: {
          class: 'bg-gray-100 rounded p-2 font-mono text-sm',
        },
      },
      blockquote: {
        HTMLAttributes: {
          class: 'border-l-4 border-gray-300 pl-4 italic',
        },
      },
      horizontalRule: false,
      dropcursor: {
        color: '#9747FF',
        width: 2,
      },
    }),
    Link.configure({
      openOnClick: false,
      HTMLAttributes: {
        class: 'text-purple-600 hover:underline cursor-pointer',
      },
    }),
    Underline,
    Placeholder.configure({
      placeholder: placeholder || '내용을 입력하세요...',
      showOnlyWhenEditable: true,
      showOnlyCurrent: true,
      emptyEditorClass: 'is-editor-empty',
    }),
  ]);
}

export function getViewerExtensions() {
  return dedupeExtensions([
    StarterKit.configure({
      heading: false,
      bulletList: {
        HTMLAttributes: {
          class: 'list-disc pl-6',
        },
      },
      orderedList: {
        HTMLAttributes: {
          class: 'list-decimal pl-6',
        },
      },
      codeBlock: {
        HTMLAttributes: {
          class: 'bg-gray-100 rounded p-2 font-mono text-sm',
        },
      },
      blockquote: {
        HTMLAttributes: {
          class: 'border-l-4 border-gray-300 pl-4 italic',
        },
      },
      horizontalRule: false,
      dropcursor: false,
    }),
    Link.configure({
      openOnClick: true,
      HTMLAttributes: {
        class: 'text-purple-600 hover:underline',
        target: '_blank',
        rel: 'noopener noreferrer',
      },
    }),
    Underline,
  ]);
}
