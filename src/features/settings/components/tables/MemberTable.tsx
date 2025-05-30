'use client';

import React, { useState } from 'react';
import { MoreVertical, Copy } from 'lucide-react';
import Image from 'next/image';

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
  onMemberAction 
}) => {
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

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

  return (
    <div className="w-full">
      <table className="w-full">
        <thead>
          <tr className="border-b border-[rgba(24,24,24,0.08)]">
            <th className="text-left p-[10px] w-20 text-[15px] font-normal text-[#181818] opacity-50">
              상태
            </th>
            <th className="text-left p-[10px] w-[180px] text-[15px] font-normal text-[#181818] opacity-50">
              이름
            </th>
            <th className="text-left p-[10px] w-[180px] text-[15px] font-normal text-[#181818] opacity-50">
              @표시되는 이름
            </th>
            <th className="text-left p-[10px] w-20 text-[15px] font-normal text-[#181818] opacity-50">
              역할
            </th>
            <th className="text-left p-[10px] w-[240px] text-[15px] font-normal text-[#181818] opacity-50">
              최근 활동
            </th>
            <th className="text-left p-[10px] w-[180px] text-[15px] font-normal text-[#181818] opacity-50">
              이메일
            </th>
            <th className="text-left p-[10px] w-[180px] text-[15px] font-normal text-[#181818] opacity-50">
              초대 날짜
            </th>
            <th className="text-left p-[10px] w-20 text-[15px] font-normal text-[#181818] opacity-50">
              관리
            </th>
          </tr>
        </thead>
        <tbody>
          {members.map((member) => (
            <tr 
              key={member.id}
              className={`
                border-t border-[rgba(24,24,24,0.08)] h-[50px]
                ${hoveredRow === member.id ? 'bg-[rgba(24,24,24,0.04)]' : ''}
              `}
              onMouseEnter={() => setHoveredRow(member.id)}
              onMouseLeave={() => setHoveredRow(null)}
            >
              {/* 상태 */}
              <td className="px-[10px] py-0">
                <div className="flex justify-center items-center gap-[10px] h-[50px]">
                  <div className="relative w-9 h-9">
                    <div 
                      className={`w-9 h-9 rounded-full bg-cover bg-center ${!member.isActive ? 'opacity-60' : ''}`}
                      style={getAvatarBackground(member)}
                    />
                    <div 
                      className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                        member.isActive ? 'bg-[#41A800]' : 'bg-[#DDDDDD]'
                      }`}
                    />
                  </div>
                </div>
              </td>

              {/* 이름 */}
              <td className="p-[10px]">
                <span className="text-[15px] font-normal text-[#181818]">
                  {member.name}
                </span>
              </td>

              {/* 표시되는 이름 */}
              <td className="p-[10px]">
                <span className="text-[15px] font-normal text-[#181818]">
                  {member.displayName}
                </span>
              </td>

              {/* 역할 */}
              <td className="p-[10px]">
                <span className="text-[15px] font-normal text-[#181818]">
                  {member.role}
                </span>
              </td>

              {/* 최근 활동 */}
              <td className="p-[10px]">
                <span className="text-[15px] font-normal text-[#181818]">
                  {member.lastActivity}
                </span>
              </td>

              {/* 이메일 */}
              <td className="p-[10px]">
                <div className="flex items-center justify-between group">
                  <span 
                    className={`text-[15px] font-normal text-[#181818] ${
                      hoveredRow === member.id ? 'cursor-pointer' : ''
                    }`}
                  >
                    {member.email}
                  </span>
                  {hoveredRow === member.id && (
                    <button
                      onClick={() => handleCopyEmail(member.email)}
                      className="p-[2px] rounded hover:bg-[rgba(221,221,221,0.8)] transition-colors"
                      title="이메일 복사"
                    >
                      <Copy className="w-4 h-4 text-[rgba(24,24,24,0.5)]" />
                    </button>
                  )}
                </div>
              </td>

              {/* 초대 날짜 */}
              <td className="p-[10px]">
                <span className="text-[15px] font-normal text-[#181818]">
                  {member.invitedAt}
                </span>
              </td>

              {/* 관리 */}
              <td className="p-[10px]">
                <div className="flex justify-center">
                  <button
                    onClick={() => onMemberAction?.(member.id, 'menu')}
                    className="p-[2px] rounded hover:bg-[rgba(221,221,221,0.4)] transition-colors"
                  >
                    <MoreVertical className="w-4 h-4 text-[rgba(24,24,24,0.5)]" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}; 