import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CommentEditor } from '../components/CommentEditor';
import type { ImageUploadHook } from '../tiptap.types';

// Mock the extension loaders
jest.mock('../extensions/comment-extensions', () => ({
  loadCommentExtensions: jest.fn().mockResolvedValue([]),
}));

// Mock BaseTiptapEditor
jest.mock('../BaseTiptapEditor', () => ({
  BaseTiptapEditor: ({ onUpdate, onKeyDown, onPaste }: any) => (
    <div
      data-testid="base-tiptap-editor"
      onClick={() => onUpdate?.('test content')}
      onKeyDown={(e) => onKeyDown?.(e)}
      onPaste={(e) => onPaste?.(e)}
    >
      Mock BaseTiptapEditor
    </div>
  ),
}));

const mockImageUploadHook: ImageUploadHook = {
  uploadImages: jest.fn(),
  uploadingImages: [],
  completedImages: [],
  removeImage: jest.fn(),
  clearImages: jest.fn(),
  isUploading: false,
  isConverting: false,
  convertingCount: 0,
  initializeWithImages: jest.fn(),
  isHeicSupported: true,
};

describe('CommentEditor', () => {
  const defaultProps = {
    content: '',
    onUpdate: jest.fn(),
    onSubmit: jest.fn(),
    onCancel: jest.fn(),
    placeholder: 'Write a comment...',
    mode: 'new' as const,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('렌더링이 정상적으로 된다', async () => {
    render(<CommentEditor {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByTestId('base-tiptap-editor')).toBeInTheDocument();
    });
  });

  it('content 업데이트 시 onUpdate 콜백이 호출된다', async () => {
    const onUpdate = jest.fn();
    render(<CommentEditor {...defaultProps} onUpdate={onUpdate} />);
    
    await waitFor(() => {
      expect(screen.getByTestId('base-tiptap-editor')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByTestId('base-tiptap-editor'));
    
    expect(onUpdate).toHaveBeenCalledWith('test content');
  });

  it('new 모드에서 Enter 키로 onSubmit이 호출된다', async () => {
    const onSubmit = jest.fn();
    render(<CommentEditor {...defaultProps} mode="new" onSubmit={onSubmit} />);
    
    await waitFor(() => {
      expect(screen.getByTestId('base-tiptap-editor')).toBeInTheDocument();
    });
    
    fireEvent.keyDown(screen.getByTestId('base-tiptap-editor'), {
      key: 'Enter',
    });
    
    expect(onSubmit).toHaveBeenCalled();
  });

  it('edit 모드에서 Enter 키로 onSubmit이 호출된다', async () => {
    const onSubmit = jest.fn();
    render(<CommentEditor {...defaultProps} mode="edit" onSubmit={onSubmit} />);
    
    await waitFor(() => {
      expect(screen.getByTestId('base-tiptap-editor')).toBeInTheDocument();
    });
    
    fireEvent.keyDown(screen.getByTestId('base-tiptap-editor'), {
      key: 'Enter',
    });
    
    expect(onSubmit).toHaveBeenCalled();
  });

  it('Shift+Enter 키 조합은 줄바꿈을 생성한다', async () => {
    const onSubmit = jest.fn();
    render(<CommentEditor {...defaultProps} onSubmit={onSubmit} />);
    
    await waitFor(() => {
      expect(screen.getByTestId('base-tiptap-editor')).toBeInTheDocument();
    });
    
    fireEvent.keyDown(screen.getByTestId('base-tiptap-editor'), {
      key: 'Enter',
      shiftKey: true,
    });
    
    // Shift+Enter는 onSubmit을 호출하지 않아야 함
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('edit 모드에서 Escape 키로 onCancel이 호출된다', async () => {
    const onCancel = jest.fn();
    render(<CommentEditor {...defaultProps} mode="edit" onCancel={onCancel} />);
    
    await waitFor(() => {
      expect(screen.getByTestId('base-tiptap-editor')).toBeInTheDocument();
    });
    
    fireEvent.keyDown(screen.getByTestId('base-tiptap-editor'), {
      key: 'Escape',
    });
    
    expect(onCancel).toHaveBeenCalled();
  });

  it('new 모드에서는 Escape 키가 무시된다', async () => {
    const onCancel = jest.fn();
    render(<CommentEditor {...defaultProps} mode="new" onCancel={onCancel} />);
    
    await waitFor(() => {
      expect(screen.getByTestId('base-tiptap-editor')).toBeInTheDocument();
    });
    
    fireEvent.keyDown(screen.getByTestId('base-tiptap-editor'), {
      key: 'Escape',
    });
    
    expect(onCancel).not.toHaveBeenCalled();
  });

  it('이미지 업로드 기능이 활성화된 경우 이미지 붙여넣기가 처리된다', async () => {
    const imageUploadHook = { ...mockImageUploadHook };
    render(
      <CommentEditor 
        {...defaultProps} 
        enableImageUpload={true}
        imageUploadHook={imageUploadHook} 
      />
    );
    
    await waitFor(() => {
      expect(screen.getByTestId('base-tiptap-editor')).toBeInTheDocument();
    });
    
    const mockFile = new File(['test'], 'test.png', { type: 'image/png' });
    const mockClipboardData = {
      items: [{
        type: 'image/png',
        getAsFile: () => mockFile,
      }],
    };
    
    const pasteEvent = new ClipboardEvent('paste', {
      clipboardData: mockClipboardData as any,
    });
    
    fireEvent.paste(screen.getByTestId('base-tiptap-editor'), pasteEvent);
    
    expect(imageUploadHook.uploadImages).toHaveBeenCalledWith([mockFile]);
  });

  it('이미지 업로드 기능이 비활성화된 경우 이미지 붙여넣기가 처리되지 않는다', async () => {
    const imageUploadHook = { ...mockImageUploadHook };
    render(
      <CommentEditor 
        {...defaultProps} 
        enableImageUpload={false}
        imageUploadHook={imageUploadHook} 
      />
    );
    
    await waitFor(() => {
      expect(screen.getByTestId('base-tiptap-editor')).toBeInTheDocument();
    });
    
    const mockFile = new File(['test'], 'test.png', { type: 'image/png' });
    const mockClipboardData = {
      items: [{
        type: 'image/png',
        getAsFile: () => mockFile,
      }],
    };
    
    const pasteEvent = new ClipboardEvent('paste', {
      clipboardData: mockClipboardData as any,
    });
    
    fireEvent.paste(screen.getByTestId('base-tiptap-editor'), pasteEvent);
    
    expect(imageUploadHook.uploadImages).not.toHaveBeenCalled();
  });

  it('동적 높이 조절 스타일이 적용된다', async () => {
    render(<CommentEditor {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByTestId('base-tiptap-editor')).toBeInTheDocument();
    });
    
    const editor = screen.getByTestId('base-tiptap-editor');
    const container = editor.closest('div');
    
    // min-height와 max-height가 설정되어 있는지 확인
    expect(container?.className).toContain('min-h-');
    expect(container?.className).toContain('max-h-');
  });
});