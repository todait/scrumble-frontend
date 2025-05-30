'use client';

import { Check } from 'lucide-react';
import React from 'react';

interface SuccessNotificationProps {
  show: boolean;
  title: string;
  message: string;
}

export const SuccessNotification: React.FC<SuccessNotificationProps> = ({ 
  show, 
  title, 
  message 
}) => {
  return (
    <div className={`absolute top-[50px] left-[80px] 
                    bg-white border border-[rgba(65,168,0,0.2)] rounded-lg
                    px-5 py-4 shadow-sm transition-all duration-300
                    ${show ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}`}
         style={{ backgroundColor: 'rgba(99, 255, 0, 0.05)' }}
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="w-5 h-5 bg-[#41A800] rounded-full flex items-center justify-center">
          <Check className="w-3 h-3 text-white" strokeWidth={3} />
        </div>
        <h3 className="text-[16px] font-bold text-[#41A800] font-pretendard">
          {title}
        </h3>
      </div>
      <p className="text-[15px] text-[#41A800] font-pretendard">
        {message}
      </p>
    </div>
  );
};