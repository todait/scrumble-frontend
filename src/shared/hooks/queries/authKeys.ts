export const authKeys = {
  all: ['auth'] as const,
  user: () => [...authKeys.all, 'user'] as const,
  userWithLatestSpace: () => [...authKeys.all, 'userWithLatestSpace'] as const,
  validate: () => [...authKeys.all, 'validate'] as const,
};
