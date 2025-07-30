import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '@/shared/lib/api/notifications';
import { notificationKeys } from '@/shared/hooks/queries/useNotifications';
import { useToast } from '@/shared/hooks/useToast';

interface MarkAsReadParams {
  spaceId: string;
  notificationId: string;
}

/**
 * 단일 알림을 읽음으로 표시하는 mutation 훅
 */
export const useMarkAsRead = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ spaceId, notificationId }: MarkAsReadParams) => {
      try {
        // bulkMarkAsRead API를 사용하여 단일 알림 처리
        return await notificationsApi.bulkMarkAsRead({
          notificationIds: [notificationId],
        });
      } catch (error: any) {
        console.error('알림 읽음 처리 실패:', error);

        // 네트워크 에러 처리
        if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network')) {
          throw new Error('네트워크 연결을 확인해주세요.');
        }

        // 권한 에러 처리
        if (error.status === 401 || error.status === 403) {
          throw new Error('알림을 읽음으로 표시할 권한이 없습니다.');
        }

        throw error;
      }
    },
    onSuccess: () => {
      // 알림 목록 쿼리 무효화
      queryClient.invalidateQueries({
        queryKey: notificationKeys.lists(),
      });
    },
    onError: (error: any) => {
      console.error('알림 읽음 처리 실패:', error);
      const errorMessage = error.message || '알림을 읽음으로 표시하는 중 오류가 발생했습니다.';
      toast('error', { title: errorMessage });
    },
    retry: 2, // 최대 2번 재시도
  });
};