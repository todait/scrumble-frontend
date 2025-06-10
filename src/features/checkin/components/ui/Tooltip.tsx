'use client';

interface TooltipProps {
  text: string;
  show: boolean;
}

export const Tooltip = ({ text, show }: TooltipProps) => {
  if (!show) return null;

  return (
    <div className="absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 transform whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-white">
      {text}
      <div className="absolute left-1/2 top-full -translate-x-1/2 transform border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
    </div>
  );
};