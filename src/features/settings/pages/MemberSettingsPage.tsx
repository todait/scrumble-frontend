'use client';

import { useState } from 'react';
import { RiMoreLine, RiSearchLine, RiAddLine } from '@remixicon/react';

interface Member {
  id: string;
  name: string;
  mention: string;
  email: string;
  role: string;
  lastSeen: string;
  joinedAt: string;
  isInvited?: boolean;
  avatarUrl?: string;
}

// 더미 데이터
const dummyMembers: Member[] = [
  {
    id: '1',
    name: '홍가은',
    mention: '@ Lawson',
    email: '14equal@two.seven',
    role: '멤버',
    lastSeen: '오전 10:49 (20시간 전)',
    joinedAt: '2025-03-20',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1',
  },
  {
    id: '2',
    name: '유진',
    mention: '@ Sainz',
    email: '2du@si.gi',
    role: '멤버',
    lastSeen: '오전 10:49 (20시간 전)',
    joinedAt: '2025-12-25',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2',
  },
  {
    id: '3',
    name: '이솔',
    mention: '@ Charles',
    email: '1hannom@scrum.com',
    role: '멤버',
    lastSeen: '오전 10:49 (20시간 전)',
    joinedAt: '2025-07-18',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3',
  },
  {
    id: '4',
    name: '배지우',
    mention: '@ Bortoleto',
    email: '5zinguh@sea.food',
    role: '멤버',
    lastSeen: '오전 10:49 (20시간 전)',
    joinedAt: '2025-05-25',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=4',
  },
  {
    id: '5',
    name: '이하진',
    mention: '@ Hamilton',
    email: '8bochae@za.zang',
    role: '멤버',
    lastSeen: '오전 10:49 (20시간 전)',
    joinedAt: '2025-02-29',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=5',
  },
  {
    id: '6',
    name: '주우재',
    mention: '@ Stroll',
    email: '11seven@nine.ten',
    role: '멤버',
    lastSeen: '오전 10:49 (20시간 전)',
    joinedAt: '2025-04-19',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=6',
  },
  {
    id: '7',
    name: '정태현',
    mention: '@ Alpine',
    email: '12si@door.close',
    role: '멤버',
    lastSeen: '오전 10:49 (20시간 전)',
    joinedAt: '2025-09-16',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=7',
  },
  {
    id: '8',
    name: '홍길동',
    mention: '@ gdhong',
    email: 'gildonghong@gmail.com',
    role: '멤버',
    lastSeen: '오전 10:49 (20시간 전)',
    joinedAt: '2025-06-03',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=8',
  },
];

const invitedMembers: Member[] = [
  {
    id: '9',
    name: '',
    mention: '@ —',
    email: '1hannom@num.com',
    role: '멤버',
    lastSeen: '(참여 대기 중)',
    joinedAt: '초대 완료',
    isInvited: true,
  },
  {
    id: '10',
    name: '',
    mention: '@ —',
    email: '2dusigi@num.com',
    role: '멤버',
    lastSeen: '(참여 대기 중)',
    joinedAt: '초대 완료',
    isInvited: true,
  },
  {
    id: '11',
    name: '',
    mention: '@ —',
    email: '3suksam@num.com',
    role: '멤버',
    lastSeen: '(참여 대기 중)',
    joinedAt: '초대 완료',
    isInvited: true,
  },
];

export default function MemberSettingsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [members] = useState<Member[]>([...dummyMembers, ...invitedMembers]);

  const filteredMembers = members.filter(member => 
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.mention.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-10">
      {/* 헤더 */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-[20px] font-bold text-[#1D1D1F]">
            전체 28명 <span className="text-[14px] font-normal text-[#86868B] ml-2">6월 31일 오전 11:48 기준</span>
          </h1>
        </div>

        {/* 검색 및 초대하기 */}
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <RiSearchLine className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#86868B]" />
            <input
              type="text"
              placeholder="멤버를 검색하거나 초대하세요"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-[10px] bg-[#F5F5F7] text-[14px] placeholder-[#86868B] focus:outline-none focus:ring-2 focus:ring-[#9747FF]/20"
            />
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-[#D1D1D6] text-white rounded-[10px] hover:bg-[#C1C1C6] transition-colors">
            <RiAddLine className="h-4 w-4" />
            <span className="text-[14px] font-medium">초대하기</span>
          </button>
        </div>
      </div>

      {/* 멤버 테이블 */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#F2F2F7]">
              <th className="text-left py-3 px-4">
                <input type="checkbox" className="rounded" />
              </th>
              <th className="text-left py-3 px-4 text-[12px] font-medium text-[#86868B]">이름</th>
              <th className="text-left py-3 px-4 text-[12px] font-medium text-[#86868B]">@멘션</th>
              <th className="text-left py-3 px-4 text-[12px] font-medium text-[#86868B]">이메일</th>
              <th className="text-left py-3 px-4 text-[12px] font-medium text-[#86868B]">역할</th>
              <th className="text-left py-3 px-4 text-[12px] font-medium text-[#86868B]">최근 활동</th>
              <th className="text-left py-3 px-4 text-[12px] font-medium text-[#86868B]">시작 날짜</th>
              <th className="text-left py-3 px-4 text-[12px] font-medium text-[#86868B]">관리</th>
            </tr>
          </thead>
          <tbody>
            {filteredMembers.map((member) => (
              <tr key={member.id} className="border-b border-[#F2F2F7] hover:bg-gray-50">
                <td className="py-4 px-4">
                  <input type="checkbox" className="rounded" />
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    {member.isInvited ? (
                      <div className="h-8 w-8 rounded-full bg-[#9747FF] flex items-center justify-center">
                        <span className="text-white text-[12px]">?</span>
                      </div>
                    ) : member.avatarUrl ? (
                      <img src={member.avatarUrl} alt={member.name} className="h-8 w-8 rounded-full" />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-gray-200" />
                    )}
                    <span className="text-[14px] text-[#1D1D1F]">{member.name || '—'}</span>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <span className="text-[13px] text-[#6E6E73]">{member.mention}</span>
                </td>
                <td className="py-4 px-4">
                  <span className="text-[13px] text-[#1D1D1F]">{member.email}</span>
                </td>
                <td className="py-4 px-4">
                  <span className="text-[13px] text-[#1D1D1F]">{member.role}</span>
                </td>
                <td className="py-4 px-4">
                  <span className="text-[13px] text-[#86868B]">{member.lastSeen}</span>
                </td>
                <td className="py-4 px-4">
                  <span className={`text-[13px] ${member.isInvited ? 'text-[#86868B]' : 'text-[#9747FF]'}`}>
                    {member.joinedAt}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <RiMoreLine className="h-5 w-5 text-[#6E6E73]" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}