'use client';

import { PostForm } from '@/shared/components/ui';

interface CheckOutFormProps {
  onSubmit: (data: { message: string; images: string[] }) => void;
  disabled?: boolean;
}

export const CheckOutForm = ({ onSubmit, disabled = false }: CheckOutFormProps) => {
  return (
    <PostForm
      onSubmit={onSubmit}
      disabled={disabled}
      placeholder="오늘 하루를 마무리하며 남기고 싶은 이야기가 있나요? 오늘의 Keep, Problem, Try를 중심으로 회고를 가볍게 남겨보세요."
    />
  );
};
