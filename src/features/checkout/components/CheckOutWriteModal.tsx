'use client';

import { CheckInModalLayout } from '@/features/checkin/components/layout';
import { PagerDots } from '@/features/checkin/components/PagerDots';
import type { Todo } from '@/features/todo';
import { TodoContainer, TodoContainerRef } from '@/features/todo';
import { useCreateCheckOut } from '@/shared/hooks/queries';
import { useDateStore } from '@/shared/stores/useDateStore';
import type { ImageMetadata } from '@/shared/types/upload.types';
import { formatDate, formatDateToAPIString } from '@/shared/utils';
import { RiCheckFill, RiPokerDiamondsFill } from '@remixicon/react';
import { useEffect, useRef, useState } from 'react';
import { useCheckOutTodos } from '../hooks/useCheckOutTodos';
import { useCheckOutModalStore } from '../stores/useCheckOutModalStore';
import { CheckOutForm } from './forms';

interface CheckOutWriteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CheckOutWriteModal({ isOpen, onClose }: CheckOutWriteModalProps) {
  const { mutate: createCheckOut, isPending } = useCreateCheckOut();
  const { selectedDate } = useDateStore();
  const [dateString, setDateString] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const todoContainerRef = useRef<TodoContainerRef>(null);

  // 2-step 관리를 위한 스토어
  const { step, setStep, reset: resetModalStore } = useCheckOutModalStore();

  // hooks 추가
  const { isLoading, handleToggleTodo, todayData } = useCheckOutTodos();

  useEffect(() => {
    setDateString(formatDate(selectedDate));
  }, [selectedDate]);

  // 모달이 닫힐 때 스토어 리셋
  useEffect(() => {
    if (!isOpen) {
      resetModalStore();
    }
  }, [isOpen, resetModalStore]);

  // 초기 임시 데이터 제거 (useEffect 삭제)

  // ESC 키로 모달 닫기
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // TodoList에 포커스가 있는지 확인
        const todoListRef = todoContainerRef.current?.getTodayTodoListRef();
        const todoListHasFocus = todoListRef?.hasFocus();

        // TodoList에 포커스가 있으면 모달을 닫지 않음
        if (todoListHasFocus) {
          return;
        }

        e.stopPropagation();
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen, onClose]);

  const handleSubmit = (data: { message: string; images: ImageMetadata[] }) => {
    setIsProcessing(true);

    createCheckOut(
      {
        postedDate: formatDateToAPIString(selectedDate),
        reflectionText: data.message,
        images: data.images || [],
      },
      {
        onSuccess: () => {
          setIsProcessing(false);
          onClose();
        },
        onError: () => {
          setIsProcessing(false);
        },
      }
    );
  };

  const handleBack = () => {
    setStep('todo');
  };

  const handleTodoComplete = () => {
    setStep('checkout');
  };

  const handleToggleComplete = (todoId: string, _isYesterday: boolean) => {
    handleToggleTodo(todoId);
  };

  const handleUpdateTodayTodos = (_updatedTodos: Todo[]) => {
    // React Query가 캐시를 관리하므로 여기서는 아무것도 하지 않음
    // TodoContainer의 onUpdateTodayTodos prop을 위해 빈 함수로 유지
  };

  // store 데이터 대신 API 데이터 직접 사용
  // TodoContainer props 수정
  // (convertToTodos 함수 삭제)

  return (
    <CheckInModalLayout
      isOpen={isOpen}
      onClose={onClose}
      showBackButton={step === 'checkout'}
      onBack={handleBack}
    >
      {step === 'todo' ? (
        <>
          {/* Step 1: 오늘의 투두 체크 */}
          <div className="border-b border-black/8 px-5 py-6 md:px-7 md:py-8">
            <div className="mb-3 flex justify-start">
              <PagerDots total={2} current={0} />
            </div>
            <div className="mb-2 text-sm font-bold text-black md:text-[15px]">{dateString}</div>
            <div className="mb-2 flex items-center gap-2">
              <RiPokerDiamondsFill className="h-5 w-5 text-blue-500 md:h-6 md:w-6" />
              <h2 className="text-xl font-bold text-black md:text-2xl">오늘의 투두</h2>
            </div>
            <p className="text-xs leading-relaxed text-black opacity-50 md:text-sm">
              하루의 흐름을 돌아보고, 완료한 일들을 체크해보세요.
            </p>
          </div>
          <div className="border-t border-black/8 px-5 py-3 md:px-7 md:py-4">
            <TodoContainer
              ref={todoContainerRef}
              mode="checkOut"
              yesterdayTodos={[]} // 체크아웃에서는 어제 투두 표시하지 않음
              todayTodos={todayData} // API에서 받은 실제 Todo 데이터 사용
              isEditable={!isLoading}
              onUpdateTodayTodos={handleUpdateTodayTodos}
              onToggleComplete={handleToggleComplete}
              forceEditMode={false} // 편집 모드 토글 가능
              onSaveTodos={handleTodoComplete}
              isProcessing={isProcessing || isLoading}
              customButtonText={(completedCount, totalCount) => {
                const percentage =
                  totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
                return `${completedCount}개 완료 • (${percentage}%)`;
              }}
              customButtonIcon={<RiCheckFill className="h-4 w-4" />}
              hideNoTodosButton={true}
            />
          </div>
        </>
      ) : (
        <>
          {/* Step 2: 체크아웃 노트 작성 */}
          <div className="border-b border-black/8 px-5 py-6 md:px-7 md:py-8">
            <div className="mb-3 flex justify-start">
              <PagerDots total={2} current={1} />
            </div>
            <div className="mb-2 text-sm font-bold text-black md:text-[15px]">
              {dateString} · 체크아웃
            </div>
            <div className="mb-2 flex items-center gap-2">
              <RiPokerDiamondsFill className="h-5 w-5 text-blue-500 md:h-6 md:w-6" />
              <h2 className="text-xl font-bold text-black md:text-2xl">체크아웃 노트</h2>
            </div>
            <p className="text-xs leading-relaxed text-black opacity-50 md:text-sm">
              하루를 돌아보며 나의 흐름을 마무리하는 시간이 될 거예요. 짧은 회고를 통해 다음 하루를
              더 유연하게 만들어줄 수 있답니다.
            </p>
          </div>
          <CheckOutForm
            onSubmit={handleSubmit}
            disabled={isPending || isProcessing}
            isLoading={isPending || isProcessing}
          />
        </>
      )}
    </CheckInModalLayout>
  );
}
