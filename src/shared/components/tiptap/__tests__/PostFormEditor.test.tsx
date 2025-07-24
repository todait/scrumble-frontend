import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PostFormEditor } from '../components/PostFormEditor';
import type { ImageUploadHook } from '../tiptap.types';

// Mock the extension loaders
jest.mock('../extensions/post-form-extensions', () => ({
  loadPostFormExtensions: jest.fn().mockResolvedValue([]),
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

describe('PostFormEditor', () => {
  const defaultProps = {
    content: '',
    onUpdate: jest.fn(),
    onSubmit: jest.fn(),
    placeholder: 'What\'s on your mind?',
    imageUploadHook: mockImageUploadHook,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('렌더링이 정상적으로 된다', async () => {
    render(<PostFormEditor {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByTestId('base-tiptap-editor')).toBeInTheDocument();
    });
  });

  it('content 업데이트 시 onUpdate 콜백이 호출된다', async () => {
    const onUpdate = jest.fn();
    render(<PostFormEditor {...defaultProps} onUpdate={onUpdate} />);
    
    await waitFor(() => {
      expect(screen.getByTestId('base-tiptap-editor')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByTestId('base-tiptap-editor'));
    
    expect(onUpdate).toHaveBeenCalledWith('test content');
  });

  it('Cmd+Enter 키 조합으로 onSubmit이 호출된다', async () => {
    const onSubmit = jest.fn();
    render(<PostFormEditor {...defaultProps} onSubmit={onSubmit} />);
    
    await waitFor(() => {
      expect(screen.getByTestId('base-tiptap-editor')).toBeInTheDocument();
    });
    
    fireEvent.keyDown(screen.getByTestId('base-tiptap-editor'), {
      key: 'Enter',
      metaKey: true,
    });
    
    expect(onSubmit).toHaveBeenCalled();
  });

  it('Ctrl+Enter 키 조합으로 onSubmit이 호출된다', async () => {
    const onSubmit = jest.fn();
    render(<PostFormEditor {...defaultProps} onSubmit={onSubmit} />);
    
    await waitFor(() => {
      expect(screen.getByTestId('base-tiptap-editor')).toBeInTheDocument();
    });
    
    fireEvent.keyDown(screen.getByTestId('base-tiptap-editor'), {
      key: 'Enter',
      ctrlKey: true,
    });
    
    expect(onSubmit).toHaveBeenCalled();
  });

  it('이미지 붙여넣기 시 imageUploadHook.uploadImages가 호출된다', async () => {
    const imageUploadHook = { ...mockImageUploadHook };
    render(<PostFormEditor {...defaultProps} imageUploadHook={imageUploadHook} />);
    
    await waitFor(() => {
      expect(screen.getByTestId('base-tiptap-editor')).toBeInTheDocument();
    });
    
    // Mock clipboard data with image
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

  it('텍스트 붙여넣기는 정상적으로 처리된다', async () => {
    render(<PostFormEditor {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByTestId('base-tiptap-editor')).toBeInTheDocument();
    });
    
    const mockClipboardData = {
      items: [{
        type: 'text/plain',
        getAsFile: () => null,
      }],
    };
    
    const pasteEvent = new ClipboardEvent('paste', {
      clipboardData: mockClipboardData as any,
    });
    
    fireEvent.paste(screen.getByTestId('base-tiptap-editor'), pasteEvent);
    
    // 이미지 업로드가 호출되지 않았는지 확인
    expect(mockImageUploadHook.uploadImages).not.toHaveBeenCalled();
  });

  it('imageUploadHook이 없으면 이미지 붙여넣기가 처리되지 않는다', async () => {
    render(<PostFormEditor {...defaultProps} imageUploadHook={undefined} />);
    
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
    
    // 에러가 발생하지 않아야 함
    expect(screen.getByTestId('base-tiptap-editor')).toBeInTheDocument();
  });

  it('고정 높이 240px 스타일이 적용된다', async () => {
    render(<PostFormEditor {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByTestId('base-tiptap-editor')).toBeInTheDocument();
    });
    
    const editor = screen.getByTestId('base-tiptap-editor');
    const container = editor.closest('div');
    
    expect(container).toHaveStyle('height: 240px');
  });
});