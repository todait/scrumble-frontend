'use client';

import { useAuth } from '@/shared/contexts';
import { useSpace } from '@/shared/hooks/queries/useSpaces';
import { RiAddLine, RiSearchLine } from '@remixicon/react';
import { useMemo, useState } from 'react';
import { MemberTableRow } from '../components/tables/MemberTableRow';

interface TableMember {
  id: string;
  name: string;
  email?: string;
  role: string;
  lastSeen?: string;
  joinedAt?: string;
  isInvited?: boolean;
  avatarURL?: string;
}

function mapRoleToKorean(role: string): string {
  switch (role) {
    case 'owner':
      return '소유자';
    case 'admin':
      return '관리자';
    default:
      return '멤버';
  }
}

function formatJoined(date?: string) {
  if (!date) return '—';
  return date.substring(0, 10);
}

// 현재 스페이스의 실제 멤버 목록을 사용

export default function MemberSettingsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const { currentSpaceSlug } = useAuth();
  const { data: spaceData } = useSpace({
    spaceSlug: currentSpaceSlug ?? '',
    enabled: !!currentSpaceSlug,
  });

  const tableMembers: TableMember[] = useMemo(() => {
    const membersFromSpace = (spaceData?.space?.members ??
      []) as import('@/shared/types/space').SpaceMember[];
    return membersFromSpace.map(m => ({
      id: m.id,
      name: m.name,
      role: m.role,
      avatarURL: m.avatarURL,
      joinedAt: m.joinedAt,
    }));
  }, [spaceData?.space?.members]);

  // debug removed

  const filteredMembers = tableMembers.filter(member => {
    const q = searchQuery.toLowerCase();
    return (
      member.name.toLowerCase().includes(q) ||
      (member.email ? member.email.toLowerCase().includes(q) : false)
    );
  });

  // 선택 상태 관리
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);

  const isAllVisibleSelected =
    filteredMembers.length > 0 && filteredMembers.every(m => selectedMemberIds.includes(m.id));

  const handleToggleSelectAll = () => {
    if (isAllVisibleSelected) {
      // 현재 보이는 멤버들만 선택 해제, 기존에 선택된 다른 멤버는 유지
      const visibleIds = new Set(filteredMembers.map(m => m.id));
      setSelectedMemberIds(prev => prev.filter(id => !visibleIds.has(id)));
    } else {
      // 현재 보이는 멤버들을 모두 선택 목록에 추가 (중복 방지)
      const next = new Set(selectedMemberIds);
      for (const m of filteredMembers) next.add(m.id);
      setSelectedMemberIds(Array.from(next));
    }
  };

  const handleToggleSelectOne = (memberId: string, checked: boolean) => {
    setSelectedMemberIds(prev => {
      const next = new Set(prev);
      if (checked) next.add(memberId);
      else next.delete(memberId);
      return Array.from(next);
    });
  };

  return (
    <div className="p-10">
      {/* 헤더 */}
      <div className="mb-10">
        <div className="rounded-[16px] bg-[#FAFAFA] p-4 md:p-5">
          <div className="mb-4 flex items-center justify-between md:mb-5">
            <h1 className="text-[20px] font-bold text-[#1D1D1F]">전체 {tableMembers.length}명</h1>
          </div>

          {/* 검색 및 초대하기 */}
          <div className="relative w-full">
            <RiSearchLine className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#1D1D1F]" />
            <input
              type="text"
              placeholder="멤버를 검색하거나 초대하세요"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="h-[56px] w-full rounded-[10px] border border-[#1D1D1F]/10 bg-white py-[10px] pl-12 pr-[125px] text-[15px] text-[#1D1D1F] placeholder:text-[15px] placeholder:text-[#1D1D1F]/20 focus:border-[#9747FF] focus:outline-none focus:ring-0"
            />
            <button className="absolute right-[10px] top-1/2 flex h-[36px] w-[105px] -translate-y-1/2 items-center justify-center gap-2 rounded-[10px] bg-[#D1D1D6] text-white transition-colors hover:bg-[#C1C1C6]">
              <RiAddLine className="h-4 w-4" />
              <span className="text-[13px] font-medium">초대하기</span>
            </button>
          </div>
        </div>
      </div>

      {/* 멤버 테이블 */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[rgba(24,24,24,0.08)]">
              <th className="p-[10px] text-left">
                <div className="flex items-center justify-center">
                  <label className="relative inline-flex h-[15px] w-[15px] items-center justify-center">
                    <input
                      type="checkbox"
                      checked={isAllVisibleSelected}
                      onChange={handleToggleSelectAll}
                      className="peer h-[15px] w-[15px] appearance-none border-2 border-[#1D1D1F]/20 checked:border-[#9747FF] checked:bg-[#9747FF]"
                    />
                    <svg
                      viewBox="0 0 12 10"
                      className="pointer-events-none absolute left-1/2 top-1/2 mt-px -translate-x-1/2 -translate-y-1/2 opacity-0 peer-checked:opacity-100"
                      width="10"
                      height="8"
                    >
                      <path
                        d="M10.3 1.3L4.5 7.1 1.7 4.3"
                        stroke="white"
                        strokeWidth="2"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </label>
                </div>
              </th>
              <th className="p-[10px] text-left text-[12px] font-bold text-[#6E6E73]">이름</th>
              <th className="p-[10px] text-left text-[12px] font-bold text-[#6E6E73]">이메일</th>
              <th className="p-[10px] text-left text-[12px] font-bold text-[#6E6E73]">역할</th>
              <th className="p-[10px] text-left text-[12px] font-bold text-[#6E6E73]">시작 날짜</th>
              <th className="p-[10px] text-left text-[12px] font-bold text-[#6E6E73]">관리</th>
            </tr>
          </thead>
          <tbody>
            {filteredMembers.map(member => (
              <MemberTableRow
                key={member.id}
                member={member}
                isSelected={selectedMemberIds.includes(member.id)}
                onToggleSelected={(checked: boolean) => handleToggleSelectOne(member.id, checked)}
                mapRoleToKorean={mapRoleToKorean}
                formatJoined={formatJoined}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
