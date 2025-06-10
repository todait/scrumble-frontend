'use client';

import { useState, useEffect } from 'react';
import { ScoreSelector } from '../ui';
import { PostForm } from '@/shared/components/ui';

interface CheckInFormProps {
  onSubmit: (data: { score: number; message: string; images: string[] }) => void;
  disabled?: boolean;
  initialData?: { score: number; message: string; images: string[] };
}

export const CheckInForm = ({ onSubmit, disabled = false, initialData }: CheckInFormProps) => {
  const [selectedScore, setSelectedScore] = useState<number | null>(initialData?.score || null);

  useEffect(() => {
    if (initialData) {
      setSelectedScore(initialData.score);
    }
  }, [initialData]);

  const handleSubmit = (data: { message: string; images: string[] }) => {
    if (selectedScore && data.message.trim()) {
      onSubmit({ score: selectedScore, message: data.message, images: data.images });
    }
  };

  return (
    <PostForm
      onSubmit={handleSubmit}
      disabled={disabled || !selectedScore}
      initialMessage={initialData?.message}
      placeholder="오늘 하루는 어떠셨나요? 팀원들과 나누고 싶은 이야기를 들려주세요."
    >
      <ScoreSelector value={selectedScore} onChange={score => setSelectedScore(score || null)} />
    </PostForm>
  );
};