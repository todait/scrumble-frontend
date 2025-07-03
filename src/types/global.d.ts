declare module '*.css';

// Minimal types for @remixicon/react icons
// The actual library provides React components for SVG icons.
// We declare them as generic React components accepting `className` prop.
declare module '@remixicon/react' {
  import * as React from 'react';

  export interface IconProps extends React.SVGProps<SVGSVGElement> {
    size?: string | number;
    color?: string;
    className?: string;
  }

  // Enumerate icons actually used in the codebase
  export const RiHeart3Fill: React.FC<IconProps>;
  export const RiHeart3Line: React.FC<IconProps>;
  export const RiUser6Fill: React.FC<IconProps>;
  export const RiUser6Line: React.FC<IconProps>;
  export const RiBarChartFill: React.FC<IconProps>;
  export const RiBarChartLine: React.FC<IconProps>;
  export const RiPokerClubsFill: React.FC<IconProps>;
  export const RiPokerDiamondsFill: React.FC<IconProps>;
  export const RiCloseLine: React.FC<IconProps>;
  export const RiQuestionLine: React.FC<IconProps>;
  export const RiCalendarFill: React.FC<IconProps>;
  export const RiImageLine: React.FC<IconProps>;
  export const RiSendPlaneFill: React.FC<IconProps>;
  export const RiArrowRightSLine: React.FC<IconProps>;
  export const RiArrowLeftSLine: React.FC<IconProps>;
  export const RiArrowDownSFill: React.FC<IconProps>;
  export const RiArrowDownSLine: React.FC<IconProps>;
  export const RiArrowRightLine: React.FC<IconProps>;
  export const RiSkipUpLine: React.FC<IconProps>;
  export const RiSettings6Line: React.FC<IconProps>;
  export const RiSettings6Fill: React.FC<IconProps>;
  export const RiHome5Fill: React.FC<IconProps>;
  export const RiHome5Line: React.FC<IconProps>;
  export const RiPencilFill: React.FC<IconProps>;
  export const RiPencilLine: React.FC<IconProps>;
  export const RiFeedbackLine: React.FC<IconProps>;
  export const RiLogoutBoxLine: React.FC<IconProps>;
  export const RiTeamLine: React.FC<IconProps>;
  export const RiEmojiStickerLine: React.FC<IconProps>;
  export const RiEdit2Line: React.FC<IconProps>;
  export const RiMore2Line: React.FC<IconProps>;
  export const RiDeleteBinLine: React.FC<IconProps>;
  export const RiFlashlightFill: React.FC<IconProps>;
  export const RiCheckLine: React.FC<IconProps>;

  // Fallback for any other icon
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const UnknownIcon: any;
}
