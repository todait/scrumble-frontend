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

  const placeholder = selectedScore 
    ? "오늘 팀과 함께 시작하는 하루! 오늘의 컨디션이나 기대되는 일, 도움이 필요한 부분을 편하게 나눠주세요."
    : "오늘의 상태를 점수로 기록하면 좋은점💡 스스로를 객관적으로 돌아볼 수 있고, 팀과도 배려하며 협업할 수 있어요.";

  return (
    <PostForm
      onSubmit={handleSubmit}
      disabled={disabled || !selectedScore}
      initialMessage={initialData?.message}
      placeholder={placeholder}
    >
      <ScoreSelector value={selectedScore} onChange={score => setSelectedScore(score || null)} />
    </PostForm>
  );
};