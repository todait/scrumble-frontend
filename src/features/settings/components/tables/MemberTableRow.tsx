'use client';

import { Checkbox } from '@/shared/components/ui';
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
          <Checkbox
            checked={isSelected}
            onChange={onToggleSelected}
            size={15}
            ariaLabel={`멤버 ${member.name} 선택`}
          />
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
