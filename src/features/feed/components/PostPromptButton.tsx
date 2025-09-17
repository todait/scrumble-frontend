import { convertToKoreanOrder } from '@/shared/utils';
import { RiPokerClubsFill, RiPokerDiamondsFill } from '@remixicon/react';

interface PostPromptButtonProps {
  type: 'checkin' | 'checkout';
  onClick: () => void;
  order?: number;
  totalMembers?: number;
}

export function PostPromptButton({ type, onClick, order, totalMembers }: PostPromptButtonProps) {
  const isCheckin = type === 'checkin';
  const borderColor = 'rgba(151,71,255,0.5)';
  const hoverBgColor = 'rgba(151,71,255,0.05)';
  const iconColor = '#9747FF';
  const highlightColor = '#9747FF';
  const typeLabel = isCheckin ? '체크인' : '체크아웃';
  const typeLabelWithParticle = `${typeLabel}을`;

  const effectiveTotalMembers =
    typeof totalMembers === 'number' && totalMembers > 0 ? totalMembers : undefined;
  const isSoloMember = effectiveTotalMembers === 1;

  let effectiveOrder: number | undefined;
  if (typeof order === 'number' && order > 0) {
    effectiveOrder = order;
    if (effectiveTotalMembers) {
      effectiveOrder = Math.min(effectiveOrder, effectiveTotalMembers);
    }
  }

  const shouldShowOrder = !!effectiveOrder && !isSoloMember;
  const isLastOrder =
    shouldShowOrder && effectiveTotalMembers ? effectiveOrder === effectiveTotalMembers : false;

  let highlightText: string | null = null;
  if (shouldShowOrder && effectiveOrder) {
    if (isLastOrder) {
      highlightText = '마지막으로';
    } else {
      const baseOrderText = convertToKoreanOrder(effectiveOrder) || String(effectiveOrder);
      highlightText = `${baseOrderText}번째로`;
    }
  }

  const actionSentence = `${typeLabelWithParticle} 작성해보세요.`;
  const promptMessage = highlightText ? (
    <>
      오늘{' '}
      <span style={{ color: highlightColor }}>{highlightText}</span>{' '}
      {actionSentence}
    </>
  ) : (
    <>오늘 {actionSentence}</>
  );

  return (
    <div className="border-b border-[rgba(29,29,31,0.08)] bg-white px-5 py-5 md:px-[30px] md:py-[20px]">
      <button
        onClick={onClick}
        className="flex h-12 w-full items-center justify-center gap-1 rounded-xl border bg-white transition-all"
        style={{
          borderColor,
        }}
        onMouseEnter={e => {
          e.currentTarget.style.backgroundColor = hoverBgColor;
        }}
        onMouseLeave={e => {
          e.currentTarget.style.backgroundColor = 'white';
        }}
      >
        {isCheckin ? (
          <RiPokerClubsFill className="h-4 w-4" style={{ color: iconColor }} />
        ) : (
          <RiPokerDiamondsFill className="h-4 w-4" style={{ color: iconColor }} />
        )}
        <span className="text-center text-[15px] font-medium leading-[120%] text-[#1D1D1F]">
          {promptMessage}
        </span>
      </button>
    </div>
  );
}
