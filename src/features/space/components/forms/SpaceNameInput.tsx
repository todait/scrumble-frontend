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
        className={`w-full max-w-[524px] min-h-[40px] px-3 py-2 bg-white border rounded-xl 
                   focus:outline-none focus:ring-1 
                   text-[#181818] text-base placeholder-[#181818] placeholder-opacity-20
                   disabled:opacity-50 disabled:cursor-not-allowed font-pretendard
                   transition-all duration-200 ${
                     hasError
                       ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                       : 'border-[rgba(24,24,24,0.2)] focus:ring-[#9747FF] focus:border-[#9747FF]'
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