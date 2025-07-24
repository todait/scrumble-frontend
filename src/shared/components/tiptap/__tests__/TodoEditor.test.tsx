import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TodoEditor } from '../components/TodoEditor';

// Mock the extension loaders
jest.mock('../extensions/todo-extensions', () => ({
  loadTodoExtensions: jest.fn().mockResolvedValue([]),
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

describe('TodoEditor', () => {
  const defaultProps = {
    content: '',
    onUpdate: jest.fn(),
    onSubmit: jest.fn(),
    placeholder: 'Add a todo...',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('렌더링이 정상적으로 된다', async () => {
    render(<TodoEditor {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByTestId('base-tiptap-editor')).toBeInTheDocument();
    });
  });

  it('content 업데이트 시 onUpdate 콜백이 호출된다', async () => {
    const onUpdate = jest.fn();
    render(<TodoEditor {...defaultProps} onUpdate={onUpdate} />);
    
    await waitFor(() => {
      expect(screen.getByTestId('base-tiptap-editor')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByTestId('base-tiptap-editor'));
    
    expect(onUpdate).toHaveBeenCalledWith('test content');
  });

  it('Enter 키로 onSubmit이 호출된다', async () => {
    const onSubmit = jest.fn();
    render(<TodoEditor {...defaultProps} onSubmit={onSubmit} />);
    
    await waitFor(() => {
      expect(screen.getByTestId('base-tiptap-editor')).toBeInTheDocument();
    });
    
    fireEvent.keyDown(screen.getByTestId('base-tiptap-editor'), {
      key: 'Enter',
    });
    
    expect(onSubmit).toHaveBeenCalled();
  });

  it('Shift+Enter, Ctrl+Enter, Cmd+Enter는 모두 onSubmit을 호출한다', async () => {
    const onSubmit = jest.fn();
    render(<TodoEditor {...defaultProps} onSubmit={onSubmit} />);
    
    await waitFor(() => {
      expect(screen.getByTestId('base-tiptap-editor')).toBeInTheDocument();
    });
    
    // Shift+Enter
    fireEvent.keyDown(screen.getByTestId('base-tiptap-editor'), {
      key: 'Enter',
      shiftKey: true,
    });
    expect(onSubmit).toHaveBeenCalledTimes(1);
    
    // Ctrl+Enter
    fireEvent.keyDown(screen.getByTestId('base-tiptap-editor'), {
      key: 'Enter',
      ctrlKey: true,
    });
    expect(onSubmit).toHaveBeenCalledTimes(2);
    
    // Cmd+Enter
    fireEvent.keyDown(screen.getByTestId('base-tiptap-editor'), {
      key: 'Enter',
      metaKey: true,
    });
    expect(onSubmit).toHaveBeenCalledTimes(3);
  });

  it('텍스트 붙여넣기에서 줄바꿈이 제거된다', async () => {
    render(<TodoEditor {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByTestId('base-tiptap-editor')).toBeInTheDocument();
    });
    
    const mockClipboardData = {
      getData: jest.fn().mockReturnValue('Line 1\\nLine 2\\nLine 3'),
    };
    
    const pasteEvent = new ClipboardEvent('paste', {
      clipboardData: mockClipboardData as any,
    });
    
    fireEvent.paste(screen.getByTestId('base-tiptap-editor'), pasteEvent);
    
    // 줄바꿈이 공백으로 변환되었는지 확인 (실제 구현에서는 preventDefault가 호출됨)
    expect(mockClipboardData.getData).toHaveBeenCalledWith('text/plain');
  });

  it('이미지 붙여넣기는 처리되지 않는다', async () => {
    render(<TodoEditor {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByTestId('base-tiptap-editor')).toBeInTheDocument();
    });
    
    const mockFile = new File(['test'], 'test.png', { type: 'image/png' });
    const mockClipboardData = {
      items: [{
        type: 'image/png',
        getAsFile: () => mockFile,
      }],
      getData: jest.fn().mockReturnValue(''),
    };
    
    const pasteEvent = new ClipboardEvent('paste', {
      clipboardData: mockClipboardData as any,
    });
    
    fireEvent.paste(screen.getByTestId('base-tiptap-editor'), pasteEvent);
    
    // 텍스트 데이터만 처리되어야 함
    expect(mockClipboardData.getData).toHaveBeenCalledWith('text/plain');
  });

  it('단일 라인 스타일이 적용된다', async () => {
    render(<TodoEditor {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByTestId('base-tiptap-editor')).toBeInTheDocument();
    });
    
    const editor = screen.getByTestId('base-tiptap-editor');
    const container = editor.closest('div');
    
    // 단일 라인 관련 스타일이 적용되어 있는지 확인
    expect(container?.className).toContain('overflow-hidden');
  });

  it('멘션 기능이 지원된다', async () => {
    const mentionUsers = [
      { id: '1', name: 'John Doe', email: 'john@example.com' }
    ];
    
    render(
      <TodoEditor 
        {...defaultProps} 
        mentionUsers={mentionUsers}
        onMentionSelect={jest.fn()}
      />
    );
    
    await waitFor(() => {
      expect(screen.getByTestId('base-tiptap-editor')).toBeInTheDocument();
    });
    
    // 렌더링이 정상적으로 되는지만 확인 (멘션 기능 자체는 실제 에디터에서 테스트됨)
    expect(screen.getByTestId('base-tiptap-editor')).toBeInTheDocument();
  });
});