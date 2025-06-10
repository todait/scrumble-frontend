'use client';

import { useEffect, useState } from 'react';

interface SimpleToastProps {
  message: string;
  actionText?: string;
  onAction?: () => void;
  duration?: number;
  onClose: () => void;
}

export function SimpleToast({ message, actionText, onAction, duration = 3000, onClose }: SimpleToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 마운트 시 애니메이션 시작
    const showTimer = setTimeout(() => setIsVisible(true), 10);
    
    // 지정된 시간 후 사라지기 시작
    const hideTimer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // 애니메이션 완료 후 제거
    }, duration);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [duration, onClose]);

  return (
    <div
      className={`fixed bottom-[30px] left-1/2 z-50 flex h-9 -translate-x-1/2 transform items-center gap-[10px] rounded-lg bg-[#222222] px-4 transition-all duration-300 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
      }`}
    >
      <span className="text-[13px] text-white">{message}</span>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="text-[13px] font-bold text-white hover:opacity-80"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}