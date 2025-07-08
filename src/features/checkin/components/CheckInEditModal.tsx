'use client';

import type { CheckinPost } from '@/features/feed/types/feed.types';
import { useToast } from '@/shared/hooks';
import { useUpdateCheckIn } from '@/shared/hooks/queries';
import type { ImageMetadata } from '@/shared/types/upload.types';
import { formatDate } from '@/shared/utils';
import { RiPokerClubsFill } from '@remixicon/react';
import { useEffect } from 'react';
import { CheckInForm } from './forms';
import { CheckInModalLayout } from './layout';

interface CheckInEditModalProps {
  spaceSlug: string;
  isOpen: boolean;
  onClose: () => void;
  post: CheckinPost;
  onSubmit?: () => void;
}

export function CheckInEditModal({
  spaceSlug,
  isOpen,
  onClose,
  post,
  onSubmit,
}: CheckInEditModalProps) {
  const { mutate: updateCheckIn, isPending } = useUpdateCheckIn();
  const { error } = useToast();

  const handleSubmit = (data: { score: number; message: string; images: ImageMetadata[] }) => {
    data.message = data.message.trim();
    if (data.message === '') {
      error({
        title: '메시지를 입력해주세요.',
      });
      return;
    }

    updateCheckIn(
      {
        spaceSlug,
        postId: post.id,
        conditionScore: data.score,
        conditionText: data.message,
        images: data.images,
      },
      {
        onSuccess: () => {
          onSubmit?.();
          onClose();
        },
      }
    );
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

  const initialData = {
    score: post.conditionScore,
    message: post.conditionText,
    images: post.images,
  };

  return (
    <CheckInModalLayout isOpen={isOpen} onClose={onClose}>
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
        initialData={initialData}
        disabled={isPending}
        isLoading={isPending}
      />
    </CheckInModalLayout>
  );
}
