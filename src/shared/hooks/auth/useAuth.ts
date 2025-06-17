// Re-export from context for backward compatibility
export { useAuth, AuthProvider } from '@/shared/contexts/AuthContext';

// Legacy hooks (kept for backwards compatibility but not recommended)
import { ROUTES } from '@/shared/constants';
import { authApi } from '@/shared/lib/api/auth';
import { TokenManager } from '@/shared/lib/token';
import { authRetry } from '@/shared/utils/query';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { authKeys } from '../queries/authKeys';

export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: authApi.logout,
    onMutate: async () => {
      await queryClient.cancelQueries();
    },
    onSettled: async () => {
      TokenManager.clearTokens();
      queryClient.clear();
      router.replace(ROUTES.AUTH);
    },
  });
}

export function useValidateToken() {
  return useQuery({
    queryKey: authKeys.validate(),
    queryFn: authApi.validateToken,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: authRetry,
  });
}