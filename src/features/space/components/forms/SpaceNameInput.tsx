'use client';

import React, { useState, useEffect } from 'react';
import { z } from 'zod';

import { spaceNameSchema } from '@/schemas';

interface SpaceNameInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  showValidation?: boolean;
}

export const SpaceNameInput: React.FC<SpaceNameInputProps> = ({ 
  value, 
  onChange, 
  disabled = false,
  showValidation = true
}) => {
  const [error, setError] = useState<string>('');
  const [touched, setTouched] = useState(false);

  // 실시간 validation
  useEffect(() => {
    if (!showValidation || !touched) return;

    try {
      spaceNameSchema.parse({ name: value });
      setError('');
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0]?.message || '유효하지 않은 이름입니다');
      }
    }
  }, [value, touched, showValidation]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    
    if (!touched) {
      setTouched(true);
    }
  };

  const handleBlur = () => {
    setTouched(true);
  };

  const hasError = showValidation && touched && error;

  return (
    <div className="w-full">
      <input
        type="text"
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="워크스페이스 이름"
        disabled={disabled}
        className={`w-full max-w-[480px] h-[54px] px-4 text-[16px] font-pretendard text-[#222222] placeholder:text-[#222222]/30 bg-white border rounded-[12px] outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
                     hasError
                       ? 'border-red-500 focus:border-red-500'
                       : 'border-[#1D1D1F]/10 focus:border-[#FF7800]'
                   }`}
        autoFocus
      />
      {hasError && (
        <p className="mt-2 text-sm text-red-500 font-pretendard">
          {error}
        </p>
      )}
    </div>
  );
}; 