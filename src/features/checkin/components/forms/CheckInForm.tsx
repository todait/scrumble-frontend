'use client';

import { PostForm } from '@/shared/components/ui';
import type { ImageMetadata } from '@/shared/types/upload.types';
import { useEffect, useState } from 'react';
import { ScoreSelector } from '../ui';

interface CheckInFormProps {
  onSubmit: (data: { score: number; message: string; images: ImageMetadata[] }) => void;
  onChange?: (data: { score: number | null; message: string; images: ImageMetadata[] }) => void;
  disabled?: boolean;
  isLoading?: boolean;
  initialData?: { score: number; message: string; images?: ImageMetadata[] };
  onScoreRequiredToast?: () => void; // 점수 선택 요구 Toast 콜백
}

export const CheckInForm = ({
  onSubmit,
  onChange,
  disabled = false,
  isLoading = false,
  initialData,
  onScoreRequiredToast,
}: CheckInFormProps) => {
  const [selectedScore, setSelectedScore] = useState<number | null>(initialData?.score || null);
  const [currentFormData, setCurrentFormData] = useState<{ message: string; images: ImageMetadata[] }>({
    message: initialData?.message || '',
    images: initialData?.images || []
  });

  useEffect(() => {
    if (initialData) {
      setSelectedScore(initialData.score);
    }
  }, [initialData]);

  // 점수가 변경될 때마다 onChange 호출
  useEffect(() => {
    if (onChange) {
      onChange({ score: selectedScore, ...currentFormData });
    }
  }, [selectedScore]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = (data: { message: string; images: ImageMetadata[] }) => {
    if (!selectedScore) {
      if (onScoreRequiredToast) {
        onScoreRequiredToast();
      }
      return;
    }
    if (selectedScore && data.message.trim()) {
      onSubmit({ score: selectedScore, message: data.message, images: data.images });
    }
  };

  const handleTextAreaClick = () => {
    if (!selectedScore && onScoreRequiredToast) {
      onScoreRequiredToast();
    }
  };

  const placeholder = selectedScore
    ? '오늘 팀과 함께 시작하는 하루! 오늘의 컨디션이나 기대되는 일, 도움이 필요한 부분을 편하게 나눠주세요.'
    : '오늘의 상태를 점수로 기록하면 좋은점💡 스스로를 객관적으로 돌아볼 수 있고, 팀과도 배려하며 협업할 수 있어요.';

  const handleScoreChange = (score: number | null) => {
    setSelectedScore(score);
  };

  const handlePostFormChange = (data: { message: string; images: ImageMetadata[] }) => {
    setCurrentFormData(data);
    if (onChange) {
      onChange({ score: selectedScore, message: data.message, images: data.images });
    }
  };

  return (
    <PostForm
      onSubmit={handleSubmit}
      onChange={handlePostFormChange}
      disabled={disabled}
      submitDisabled={!selectedScore}
      isLoading={isLoading}
      initialMessage={initialData?.message}
      initialImages={initialData?.images}
      placeholder={placeholder}
      onTextAreaClick={handleTextAreaClick}
    >
      <ScoreSelector value={selectedScore} onChange={handleScoreChange} />
    </PostForm>
  );
};
