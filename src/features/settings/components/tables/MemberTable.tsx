'use client';

import { Copy, MoreVertical } from 'lucide-react';
import React, { useRef, useState } from 'react';

import { MemberDropdownMenu } from '../ui/MemberDropdownMenu';

export interface Member {
  id: string;
  name: string;
  displayName: string;
  email: string;
  role: '멤버' | '관리자';
  isActive: boolean;
  lastActivity: string;
  invitedAt: string;
  avatarUrl?: string;
  avatarColor?: string;
}

interface MemberTableProps {
  members: Member[];
  onCopyEmail?: (email: string) => void;
  onMemberAction?: (memberId: string, action: string) => void;
}

export const MemberTable: React.FC<MemberTableProps> = ({
  members,
  onCopyEmail,
  onMemberAction,
}) => {
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const buttonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  const handleCopyEmail = async (email: string) => {
    try {
      await navigator.clipboard.writeText(email);
      onCopyEmail?.(email);
    } catch (error) {
      console.error('Failed to copy email:', error);
    }
  };

  const getAvatarBackground = (member: Member) => {
    if (member.avatarUrl) {
      return { backgroundImage: `url(${member.avatarUrl})` };
    }
    return { backgroundColor: member.avatarColor || '#9747FF' };
  };

  const handleMenuToggle = (memberId: string, event: React.MouseEvent) => {
    event.stopPropagation();

    if (openMenuId === memberId) {
      setOpenMenuId(null);
      return;
    }

    const button = buttonRefs.current[memberId];
    if (button) {
      const rect = button.getBoundingClientRect();
      const newPosition = {
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX - 80,
      };

      setMenuPosition(newPosition);
    }

    setOpenMenuId(memberId);
  };

  const handleDeleteMember = (memberId: string, memberName: string) => {
    console.log('멤버 삭제:', { memberId, memberName });
    // TODO: 실제 삭제 API 호출
  };

  return (
    <div className="relative w-full">
      <table className="w-full">
        <thead>
          <tr className="border-b border-[rgba(24,24,24,0.08)]">
            <th className="w-20 p-[10px] text-left text-sm font-normal text-[#181818] opacity-50">
              상태
            </th>
            <th className="w-[180px] p-[10px] text-left text-sm font-normal text-[#181818] opacity-50">
              이름
            </th>
            <th className="w-[180px] p-[10px] text-left text-sm font-normal text-[#181818] opacity-50">
              @표시되는 이름
            </th>
            <th className="w-20 p-[10px] text-left text-sm font-normal text-[#181818] opacity-50">
              역할
            </th>
            <th className="w-[240px] p-[10px] text-left text-sm font-normal text-[#181818] opacity-50">
              최근 활동
            </th>
            <th className="w-[180px] p-[10px] text-left text-sm font-normal text-[#181818] opacity-50">
              이메일
            </th>
            <th className="w-[180px] p-[10px] text-left text-sm font-normal text-[#181818] opacity-50">
              초대 날짜
            </th>
            <th className="w-20 p-[10px] text-left text-sm font-normal text-[#181818] opacity-50">
              관리
            </th>
          </tr>
        </thead>
        <tbody>
          {members.map(member => (
            <tr
              key={member.id}
              className={`h-[50px] border-t border-[rgba(24,24,24,0.08)] ${hoveredRow === member.id ? 'bg-[rgba(24,24,24,0.04)]' : ''} `}
              onMouseEnter={() => setHoveredRow(member.id)}
              onMouseLeave={() => setHoveredRow(null)}
            >
              {/* 상태 */}
              <td className="px-[10px] py-0">
                <div className="flex h-[50px] items-center justify-center gap-[10px]">
                  <div className="relative h-9 w-9">
                    <div
                      className={`h-9 w-9 rounded-full bg-cover bg-center ${!member.isActive ? 'opacity-60' : ''}`}
                      style={getAvatarBackground(member)}
                    />
                    <div
                      className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${
                        member.isActive ? 'bg-[#41A800]' : 'bg-[#DDDDDD]'
                      }`}
                    />
                  </div>
                </div>
              </td>

              {/* 이름 */}
              <td className="p-[10px]">
                <span className="text-sm font-normal text-[#181818]">{member.name}</span>
              </td>

              {/* 표시되는 이름 */}
              <td className="p-[10px]">
                <span className="text-sm font-normal text-[#181818]">{member.displayName}</span>
              </td>

              {/* 역할 */}
              <td className="p-[10px]">
                <span className="text-sm font-normal text-[#181818]">{member.role}</span>
              </td>

              {/* 최근 활동 */}
              <td className="p-[10px]">
                <span className="text-sm font-normal text-[#181818]">{member.lastActivity}</span>
              </td>

              {/* 이메일 */}
              <td className="p-[10px]">
                <div className="group flex items-center justify-between">
                  <span
                    className={`text-sm font-normal text-[#181818] ${
                      hoveredRow === member.id ? 'cursor-pointer' : ''
                    }`}
                  >
                    {member.email}
                  </span>
                  <button
                    onClick={() => handleCopyEmail(member.email)}
                    className={`rounded p-[2px] transition-all duration-200 hover:bg-[rgba(221,221,221,0.8)] ${
                      hoveredRow === member.id ? 'opacity-100' : 'opacity-0'
                    }`}
                    title="이메일 복사"
                  >
                    <Copy className="h-4 w-4 text-[rgba(24,24,24,0.5)]" />
                  </button>
                </div>
              </td>

              {/* 초대 날짜 */}
              <td className="p-[10px]">
                <span className="text-sm font-normal text-[#181818]">{member.invitedAt}</span>
              </td>

              {/* 관리 */}
              <td className="p-[10px]">
                <div className="flex justify-center">
                  <button
                    ref={el => {
                      buttonRefs.current[member.id] = el;
                    }}
                    onClick={e => handleMenuToggle(member.id, e)}
                    className="rounded p-[2px] transition-colors hover:bg-[rgba(221,221,221,0.4)]"
                  >
                    <MoreVertical className="h-4 w-4 text-[rgba(24,24,24,0.5)]" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 드롭다운 메뉴 */}
      {openMenuId && (
        <MemberDropdownMenu
          isOpen={true}
          onClose={() => setOpenMenuId(null)}
          onDelete={() => {
            const member = members.find(m => m.id === openMenuId);
            if (member) {
              handleDeleteMember(member.id, member.name);
            }
          }}
          memberName={members.find(m => m.id === openMenuId)?.name || ''}
          position={menuPosition}
        />
      )}
    </div>
  );
};
