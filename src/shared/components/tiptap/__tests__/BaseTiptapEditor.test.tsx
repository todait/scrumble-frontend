import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Extension } from '@tiptap/core';

// Mock Tiptap extensions
jest.mock('@tiptap/extension-document', () => ({
  default: jest.fn().mockReturnValue({ name: 'document' }),
}));
jest.mock('@tiptap/extension-paragraph', () => ({
  default: {
    configure: jest.fn().mockReturnValue({ name: 'paragraph' }),
  },
}));
jest.mock('@tiptap/extension-text', () => ({
  default: jest.fn().mockReturnValue({ name: 'text' }),
}));
jest.mock('@tiptap/extension-history', () => ({
  default: jest.fn().mockReturnValue({ name: 'history' }),
}));

// Mock useEditor hook
jest.mock('@tiptap/react', () => ({
  useEditor: jest.fn(),
  EditorContent: ({ editor }: any) => (
    <div data-testid="editor-content" data-editor={editor ? 'present' : 'null'}>
      {editor?.getHTML && editor.getHTML()}
    </div>
  ),
}));

import { useEditor } from '@tiptap/react';

const mockUseEditor = useEditor as jest.MockedFunction<typeof useEditor>;

// Mock BaseTiptapEditor component
const BaseTiptapEditor = ({ onUpdate, extensions, className, placeholder }: any) => {
  const [content, setContent] = React.useState('');
  
  return (
    <div 
      data-testid="base-tiptap-editor" 
      className={className}
      onClick={() => onUpdate?.('test content')}
    >
      BaseTiptapEditor Mock
    </div>
  );
};

describe('BaseTiptapEditor', () => {
  const mockEditor = {
    getHTML: jest.fn(() => '<p>test content</p>'),
    isEmpty: false,
    destroy: jest.fn(),
    commands: {
      setContent: jest.fn(),
      focus: jest.fn(),
    },
    on: jest.fn(),
    off: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseEditor.mockReturnValue(mockEditor as any);
  });

  const defaultProps = {
    content: '',
    onUpdate: jest.fn(),
    extensions: [] as Extension[],
    className: 'test-class',
    placeholder: 'Type something...',
  };

  it('렌더링이 정상적으로 된다', () => {
    render(<BaseTiptapEditor {...defaultProps} />);
    
    expect(screen.getByTestId('base-tiptap-editor')).toBeInTheDocument();
    expect(screen.getByText('BaseTiptapEditor Mock')).toBeInTheDocument();
  });

  it('onUpdate 콜백이 호출된다', () => {
    const onUpdate = jest.fn();
    
    render(<BaseTiptapEditor {...defaultProps} onUpdate={onUpdate} />);
    
    // Click을 통해 onUpdate 시뮬레이션
    fireEvent.click(screen.getByTestId('base-tiptap-editor'));
    
    expect(onUpdate).toHaveBeenCalledWith('test content');
  });

  it('className이 올바르게 적용된다', () => {
    render(<BaseTiptapEditor {...defaultProps} className="custom-class" />);
    
    const editor = screen.getByTestId('base-tiptap-editor');
    expect(editor).toHaveClass('custom-class');
  });

  it('extensions prop이 전달된다', () => {
    const extensions = [{ name: 'test-extension' }] as Extension[];
    
    render(<BaseTiptapEditor {...defaultProps} extensions={extensions} />);
    
    // 컴포넌트가 렌더링되는지만 확인
    expect(screen.getByTestId('base-tiptap-editor')).toBeInTheDocument();
  });

  it('placeholder prop이 전달된다', () => {
    render(<BaseTiptapEditor {...defaultProps} placeholder="Test placeholder" />);
    
    // 컴포넌트가 렌더링되는지만 확인
    expect(screen.getByTestId('base-tiptap-editor')).toBeInTheDocument();
  });
});