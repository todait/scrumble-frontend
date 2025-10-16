import type { Editor, JSONContent } from '@tiptap/react';
import type { Extension } from '@tiptap/core';

export type { Editor, JSONContent, Extension };

export interface TiptapEditorProps {
  content?: JSONContent | null;
  onChange?: (json: JSONContent, plainText: string, editor: Editor) => void;
  placeholder?: string;
  disabled?: boolean;
  editable?: boolean;
  minHeight?: number;
  maxHeight?: number;
  extensions?: Extension[];
  className?: string;
  onEditorClick?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onKeyDown?: (event: KeyboardEvent, editor: Editor) => boolean;
  onPaste?: (event: ClipboardEvent) => boolean;
}

export interface TiptapViewerProps {
  content: JSONContent | string | null;
  fallbackText?: string;
  maxLength?: number;
  className?: string;
  expandText?: string;
  initialExpanded?: boolean;
  onExpandChange?: (expanded: boolean) => void;
}

export interface TiptapFloatingToolbarProps {
  editor: Editor;
}
