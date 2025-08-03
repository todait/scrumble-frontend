'use client';

import React, { useCallback, useState } from 'react';

import { emailSchema } from '@/schemas';

import { EmailTag } from './EmailTag';

interface EmailTagInputProps {
  emails: string[];
  onEmailsChange: (emails: string[]) => void;
  onValidationError?: (hasError: boolean) => void;
}

export const EmailTagInput: React.FC<EmailTagInputProps> = ({
  emails,
  onEmailsChange,
  onValidationError,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // 이메일 유효성 검증
  const validateEmail = useCallback((email: string): boolean => {
    try {
      emailSchema.parse(email.trim());
      return true;
    } catch {
      return false;
    }
  }, []);

  // 에러 상태 설정
  const setError = useCallback(
    (message: string) => {
      setHasError(true);
      setErrorMessage(message);
      onValidationError?.(true);
    },
    [onValidationError]
  );

  // 에러 상태 클리어
  const clearError = useCallback(() => {
    setHasError(false);
    setErrorMessage('');
    onValidationError?.(false);
  }, [onValidationError]);

  // 이메일 추가
  const addEmail = useCallback(
    (email: string): boolean => {
      const trimmedEmail = email.trim();

      if (!trimmedEmail) {
        return false;
      }

      // 최대 개수 체크
      if (emails.length >= 10) {
        setError('최대 10개의 이메일까지 입력할 수 있습니다');
        return false;
      }

      // 이메일 형식 검증
      if (!validateEmail(trimmedEmail)) {
        setError('올바른 이메일 주소를 입력해주세요');
        return false;
      }

      // 중복 체크
      if (emails.includes(trimmedEmail)) {
        setError('이미 추가된 이메일입니다');
        return false;
      }

      // 이메일 추가
      onEmailsChange([...emails, trimmedEmail]);
      setInputValue('');
      clearError();
      return true;
    },
    [emails, validateEmail, setError, clearError, onEmailsChange]
  );

  // 이메일 제거
  const removeEmail = useCallback(
    (indexToRemove: number) => {
      const newEmails = emails.filter((_, index) => index !== indexToRemove);
      onEmailsChange(newEmails);
      if (hasError) {
        clearError();
      }
    },
    [emails, hasError, clearError, onEmailsChange]
  );

  // input 변경 핸들러
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;

      // 쉼표가 입력되면 이메일 추가
      if (value.includes(',')) {
        const emailToAdd = value.replace(',', '');
        addEmail(emailToAdd);
        return;
      }

      setInputValue(value);
      if (hasError) {
        clearError();
      }
    },
    [addEmail, hasError, clearError]
  );

  // 키다운 핸들러
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        addEmail(inputValue);
      } else if (e.key === 'Backspace' && !inputValue && emails.length > 0) {
        // 입력값이 없을 때 백스페이스로 마지막 태그 삭제
        removeEmail(emails.length - 1);
      }
    },
    [addEmail, removeEmail, inputValue, emails.length]
  );

  return (
    <div className="w-full">
      <div
        className={`flex min-h-[80px] w-full flex-wrap items-start gap-2 rounded-xl border bg-white px-4 py-3 font-pretendard ${
          hasError ? 'border-red-500' : 'border-[#9747FF]'
        }`}
      >
        {emails.map((email, index) => (
          <EmailTag key={index} email={email} onRemove={() => removeEmail(index)} />
        ))}
        <div className="flex min-h-[28px] min-w-[200px] flex-1 items-center">
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={emails.length === 0 ? '이메일을 입력하세요 (쉼표로 구분)' : ''}
            className="flex-1 bg-transparent text-[14px] font-normal text-[#181818] placeholder-[#181818]/60 outline-none"
          />
        </div>
      </div>
      {hasError && <p className="mt-2 font-pretendard text-sm text-red-500">{errorMessage}</p>}
    </div>
  );
};
