'use client';

import { RiDeleteBinLine } from '@remixicon/react';
import { useEffect } from 'react';
import { LoadingSpinner } from './LoadingSpinner';

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function DeleteConfirmDialog({ isOpen, onClose, onConfirm, isLoading = false }: DeleteConfirmDialogProps) {
  // ESC 키로 다이얼로그 닫기
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

  if (!isOpen) return null;

  return (
    <>
      {/* 백드롭 */}
      <div 
        className="fixed inset-0 z-50 bg-black/50 transition-opacity" 
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }} 
      />

      {/* 다이얼로그 */}
      <div 
        className="fixed left-1/2 top-1/2 z-50 w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[rgba(34,34,34,0.08)] bg-white p-5 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 콘텐츠 */}
        <div className="flex h-[100px] flex-col items-center justify-center gap-2 py-5">
          <h3 className="text-[16px] font-bold text-[#222222]">이 노트를 삭제하시겠어요?</h3>
          <p className="text-[13px] text-[#222222] opacity-60">
            삭제한 게시물은 복원할 수 없습니다
          </p>
        </div>

        {/* 버튼 영역 */}
        <div className="flex gap-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            disabled={isLoading}
            className="flex flex-1 items-center justify-center rounded-lg py-4 text-[13px] text-[#222222] hover:bg-[rgba(241,241,241,0.5)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            취소
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onConfirm();
            }}
            disabled={isLoading}
            className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-[rgba(224,70,70,0.08)] py-4 text-[13px] font-medium text-[#E04646] hover:bg-[rgba(224,70,70,0.12)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <LoadingSpinner size="sm" className="text-[#E04646]" />
            ) : (
              <>
                <RiDeleteBinLine className="h-4 w-4 opacity-80" />
                삭제
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
}
