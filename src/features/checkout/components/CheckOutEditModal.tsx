'use client';

import { CheckInModalLayout } from '@/features/checkin/components/layout';
import type { CheckoutPost } from '@/features/feed/types/feed.types';
import { useToast } from '@/shared/hooks';
import { useUpdateCheckOut } from '@/shared/hooks/queries';
import type { ImageMetadata } from '@/shared/types/upload.types';
import { formatDate } from '@/shared/utils';
import { RiPokerDiamondsFill } from '@remixicon/react';
import { useEffect } from 'react';
import { CheckOutForm } from './forms';

interface CheckOutEditModalProps {
  spaceSlug: string;
  isOpen: boolean;
  onClose: () => void;
  post: CheckoutPost;
  onSubmit?: () => void;
}

export function CheckOutEditModal({
  spaceSlug,
  isOpen,
  onClose,
  post,
  onSubmit,
}: CheckOutEditModalProps) {
  const { mutate: updateCheckOut, isPending } = useUpdateCheckOut();
  const { error } = useToast();

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

  const handleSubmit = (data: { message: string; images: ImageMetadata[] }) => {
    data.message = data.message.trim();
    if (data.message === '') {
      error({
        title: '메시지를 입력해주세요.',
      });
      return;
    }

    updateCheckOut(
      {
        spaceSlug,
        postId: post.id,
        reflectionText: data.message,
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

  const initialData = {
    message: post.reflectionText,
    images: post.images,
  };

  return (
    <CheckInModalLayout isOpen={isOpen} onClose={onClose}>
      <div className="border-b border-black/8 px-7 py-8">
        <div className="mb-2 text-[15px] font-bold text-black">
          {formatDate(new Date(post.createdAt))}
        </div>
        <div className="mb-2 flex items-center gap-2">
          <RiPokerDiamondsFill className="h-6 w-6 text-blue-500" />
          <h2 className="text-2xl font-bold text-black">체크아웃 노트 수정</h2>
        </div>
        <p className="text-sm leading-relaxed text-black opacity-50">
          하루를 돌아보며 나의 흐름을 마무리하는 시간이 될 거예요. 짧은 회고를 통해 다음 하루를 더
          유연하게 만들어줄 수 있답니다.
        </p>
      </div>
      <CheckOutForm
        onSubmit={handleSubmit}
        initialData={initialData}
        disabled={isPending}
        isLoading={isPending}
      />
    </CheckInModalLayout>
  );
}
