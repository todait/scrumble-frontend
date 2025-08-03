// CheckInWriteModal 개편 - 2-step Pager UI로 변경 (note → todo)
'use client';

import type { Todo } from '@/features/todo';
import { TodoContainer, TodoContainerRef } from '@/features/todo';
import { AutosaveIndicator } from '@/shared/components/ui';
import { useExistsCheckin } from '@/shared/hooks/queries/usePosts';
import { useAutosave } from '@/shared/hooks/useAutosave';
import { useToast } from '@/shared/hooks/useToast';
import type { CheckInAutosaveData } from '@/shared/services/autosave';
import { useDateStore } from '@/shared/stores/useDateStore';
import { ErrorCode } from '@/shared/types/api';
import type { ImageMetadata } from '@/shared/types/upload.types';
import { formatDate, formatDateToAPIString, isErrorCode } from '@/shared/utils';
import { RiPokerClubsFill } from '@remixicon/react';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useCheckInForm } from '../hooks/useCheckInForm';
import { useCheckInTodos } from '../hooks/useCheckInTodos';
import { useCheckInModalStore } from '../stores/useCheckInModalStore';
import { useCheckInTodoStore } from '../stores/useCheckInTodoStore';
import { CheckInForm } from './forms';
import { CheckInModalLayout } from './layout';
import { PagerDots } from './PagerDots';

interface CheckInWriteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CheckInWriteModal({ isOpen, onClose }: CheckInWriteModalProps) {
  const router = useRouter();
  const params = useParams();
  const spaceSlug = params.spaceSlug as string;
  const { selectedDate } = useDateStore();
  const [dateString, setDateString] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { error, info } = useToast();
  const todoContainerRef = useRef<TodoContainerRef>(null);

  // Todo 데이터 관리용 Map (origin_todo_id 추적)
  const [todosWithOrigin, setTodosWithOrigin] = useState<Map<string, Todo>>(new Map());

  // 2-step 관리를 위한 스토어
  const { step, postId, setStep, setPostId, reset: resetModalStore } = useCheckInModalStore();
  const {
    yesterdayTodos,
    todayTodos,
    setYesterdayTodos,
    setTodayTodos,
    reset: resetTodoStore,
  } = useCheckInTodoStore();

  // postId가 있으면 edit 모드, 없으면 create 모드
  const mode = postId && step === 'note' ? 'edit' : 'create';

  // 체크인 폼 훅 사용
  const { values, setValue, save, isLoading } = useCheckInForm({
    mode,
    postId,
    onSuccess: newPostId => {
      if (step === 'note') {
        setPostId(newPostId);
        setStep('todo');
      }
    },
    onError: err => {
      if (isErrorCode(err, ErrorCode.CHECKIN_ALREADY_EXISTS)) {
        router.replace(`/${spaceSlug}/feed`);
      } else {
        error({
          message: '체크인 작성 실패: 체크인 작성 중 오류가 발생했습니다. 다시 시도해주세요.',
        });
      }
      setIsProcessing(false);
    },
  });

  const { refetch: refetchExistsCheckin } = useExistsCheckin({
    date: formatDateToAPIString(selectedDate),
  });

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

  // hooks 추가
  const { isLoadingYesterday, isLoadingToday, saveTodos, isSaving } = useCheckInTodos('new');

  // 실시간 폼 데이터 상태 관리
  const [formScore, setFormScore] = useState<number | null>(values.score || null);
  const [formMessage, setFormMessage] = useState(values.message || '');
  const [formImages, setFormImages] = useState<ImageMetadata[]>(values.images || []);

  // 자동 저장 데이터 준비
  const autosaveData = useMemo<CheckInAutosaveData>(
    () => ({
      score: formScore,
      message: formMessage,
      images: formImages,
      step,
      todos: {
        yesterday: yesterdayTodos,
        today: todayTodos,
      },
      date: formatDateToAPIString(selectedDate),
    }),
    [formScore, formMessage, formImages, step, yesterdayTodos, todayTodos, selectedDate]
  );

  // 자동 저장 훅 사용
  const {
    status: autosaveStatus,
    restore,
    remove: removeAutosave,
  } = useAutosave<CheckInAutosaveData>({
    type: 'checkin',
    data: autosaveData,
    enabled: isOpen && mode === 'create', // 생성 모드에서만 자동 저장
    options: {
      onRestore: restoredData => {
        // 복원된 데이터 적용
        setValue('score', restoredData.score || 0);
        setValue('message', restoredData.message || '');
        setValue('images', restoredData.images || []);
        setFormScore(restoredData.score);
        setFormMessage(restoredData.message || '');
        setFormImages(restoredData.images || []);
        setStep(restoredData.step);
        setYesterdayTodos(restoredData.todos.yesterday);
        setTodayTodos(restoredData.todos.today);
      },
    },
  });

