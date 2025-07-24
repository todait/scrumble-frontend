import type { ImageMetadata, UploadingImage } from '@/shared/types/upload.types';
import type { Editor, Extension } from '@tiptap/core';
import type { EditorProps } from '@tiptap/pm/view';

export interface MentionUser {
  id: string;
  name: string;
  avatar?: string;
  email?: string;
}

export interface MentionSuggestion {
  users: MentionUser[];
  loading: boolean;
  query: string;
}

// useImageUpload 훅의 정확한 반환 타입
export interface ImageUploadHook {
  uploadImages: (files: File[]) => Promise<void>;
  uploadingImages: UploadingImage[];
  completedImages: ImageMetadata[];
  removeImage: (id: string) => void;
  clearImages: () => void;
  isUploading: boolean;
  isConverting: boolean;
  convertingCount: number;
  initializeWithImages: (images: ImageMetadata[]) => void;
  isHeicSupported: boolean;
}

export interface BaseTiptapEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  extensions?: Extension[];
  editorProps?: EditorProps;
  onFocus?: () => void;
  onBlur?: () => void;
  disabled?: boolean;
  autoFocus?: boolean;

  // 이미지 업로드 통합 (선택적)
  imageUploadConfig?: {
    enabled: boolean;
    onImageUpload?: (files: File[]) => void;
    uploadingImages?: any[];
    completedImages?: any[];
  };

  // 멘션 설정
  mentionConfig?: {
    suggestions: MentionUser[];
    onMentionSelect?: (user: MentionUser) => void;
  };
}

export interface PostFormEditorProps extends BaseTiptapEditorProps {
  minHeight?: number; // 기본값: 240px
  onSubmit?: () => void;

  // 이미지 업로드 필수
  imageUploadHook: ImageUploadHook;
}

export interface CommentEditorProps extends BaseTiptapEditorProps {
  mode?: 'new' | 'edit';
  minLines?: number; // 기본값: 1
  maxLines?: number; // 기본값: 5
  onSubmit?: () => void;
  onCancel?: () => void;

  // 이미지 업로드 선택적
  imageUploadHook?: ImageUploadHook;
  enableImageUpload?: boolean; // 기본값: true
}

export interface TodoEditorProps extends BaseTiptapEditorProps {
  onSubmit?: () => void;
  enableMentions?: boolean;

  // 이미지 업로드 명시적으로 비활성화
  // imageUploadConfig는 사용하지 않음
}

export interface EditorConfig {
  extensions: Extension[];
  editorProps: EditorProps;
  styling: {
    className: string;
    customCSS?: string;
  };
  behavior: {
    allowLineBreaks: boolean;
    submitOnEnter: boolean;
    autoResize: boolean;
    allowImageUpload: boolean;
  };
}

export interface ComponentSpecificConfig {
  PostForm: {
    minHeight: 240;
    allowImageUpload: true;
    extensions: ['Bold', 'BulletList', 'AutoLink', 'Mention'];
  };
  CommentInput: {
    dynamicHeight: true;
    maxLines: 5;
    allowImageUpload: true;
    extensions: ['Bold', 'BulletList', 'AutoLink', 'Mention'];
  };
  TodoInput: {
    singleLine: true;
    allowImageUpload: false;
    extensions: ['Bold', 'Mention'];
  };
}

export interface LinkDetectionRule {
  pattern: RegExp;
  transform: (match: string) => string;
  className?: string;
}

export interface ImageUploadIntegration {
  uploadHook: ImageUploadHook;
  componentSupport: {
    PostForm: true;
    CommentInput: true;
    CommentEdit: true;
    TodoInput: false;
  };
  handlePaste: (event: ClipboardEvent) => boolean;
  handleDrop: (event: DragEvent) => boolean;
  images: ImageMetadata[];
  uploadingImages: UploadingImage[];
  syncWithEditor: (editor: Editor) => void;
}

export interface TiptapImageHandling {
  preventInlineImages: boolean;
  handleImageDrop: (event: DragEvent) => {
    isOverEditor: boolean;
    isOverUploadArea: boolean;
    preventDefault: boolean;
  };
  handleClipboardImage: (items: DataTransferItemList) => {
    hasImage: boolean;
    images: File[];
    shouldPreventDefault: boolean;
  };
}

export enum EventPriority {
  IMAGE_UPLOAD = 1,
  TIPTAP_EDITOR = 2,
  DEFAULT = 3,
}

export interface EventCoordinator {
  componentType: 'PostForm' | 'CommentInput' | 'TodoInput';
  registerHandler(event: string, handler: (event: Event) => void, priority: EventPriority): void;
  handleEvent(event: Event): void;
  shouldHandleImageEvent(): boolean;
}
