// CheckInEditModal 수정 - useCheckInForm 훅 사용으로 로직 공통화
'use client';

import type { CheckinPost } from '@/features/feed/types/feed.types';
import { useToast } from '@/shared/hooks';
import type { ImageMetadata } from '@/shared/types/upload.types';
import { formatDate } from '@/shared/utils';
import { RiPokerClubsFill } from '@remixicon/react';
import { useEffect } from 'react';
import { useCheckInForm } from '../hooks/useCheckInForm';
import { CheckInForm } from './forms';
import { CheckInModalLayout } from './layout';

interface CheckInEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: CheckinPost;
  onSubmit?: () => void;
}

export function CheckInEditModal({ isOpen, onClose, post, onSubmit }: CheckInEditModalProps) {
  const { error } = useToast();

  // useCheckInForm 훅 사용으로 로직 단순화
  const { values, setValue, save, isLoading } = useCheckInForm({
    mode: 'edit',
    postId: post.id,
    initialData: {
      score: post.conditionScore,
      message: post.conditionText,
      images: post.images,
    },
    onSuccess: () => {
      onSubmit?.();
      onClose();
    },
    onError: () => {
      error({
        message: '체크인 수정 실패: 체크인 수정 중 오류가 발생했습니다. 다시 시도해주세요.',
      });
    },
  });

  const handleSubmit = async (data: {
    score: number;
    message: string;
    images: ImageMetadata[];
  }) => {
    const trimmedMessage = data.message.trim();
    if (trimmedMessage === '') {
      error({
        title: '메시지를 입력해주세요.',
      });
      return;
    }

    // 값을 스토어에 저장하면서 동시에 save 함수에 전달
    setValue('score', data.score);
    setValue('message', trimmedMessage);
    setValue('images', data.images);

    await save({
      score: data.score,
      message: trimmedMessage,
      images: data.images,
    });
  };

  // ESC 키로 모달 닫기
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown, true); // capture phase에서 먼저 처리
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen, onClose]);

  return (
    <CheckInModalLayout isOpen={isOpen} onClose={onClose} showBackButton={false}>
      <div className="border-b border-black/8 px-8 py-8">
        <div className="mb-2 text-[15px] font-bold text-black">
          {formatDate(new Date(post.createdAt))}
        </div>
        <div className="mb-2 flex items-center gap-2">
          <RiPokerClubsFill className="h-6 w-6 text-green-500" />
          <h2 className="text-2xl font-bold text-black">체크인 노트 수정</h2>
        </div>
      </div>
      <CheckInForm
        onSubmit={handleSubmit}
        initialData={{
          score: values.score,
          message: values.message,
          images: values.images,
        }}
        disabled={isLoading}
        isLoading={isLoading}
      />
    </CheckInModalLayout>
  );
}
