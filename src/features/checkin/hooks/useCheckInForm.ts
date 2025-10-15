// 체크인 생성/수정 로직을 공통화한 훅
// create 모드와 edit 모드를 지원하며 각각 useCreateCheckIn, useUpdateCheckIn mutation 사용
import { useState } from 'react';
import { useCreateCheckIn, useUpdateCheckIn } from '@/shared/hooks/queries/usePosts';
import type { ImageMetadata } from '@/shared/types/upload.types';

interface UseCheckInFormProps {
  mode: 'create' | 'edit';
  postId?: string;
  initialData?: {
    score: number;
    message: string;
    messageJson?: any;
    images?: ImageMetadata[];
  };
  onSuccess?: (postId: string) => void;
  onError?: (error: unknown) => void;
}

interface CheckInFormValues {
  score: number;
  message: string;
  messageJson?: any;
  images: ImageMetadata[];
}

export const useCheckInForm = ({
  mode,
  postId,
  initialData,
  onSuccess,
  onError,
}: UseCheckInFormProps) => {
  const [values, setValues] = useState<CheckInFormValues>({
    score: initialData?.score || 0,
    message: initialData?.message || '',
    messageJson: initialData?.messageJson,
    images: initialData?.images || [],
  });

  const createMutation = useCreateCheckIn();
  const updateMutation = useUpdateCheckIn();

  const isLoading = mode === 'create' ? createMutation.isPending : updateMutation.isPending;

  const setValue = <K extends keyof CheckInFormValues>(
    key: K,
    value: CheckInFormValues[K]
  ) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const save = async (data?: { score?: number; message?: string; messageJson?: any; images?: ImageMetadata[] }, postedDate?: string) => {
    try {
      const finalData = {
        score: data?.score ?? values.score,
        message: data?.message ?? values.message,
        messageJson: data?.messageJson,
        images: data?.images ?? values.images,
      };

      if (mode === 'create') {
        const result = await createMutation.mutateAsync({
          conditionScore: finalData.score,
          conditionText: finalData.message,
          conditionTextJson: finalData.messageJson,
          images: finalData.images,
          ...(postedDate && { postedDate }),
        });
        onSuccess?.(result.post.id);
      } else if (mode === 'edit' && postId) {
        await updateMutation.mutateAsync({
          postId,
          conditionScore: finalData.score,
          conditionText: finalData.message,
          conditionTextJson: finalData.messageJson,
          images: finalData.images,
        });
        onSuccess?.(postId);
      }
    } catch (error) {
      onError?.(error);
      throw error;
    }
  };

  return {
    values,
    setValue,
    setValues,
    save,
    isLoading,
  };
};