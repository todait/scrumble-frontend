'use client';

import type { Todo } from '@/features/todo';
import { TodoContainer } from '@/features/todo';
import { useCreateCheckIn, useExistsCheckin } from '@/shared/hooks/queries/usePosts';
import { useToast } from '@/shared/hooks/useToast';
import { useDateStore } from '@/shared/stores/useDateStore';
import { ErrorCode } from '@/shared/types/api';
import type { ImageMetadata } from '@/shared/types/upload.types';
import { formatDate, formatDateToAPIString, isErrorCode } from '@/shared/utils';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CheckInModalLayout } from './layout';

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

  // Todo 관련 상태 (임시 데이터로 동작)
  const [yesterdayTodos, setYesterdayTodos] = useState<Todo[]>([
    {
      id: 'y1',
      text: '피드 리스트 API 연동',
      completedAt: new Date(),
      date: new Date(Date.now() - 24 * 60 * 60 * 1000),
      order: 10,
    },
    {
      id: 'y2',
      text: '[투두] 체크인 : 투두 입력 흐름 전체 병합 (전일투두 + 오늘투두)',
      completedAt: new Date(),
      date: new Date(Date.now() - 24 * 60 * 60 * 1000),
      order: 20,
    },
    {
      id: 'y3',
      text: '피드 리스트 백엔드 API',
      completedAt: null,
      date: new Date(Date.now() - 24 * 60 * 60 * 1000),
      order: 30,
    },
    {
      id: 'y4',
      text: 'George 전달용 개발 문서 작성',
      completedAt: null,
      date: new Date(Date.now() - 24 * 60 * 60 * 1000),
      order: 40,
    },
    {
      id: 'y5',
      text: '[투두] 체크인 : 전일 투두 가져오기 흐름',
      completedAt: null,
      date: new Date(Date.now() - 24 * 60 * 60 * 1000),
      order: 50,
    },
  ]);

  const [todayTodos, setTodayTodos] = useState<Todo[]>([
    {
      id: 't1',
      text: '1차 내부용 버전 배포 목표 명세 ( 내부 베타용 최소 릴리즈 버전 )',
      completedAt: null,
      date: new Date(),
      order: 10,
    },
    {
      id: 't2',
      text: '팀 피드 디자인',
      completedAt: new Date(),
      date: new Date(),
      order: 20,
    },
    {
      id: 't3',
      text: '텍스트 생성 UX 개선 (tiptap 적용)',
      completedAt: new Date(),
      date: new Date(),
      order: 30,
    },
  ]);

  const { mutate: createCheckIn, isPending } = useCreateCheckIn();
  const { refetch: refetchExistsCheckin } = useExistsCheckin({
    spaceSlug,
    date: formatDateToAPIString(selectedDate),
  });

  useEffect(() => {
    setDateString(formatDate(selectedDate));
  }, [selectedDate]);

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

  const handleSubmit = (data: { score: number; message: string; images: ImageMetadata[] }) => {
    setIsProcessing(true);

    // 디버깅: 제출 데이터 로깅
    console.warn('CheckIn Submit - Images count:', data.images?.length || 0);
    console.warn('CheckIn Submit - Images:', data.images);

    createCheckIn(
      {
        spaceSlug,
        postedDate: formatDateToAPIString(selectedDate),
        conditionScore: data.score,
        conditionText: data.message,
        images: data.images || [], // 기본값 대비
      },
      {
        onSuccess: async () => {
          let success = false;
          for (let i = 0; i < 5; i++) {
            const { data: existsCheckin } = await refetchExistsCheckin();
            if (existsCheckin?.exists === true) {
              success = true;
              break;
            }
            await new Promise(res => setTimeout(res, 200)); // 200ms 대기 후 재시도
          }
          if (success) {
            router.replace(`/${spaceSlug}/feed`);
          } else {
            setIsProcessing(false);
            error({
              title: '체크인 작성 실패',
              message: '체크인 작성 중 오류가 발생했습니다. 다시 시도해주세요.',
            });
          }
        },
        onError: (err: unknown) => {
          setIsProcessing(false);
          // CHECKIN_ALREADY_EXISTS 에러의 경우에만 피드로 라우팅
          if (isErrorCode(err, ErrorCode.CHECKIN_ALREADY_EXISTS)) {
            router.replace(`/${spaceSlug}/feed`);
          }
        },
      }
    );
  };

  const handleScoreRequiredToast = () => {
    info({
      title: '점수를 먼저 선택해주세요 😊',
      message:
        '오늘의 컴디션 점수를 먼저 선택한 후 메시지를 작성해주세요. 점수를 매기면 마음을 더 잘 정리할 수 있어요!',
    });
  };

  // Todo 핸들러 함수들
  const handleUpdateYesterdayTodos = (updatedTodos: Todo[]) => {
    setYesterdayTodos(updatedTodos);
  };

  const handleUpdateTodayTodos = (updatedTodos: Todo[]) => {
    setTodayTodos(updatedTodos);
  };

  const handleToggleComplete = (todoId: string, isYesterday: boolean) => {
    if (isYesterday) {
      setYesterdayTodos(prev =>
        prev.map(todo =>
          todo.id === todoId ? { ...todo, completedAt: todo.completedAt ? null : new Date() } : todo
        )
      );
    } else {
      setTodayTodos(prev =>
        prev.map(todo =>
          todo.id === todoId ? { ...todo, completedAt: todo.completedAt ? null : new Date() } : todo
        )
      );
    }
  };

  return (
    <CheckInModalLayout isOpen={isOpen} onClose={onClose}>
      {/* <div className="border-b border-black/8 px-5 py-6 md:px-7 md:py-8">
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
        disabled={isPending || isProcessing}
        isLoading={isPending || isProcessing}
        onScoreRequiredToast={handleScoreRequiredToast}
      /> */}

      {/* Todo 컴포넌트 */}
      <div className="border-t border-black/8 px-5 py-6 md:px-7 md:py-8">
        <TodoContainer
          yesterdayTodos={yesterdayTodos}
          todayTodos={todayTodos}
          isEditable={true}
          onUpdateYesterdayTodos={handleUpdateYesterdayTodos}
          onUpdateTodayTodos={handleUpdateTodayTodos}
          onToggleComplete={handleToggleComplete}
          forceEditMode={true}
        />
      </div>
    </CheckInModalLayout>
  );
}
