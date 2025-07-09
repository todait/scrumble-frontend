import { postsApi } from '@/shared/lib/api/posts';
import { useQuery } from '@tanstack/react-query';
import { postsKeys } from './postsKeys';

interface UsePostDateParams {
  spaceSlug: string;
  postId: string;
  enabled?: boolean;
}

export function usePostDate({ spaceSlug, postId, enabled = true }: UsePostDateParams) {
  return useQuery({
    queryKey: postsKeys.postDate(spaceSlug, postId),
    queryFn: () => postsApi.getPostDate(spaceSlug, postId),
    enabled: enabled && !!spaceSlug && !!postId,
    staleTime: 1000 * 60 * 5, // 5분
    gcTime: 1000 * 60 * 10, // 10분
    retry: 1,
  });
}
