import { X } from 'lucide-react';
import React from 'react';

interface EmailTagProps {
  email: string;
  onRemove: () => void;
}

export const EmailTag: React.FC<EmailTagProps> = ({ email, onRemove }) => {
  return (
    <div className="inline-flex items-center gap-1 px-1 py-1 bg-white/10 border border-black/20 rounded-lg font-pretendard">
      <span className="text-[18px] font-normal text-black/80">{email}</span>
      <button
        onClick={onRemove}
        className="flex items-center justify-center"
        type="button"
      >
        <X className="w-5 h-5 text-black/50" />
      </button>
    </div>
  );
}; 