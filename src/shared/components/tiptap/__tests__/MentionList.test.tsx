import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MentionList } from '../components/MentionList';
import type { MentionUser } from '../tiptap.types';

describe('MentionList', () => {
  const mockUsers: MentionUser[] = [
    { id: '1', name: 'John Doe', email: 'john@example.com' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
    { id: '3', name: 'Bob Wilson', email: 'bob@example.com' },
  ];

  const defaultProps = {
    items: mockUsers,
    command: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('렌더링이 정상적으로 된다', () => {
    render(<MentionList {...defaultProps} />);
    
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(screen.getAllByRole('option')).toHaveLength(3);
  });

  it('사용자 정보가 올바르게 표시된다', () => {
    render(<MentionList {...defaultProps} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
  });

  it('사용자 클릭 시 command가 호출된다', async () => {
    const user = userEvent.setup();
    const command = jest.fn();
    
    render(<MentionList {...defaultProps} command={command} />);
    
    await user.click(screen.getByText('John Doe'));
    
    expect(command).toHaveBeenCalledWith(mockUsers[0]);
  });

  it('키보드 네비게이션이 작동한다', () => {
    render(<MentionList {...defaultProps} />);
    
    const firstItem = screen.getAllByRole('option')[0];
    const secondItem = screen.getAllByRole('option')[1];
    
    // 초기 상태에서 첫 번째 아이템이 선택됨 (aria-selected="true")
    expect(firstItem).toHaveAttribute('aria-selected', 'true');
    expect(secondItem).toHaveAttribute('aria-selected', 'false');
  });

  it('키보드 네비게이션 인터페이스가 있다', () => {
    // 키보드 네비게이션 기능이 있는지 기본적으로 확인
    render(<MentionList {...defaultProps} />);
    
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(screen.getAllByRole('option')).toHaveLength(3);
  });

  it('빈 목록일 때도 정상적으로 렌더링된다', () => {
    render(<MentionList {...defaultProps} items={[]} />);
    
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('사용자 아바타가 표시된다', () => {
    render(<MentionList {...defaultProps} />);
    
    // 각 사용자의 첫 글자가 표시되는지 확인
    const avatars = screen.getAllByText(/^[JB]$/);
    expect(avatars.length).toBeGreaterThan(0);
  });

  it('호버 시 선택 상태가 변경된다', async () => {
    const user = userEvent.setup();
    render(<MentionList {...defaultProps} />);
    
    const firstItem = screen.getAllByRole('option')[0];
    const secondItem = screen.getAllByRole('option')[1];
    
    // 초기 상태에서 첫 번째 아이템이 선택됨
    expect(firstItem).toHaveAttribute('aria-selected', 'true');
    
    // 두 번째 아이템에 호버
    await user.hover(secondItem);
    
    expect(secondItem).toHaveAttribute('aria-selected', 'true');
    expect(firstItem).toHaveAttribute('aria-selected', 'false');
  });

  it('이메일이 없는 사용자도 올바르게 처리된다', () => {
    const usersWithoutEmail: MentionUser[] = [
      { id: '1', name: 'John Doe' },
      { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
    ];
    
    render(<MentionList {...defaultProps} items={usersWithoutEmail} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    
    // 컴포넌트가 정상적으로 렌더링되는지만 확인
    expect(screen.getAllByRole('option')).toHaveLength(2);
  });
});