  // 컴포넌트 마운트 시 데이터 복원 (클라이언트에서만)
  useEffect(() => {
    if (isOpen && mode === 'create' && typeof window !== 'undefined') {
      // 다음 렌더링 사이클에서 복원하여 hydration 문제 방지
      const timer = setTimeout(() => {
        restore();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isOpen, mode, restore]);

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

  const handleSubmit = async (data: {
    score: number;
    message: string;
    images: ImageMetadata[];
  }) => {
    setIsProcessing(true);

    try {
      // 값을 스토어에 저장하면서 동시에 save 함수에 전달
      setValue('score', data.score);
      setValue('message', data.message);
      setValue('images', data.images);

      // 폼 상태도 업데이트 (자동 저장을 위해)
      setFormScore(data.score);
      setFormMessage(data.message);
      setFormImages(data.images);

      await save(
        {
          score: data.score,
          message: data.message,
          images: data.images,
        },
        formatDateToAPIString(selectedDate)
      );

      // create 모드에서 Step 1 완료 시 자동 저장 삭제
      if (mode === 'create') {
        removeAutosave();
      }

      // create 모드에서는 onSuccess 콜백에서 step을 'todo'로 변경
      // edit 모드에서는 처리 완료
      setIsProcessing(false);
    } catch {
      setIsProcessing(false);
      // 에러 처리는 useCheckInForm의 onError에서 처리됨
    }
  };

  const handleScoreRequiredToast = () => {
    info({
      message: '점수를 먼저 선택해주세요 😊: 오늘의 컴디션 점수를 먼저 선택한 후 메시지를 작성해주세요. 점수를 매기면 마음을 더 잘 정리할 수 있어요!',
    });
  };

  const handleBack = () => {
    setStep('note');
  };

  const handleTodoComplete = async () => {
    setIsProcessing(true);

    try {
      await saveTodos(todosWithOrigin);

      // 체크인이 제대로 생성되었는지 확인 후 피드로 이동
      let success = false;
      for (let i = 0; i < 5; i++) {
        const { data: existsCheckin } = await refetchExistsCheckin();
        if (existsCheckin?.exists === true) {
          success = true;
          break;
        }
        await new Promise(res => setTimeout(res, 200));
      }

      if (success) {
        // 성공 시 자동 저장 데이터 삭제
        removeAutosave();
        router.replace(`/${spaceSlug}/feed`);
      } else {
        setIsProcessing(false);
        error({
          message: '체크인 완료 실패: 체크인 완료 중 오류가 발생했습니다. 다시 시도해주세요.',
        });
      }
    } catch {
      setIsProcessing(false);
      error({
        message: '체크인 완료 실패: 체크인 완료 중 오류가 발생했습니다. 다시 시도해주세요.',
      });
    }
  };

  // Todo 핸들러 함수들
  const handleUpdateYesterdayTodos = (updatedTodos: Todo[]) => {
    setYesterdayTodos(updatedTodos);
  };

  const handleUpdateTodayTodos = (updatedTodos: Todo[], mappingRemovedTodoIds?: string[]) => {
    // mappingRemovedTodoIds에 포함된 todo의 originTodoId를 null로 설정
    const todosWithUpdatedMapping = updatedTodos.map(todo =>
      mappingRemovedTodoIds?.includes(todo.id) ? { ...todo, originTodoId: null } : todo
    );

    setTodayTodos(todosWithUpdatedMapping);

    // todosWithOrigin Map 업데이트
    const newTodosWithOrigin = new Map<string, Todo>();
    todosWithUpdatedMapping.forEach(todo => {
      newTodosWithOrigin.set(todo.id, todo);
    });
    setTodosWithOrigin(newTodosWithOrigin);
  };

  const handleToggleComplete = (todoId: string, isYesterday: boolean) => {
    if (isYesterday) {
      const todos = yesterdayTodos.map(todo =>
        todo.id === todoId
          ? { ...todo, completedAt: todo.completedAt ? undefined : new Date().toISOString() }
          : todo
      );
      setYesterdayTodos(todos);
    } else {
      const todos = todayTodos.map(todo =>
        todo.id === todoId
          ? { ...todo, completedAt: todo.completedAt ? undefined : new Date().toISOString() }
          : todo
      );
      setTodayTodos(todos);
    }
  };

  // todayTodos가 변경될 때 todosWithOrigin도 초기화
  useEffect(() => {
    const newTodosWithOrigin = new Map<string, Todo>();
    todayTodos.forEach(todo => {
      newTodosWithOrigin.set(todo.id, todo);
    });
    setTodosWithOrigin(newTodosWithOrigin);
  }, [todayTodos]);

  // 초기 가져온 Todo ID와 매핑 계산
  const calculateInitialBroughtData = useCallback((): {
    broughtIds: Set<string>;
    idMapping: Map<string, string>;
  } => {
    const broughtIds = new Set<string>();
    const idMapping = new Map<string, string>();

    todayTodos.forEach(todayTodo => {
      if (todayTodo.originTodoId) {
        yesterdayTodos.forEach(yesterdayTodo => {
          // 오늘 투두의 originTodoId가 어제 투두의 id 또는 originTodoId와 일치하는지 확인
          const matchById = todayTodo.originTodoId === yesterdayTodo.id;
          const matchByOriginId =
            yesterdayTodo.originTodoId && todayTodo.originTodoId === yesterdayTodo.originTodoId;

          if (matchById || matchByOriginId) {
            broughtIds.add(yesterdayTodo.id);
            // 오늘 투두 ID -> 어제 투두 ID 매핑 추가
            idMapping.set(todayTodo.id, yesterdayTodo.id);
          }
        });
      }
    });

    return { broughtIds, idMapping };
  }, [todayTodos, yesterdayTodos]);

  // 초기 brought 데이터를 메모이제이션
  const initialBroughtData = useMemo(() => {
    return calculateInitialBroughtData();
  }, [calculateInitialBroughtData]);

  const handleFormChange = useCallback(
    (data: { score: number | null; message: string; images: ImageMetadata[] }) => {
      setFormScore(data.score);
      setFormMessage(data.message);
      setFormImages(data.images);
    },
    []
  );

  return (
    <CheckInModalLayout
      isOpen={isOpen}
      onClose={onClose}
      showBackButton={step === 'todo'}
      onBack={handleBack}
    >
      {step === 'note' ? (
        <>
          {/* Step 1: 체크인 노트 작성 */}
          <div className="border-b border-black/8 px-5 py-6 md:px-7 md:py-8">
            <div className="mb-3 flex items-center justify-between">
              <PagerDots total={2} current={0} />
              <AutosaveIndicator status={autosaveStatus} />
            </div>
            <div className="mb-2 text-sm font-bold text-black md:text-[15px]">{dateString}</div>
            <div className="mb-2 flex items-center gap-2">
              <RiPokerClubsFill className="h-5 w-5 text-green-500 md:h-6 md:w-6" />
              <h2 className="text-xl font-bold text-black md:text-2xl">체크인 노트</h2>
            </div>
            <p className="text-xs leading-relaxed text-black opacity-50 md:text-sm">
              하루의 리듬을 스스로 인식하고 조율하는 좋은 시작이 되어줄 거예요. 작은 기록 하나가
              팀워크의 흐름을 만드는 신호가 될 수 있답니다.
            </p>
          </div>
          <CheckInForm
            onSubmit={handleSubmit}
            onChange={handleFormChange}
            disabled={isLoading || isProcessing}
            isLoading={isLoading || isProcessing}
            onScoreRequiredToast={handleScoreRequiredToast}
            initialData={
              mode === 'edit'
                ? { score: values.score, message: values.message, images: values.images }
                : formScore !== null
                  ? { score: formScore, message: formMessage, images: formImages }
                  : undefined
            }
          />
        </>
      ) : (
        <>
          {/* Step 2: Todo 리스트 작성 */}
          <div className="border-b border-black/8 px-5 py-6 md:px-7 md:py-8">
            <div className="mb-3 flex items-center justify-between">
              <PagerDots total={2} current={1} />
              <AutosaveIndicator status={autosaveStatus} />
            </div>
            <div className="mb-2 text-sm font-bold text-black md:text-[15px]">
              {dateString} · 체크인
            </div>
            <div className="mb-2 flex items-center gap-2">
              <h2 className="text-xl font-bold text-black md:text-2xl">오늘의 투두</h2>
            </div>
            <p className="text-xs leading-relaxed text-black opacity-50 md:text-sm">
              어제의 흐름을 돌아보고, 오늘의 방향을 잡아보세요.
            </p>
          </div>
          <div className="border-t border-black/8 px-5 py-3 md:px-7 md:py-4">
            <TodoContainer
              ref={todoContainerRef}
              mode="checkIn"
              yesterdayTodos={yesterdayTodos}
              todayTodos={todayTodos}
              isEditable={true}
              onUpdateYesterdayTodos={handleUpdateYesterdayTodos}
              onUpdateTodayTodos={handleUpdateTodayTodos}
              onToggleComplete={handleToggleComplete}
              forceEditMode={true}
              onSaveTodos={handleTodoComplete}
              isProcessing={isProcessing || isSaving || isLoadingYesterday || isLoadingToday}
              hideNoTodosButton={todayTodos.length > 0}
              initialBroughtTodoIds={initialBroughtData.broughtIds}
              initialTodoIdMapping={initialBroughtData.idMapping}
            />
          </div>
        </>
      )}
    </CheckInModalLayout>
  );
}
