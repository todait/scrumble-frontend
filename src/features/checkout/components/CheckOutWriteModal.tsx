'use client';

import type { Todo } from '@/features/todo';
import { TodoContainer, TodoContainerRef } from '@/features/todo';
import { CheckInModalLayout } from '@/features/checkin/components/layout';
import { PagerDots } from '@/features/checkin/components/PagerDots';
import { useCreateCheckOut } from '@/shared/hooks/queries';
import { useDateStore } from '@/shared/stores/useDateStore';
import type { ImageMetadata } from '@/shared/types/upload.types';
import { formatDate, formatDateToAPIString } from '@/shared/utils';
import { RiCheckFill, RiPokerDiamondsFill } from '@remixicon/react';
import { useEffect, useRef, useState } from 'react';
import { CheckOutForm } from './forms';
import { useCheckOutModalStore } from '../stores/useCheckOutModalStore';
import { useCheckOutTodoStore } from '../stores/useCheckOutTodoStore';

interface CheckOutWriteModalProps {
  spaceSlug: string;
  isOpen: boolean;
  onClose: () => void;
}

export function CheckOutWriteModal({ spaceSlug, isOpen, onClose }: CheckOutWriteModalProps) {
  const { mutate: createCheckOut, isPending } = useCreateCheckOut();
  const { selectedDate } = useDateStore();
  const [dateString, setDateString] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const todoContainerRef = useRef<TodoContainerRef>(null);
  
  // 2-step 관리를 위한 스토어
  const { step, setStep, reset: resetModalStore } = useCheckOutModalStore();
  const { 
    todayTodos, 
    setTodayTodos,
    reset: resetTodoStore 
  } = useCheckOutTodoStore();

  useEffect(() => {
    setDateString(formatDate(selectedDate));
  }, [selectedDate]);

  // 모달이 닫힐 때 스토어 리셋
  useEffect(() => {
    if (!isOpen) {
      resetModalStore();
      resetTodoStore();
    }
  }, [isOpen, resetModalStore, resetTodoStore]);

  // 초기 Todo 데이터 설정 (임시)
  useEffect(() => {
    if (isOpen && todayTodos.length === 0) {
      setTodayTodos([
        {
          id: 't1',
          text: '1차 내부용 버전 배포 목표 명세 ( 내부 베타용 최소 릴리즈 버전 )',
          completed: false,
        },
        {
          id: 't2',
          text: '팀 피드 디자인',
          completed: true,
        },
        {
          id: 't3',
          text: '텍스트 생성 UX 개선 (tiptap 적용)',
          completed: true,
        },
        {
          id: 't4',
          text: 'HEIC 이미지 변환 시스템 구현',
          completed: false,
        },
        {
          id: 't5',
          text: '체크아웃 모달 2-step 구현',
          completed: false,
        },
      ]);
    }
  }, [isOpen, todayTodos.length, setTodayTodos]);

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
        spaceSlug,
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
    // 체크아웃에서는 오늘 투두만 다루므로 _isYesterday는 항상 false
    const todos = todayTodos.map(todo =>
      todo.id === todoId ? { ...todo, completed: !todo.completed } : todo
    );
    setTodayTodos(todos);
  };

  const handleUpdateTodayTodos = (updatedTodos: Todo[]) => {
    const todoDrafts = updatedTodos.map(todo => ({
      id: todo.id,
      text: todo.text,
      completed: !!todo.completedAt,
    }));
    setTodayTodos(todoDrafts);
  };

  // TodoDraft를 Todo로 변환
  const convertToTodos = (drafts: typeof todayTodos, date: Date): Todo[] => {
    return drafts.map((draft, index) => ({
      id: draft.id,
      text: draft.text,
      completedAt: draft.completed ? new Date() : null,
      date,
      order: (index + 1) * 10,
    }));
  };

  const todayDate = new Date();


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
          <div className="border-t border-black/8 px-5 py-6 md:px-7 md:py-8">
            <TodoContainer
              ref={todoContainerRef}
              yesterdayTodos={[]} // 체크아웃에서는 어제 투두 표시하지 않음
              todayTodos={convertToTodos(todayTodos, todayDate)}
              isEditable={true} // 체크 가능하도록 설정
              onUpdateTodayTodos={handleUpdateTodayTodos}
              onToggleComplete={handleToggleComplete}
              forceEditMode={false} // 편집 모드 토글 가능
              onSaveTodos={handleTodoComplete}
              isProcessing={isProcessing}
              customButtonText={(completedCount, totalCount) => {
                const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
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
              하루를 돌아보며 나의 흐름을 마무리하는 시간이 될 거예요. 짧은 회고를 통해 다음 하루를 더
              유연하게 만들어줄 수 있답니다.
            </p>
          </div>
          <CheckOutForm onSubmit={handleSubmit} disabled={isPending || isProcessing} isLoading={isPending || isProcessing} />
        </>
      )}
    </CheckInModalLayout>
  );
}
