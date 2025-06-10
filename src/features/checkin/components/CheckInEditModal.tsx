'use client';

import { RiPokerClubsFill } from '@remixicon/react';
import { CheckInForm } from './forms';
import { CheckInModalLayout } from './layout';
import type { CheckinPost } from '@/features/feed/types/feed.types';
import { formatDate } from '@/shared/utils';

interface CheckInEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: CheckinPost;
  onSubmit?: () => void;
}

export function CheckInEditModal({ isOpen, onClose, post, onSubmit }: CheckInEditModalProps) {
  const handleSubmit = (data: { score: number; message: string; images: string[] }) => {
    // TODO: API 연동
    onClose();
    onSubmit?.();
  };


  // 기존 포스트 데이터를 초기값으로 설정
  const initialData = {
    score: post.conditionScore,
    message: post.content,
    images: post.images || [],
  };

  return (
    <CheckInModalLayout isOpen={isOpen} onClose={onClose}>
      <div className="border-b border-black/8 px-8 py-8">
        <div className="mb-2 text-[15px] font-bold text-black">{formatDate(new Date(post.createdAt))}</div>
        <div className="mb-2 flex items-center gap-2">
          <RiPokerClubsFill className="h-6 w-6 text-green-500" />
          <h2 className="text-2xl font-bold text-black">체크인 노트 수정</h2>
        </div>
      </div>
      <CheckInForm onSubmit={handleSubmit} initialData={initialData} />
    </CheckInModalLayout>
  );
}