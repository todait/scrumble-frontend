'use client';

import React, { useState } from 'react';
import { EmailTagInput } from './EmailTagInput';
import { InviteButton } from '../ui/InviteButton';

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
  buttonText
}) => {
  const isInline = layout === 'inline';
  const [hasEmailError, setHasEmailError] = useState(false);


  return (
    <div
      className={
        isInline
          ? 'w-full flex items-start gap-[10px]'      // 버튼·인풋 나란히 + gap
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

      {/* 버튼은 고정폭 & 줄어들지 않도록 shrink-0 */}
      <div className='shrink-0'>
        <InviteButton
          emailCount={emails.length}
          onClick={onInvite}
          disabled={disabled || emails.length === 0 || hasEmailError}
          buttonText={buttonText}
          className={isInline ? 'min-h-[60px]' : undefined}
        />
      </div>
    </div>
  );
}; 