import { RiPokerClubsFill } from '@remixicon/react';

interface PostPromptButtonProps {
  type: 'checkin' | 'checkout';
  onClick: () => void;
  orderText?: React.ReactNode;
}

export function PostPromptButton({ type, onClick, orderText }: PostPromptButtonProps) {
  const isCheckin = type === 'checkin';
  const borderColor = 'rgba(151,71,255,0.5)';
  const hoverBgColor = 'rgba(151,71,255,0.05)';
  const iconColor = '#9747FF';
  const highlightColor = '#9747FF';

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
        <RiPokerClubsFill className="h-4 w-4" style={{ color: iconColor }} />
        <span className="text-center text-[15px] font-medium leading-[120%] text-[#1D1D1F]">
          {isCheckin ? (
            orderText ? (
              <>
                오늘 <span style={{ color: highlightColor }}>{orderText}</span> 체크인을 남겨보세요
              </>
            ) : (
              '오늘 체크인을 남겨보세요'
            )
          ) : (
            '체크아웃을 남겨보세요'
          )}
        </span>
      </button>
    </div>
  );
}
