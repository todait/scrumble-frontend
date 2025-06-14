'use client';

import { PostForm } from '@/shared/components/ui';

interface CheckOutFormProps {
  onSubmit: (data: { message: string; images: string[] }) => void;
  disabled?: boolean;
  isLoading?: boolean;
  initialData?: { message: string; images: string[] };
}

export const CheckOutForm = ({ onSubmit, disabled = false, isLoading = false, initialData }: CheckOutFormProps) => {
  return (
    <PostForm
      onSubmit={onSubmit}
      disabled={disabled}
      isLoading={isLoading}
      placeholder="오늘 하루 고생하셨어요! 🌙 오늘의 성과나 배운 점, 내일을 위한 개선사항을 팀과 나눠보세요. 간단한 KPT 회고로 우리 팀의 성장을 만들어가요."
      initialMessage={initialData?.message}
    />
  );
};
