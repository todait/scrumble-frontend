import { X } from 'lucide-react';
import React from 'react';

interface EmailTagProps {
  email: string;
  onRemove: () => void;
}

export const EmailTag: React.FC<EmailTagProps> = ({ email, onRemove }) => {
  return (
    <div className="inline-flex items-center gap-1 rounded-lg border border-black/20 bg-white/10 px-1 py-1 font-pretendard">
      <span className="text-[14px] font-normal text-black/80">{email}</span>
      <button onClick={onRemove} className="flex items-center justify-center" type="button">
        <X className="h-5 w-5 text-black/50" />
      </button>
    </div>
  );
};
