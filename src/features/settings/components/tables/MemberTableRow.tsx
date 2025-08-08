'use client';

import { ProfileImage } from '@/shared/components/ui/ProfileImage';
import { RiMoreLine } from '@remixicon/react';

interface MemberRowData {
  id: string;
  name: string;
  email?: string;
  role: string;
  joinedAt?: string;
  avatarURL?: string;
}

interface MemberTableRowProps {
  member: MemberRowData;
  isSelected: boolean;
  onToggleSelected: (checked: boolean) => void;
  mapRoleToKorean: (role: string) => string;
  formatJoined: (date?: string) => string;
}

export function MemberTableRow({
  member,
  isSelected,
  onToggleSelected,
  mapRoleToKorean,
  formatJoined,
}: MemberTableRowProps) {
  const rowBaseClass = 'h-[50px]';
  const rowHoverClass = 'hover:bg-[rgba(151,71,255,0.04)]';
  const rowSelectedClass = 'bg-[rgba(151,71,255,0.04)]';

  return (
    <tr
      aria-selected={isSelected}
      className={`${rowBaseClass} ${isSelected ? rowSelectedClass : rowHoverClass}`}
    >
      <td className="p-[10px]">
        <div className="flex items-center justify-center">
          <label className="relative inline-flex h-[15px] w-[15px] items-center justify-center">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={e => onToggleSelected(e.target.checked)}
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
      </td>
      <td className="p-[10px]">
        <div className="flex items-center gap-3">
          <ProfileImage src={member.avatarURL} alt={member.name} size={32} variant="circle" />
          <span className="text-[14px] text-[#1D1D1F]">{member.name || '—'}</span>
        </div>
      </td>
      <td className="p-[10px]">
        <span className="text-[13px] text-[#1D1D1F]">{member.email ?? '—'}</span>
      </td>
      <td className="p-[10px]">
        <span className="text-[13px] text-[#1D1D1F]">{mapRoleToKorean(member.role)}</span>
      </td>
      <td className="p-[10px]">
        <span className="text-[13px] text-[#1D1D1F]">{formatJoined(member.joinedAt)}</span>
      </td>
      <td className="p-[10px]">
        <button className="rounded p-1 hover:bg-gray-100">
          <RiMoreLine className="h-5 w-5 text-[#6E6E73]" />
        </button>
      </td>
    </tr>
  );
}

export default MemberTableRow;
