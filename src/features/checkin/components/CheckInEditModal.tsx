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
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // 기존 포스트 데이터를 초기값으로 설정
  // TODO: 이미지 편집 기능 추가 시 string[]을 ImageMetadata[]로 변환 필요
  const initialData = {
    score: post.conditionScore,
    message: post.conditionText,
    images: [] as ImageMetadata[], // 현재는 이미지 편집을 지원하지 않으므로 빈 배열
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
      <CheckInForm onSubmit={handleSubmit} initialData={initialData} disabled={isPending} isLoading={isPending} />
    </CheckInModalLayout>
  );
}
