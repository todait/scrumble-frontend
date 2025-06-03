'use client';

import React, { useState } from 'react';

import { InviteButton } from '../ui/InviteButton';

import { EmailTagInput } from './EmailTagInput';

interface InviteInputProps {
  emails: string[];
  onEmailsChange: (emails: string[]) => void;
  onInvite: () => void;
  disabled?: boolean;
  layout?: 'inline' | 'stack';
  buttonText?: string;
}

export const InviteInput: React.FC<InviteInputProps> = ({
  emails,
  onEmailsChange,
  onInvite,
  disabled = false,
  layout = 'stack',
  buttonText,
}) => {
  const isInline = layout === 'inline';
  const [hasEmailError, setHasEmailError] = useState(false);

  return (
    <div
      className={
        isInline
          ? 'flex w-full items-start gap-[10px]' // 버튼·인풋 나란히 + gap
          : 'space-y-[10px]'
      }
    >
      {/* 인풋이 공간을 차지하도록 flex-1 */}
      <div className="flex-1">
        <EmailTagInput
          emails={emails}
          onEmailsChange={onEmailsChange}
          onValidationError={setHasEmailError}
        />
      </div>

      {/* 버튼 영역 - inline일 때는 내용 크기만큼, stack일 때는 full width */}
      <div className={isInline ? 'shrink-0' : 'w-full'}>
        <InviteButton
          emailCount={emails.length}
          onClick={onInvite}
          disabled={disabled || emails.length === 0 || hasEmailError}
          buttonText={buttonText}
          size={isInline ? 'sm' : 'md'}
          className={isInline ? 'min-h-[45px]' : 'w-full'}
        />
      </div>
    </div>
  );
};
