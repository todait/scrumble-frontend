'use client';

import { useState, useCallback } from 'react';

import { emailSchema } from '@/schemas';

interface UseEmailListOptions {
  initialEmails?: string[];
  maxEmails?: number;
  onValidationError?: (hasError: boolean) => void;
}

interface UseEmailListReturn {
  emails: string[];
  inputValue: string;
  hasError: boolean;
  errorMessage: string;
  setInputValue: (value: string) => void;
  addEmail: (email: string) => boolean;
  removeEmail: (index: number) => void;
  setEmails: (emails: string[]) => void;
  clearError: () => void;
  validateEmail: (email: string) => boolean;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export function useEmailList({
  initialEmails = [],
  maxEmails = 10,
  onValidationError,
}: UseEmailListOptions = {}): UseEmailListReturn {
  const [emails, setEmailsState] = useState<string[]>(initialEmails);
  const [inputValue, setInputValueState] = useState('');
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
  const setError = useCallback((message: string) => {
    setHasError(true);
    setErrorMessage(message);
    onValidationError?.(true);
  }, [onValidationError]);

  // 에러 상태 클리어
  const clearError = useCallback(() => {
    setHasError(false);
    setErrorMessage('');
    onValidationError?.(false);
  }, [onValidationError]);

  // input 값 설정
  const setInputValue = useCallback((value: string) => {
    setInputValueState(value);
    if (hasError) {
      clearError();
    }
  }, [hasError, clearError]);

  // 이메일 추가
  const addEmail = useCallback((email: string): boolean => {
    const trimmedEmail = email.trim();
    
    if (!trimmedEmail) {
      return false;
    }

    // 최대 개수 체크
    if (emails.length >= maxEmails) {
      setError(`최대 ${maxEmails}개의 이메일까지 입력할 수 있습니다`);
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
    setEmailsState(prev => [...prev, trimmedEmail]);
    setInputValueState('');
    clearError();
    return true;
  }, [emails, maxEmails, validateEmail, setError, clearError]);

  // 이메일 제거
  const removeEmail = useCallback((indexToRemove: number) => {
    setEmailsState(prev => prev.filter((_, index) => index !== indexToRemove));
    if (hasError) {
      clearError();
    }
  }, [hasError, clearError]);

  // 이메일 목록 설정
  const setEmails = useCallback((newEmails: string[]) => {
    setEmailsState(newEmails);
    if (hasError) {
      clearError();
    }
  }, [hasError, clearError]);

  // input 변경 핸들러
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // 쉼표가 입력되면 이메일 추가
    if (value.includes(',')) {
      const emailToAdd = value.replace(',', '');
      addEmail(emailToAdd);
      return;
    }

    setInputValue(value);
  }, [addEmail, setInputValue]);

  // 키다운 핸들러
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      addEmail(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && emails.length > 0) {
      // 입력값이 없을 때 백스페이스로 마지막 태그 삭제
      removeEmail(emails.length - 1);
    }
  }, [addEmail, removeEmail, inputValue, emails.length]);

  return {
    emails,
    inputValue,
    hasError,
    errorMessage,
    setInputValue,
    addEmail,
    removeEmail,
    setEmails,
    clearError,
    validateEmail,
    handleInputChange,
    handleKeyDown,
  };
}