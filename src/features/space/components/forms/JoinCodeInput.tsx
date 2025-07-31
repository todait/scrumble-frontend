'use client';

import React from 'react';

interface JoinCodeInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export const JoinCodeInput: React.FC<JoinCodeInputProps> = ({ value, onChange, disabled }) => {
  return (
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      disabled={disabled}
      placeholder="l000000"
      className="w-full max-w-[480px] h-[54px] px-4 text-[16px] font-pretendard text-[#222222] placeholder:text-[#222222]/30 bg-white border border-[#1D1D1F]/10 rounded-[12px] outline-none focus:border-[#FF7800] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    />
  );
};