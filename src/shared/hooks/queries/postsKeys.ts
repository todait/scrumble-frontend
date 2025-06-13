export const postsKeys = {
  all: ['posts'] as const,
  lists: () => [...postsKeys.all, 'list'] as const,
  list: (spaceSlug: string, filters?: Record<string, unknown>) =>
    [...postsKeys.lists(), spaceSlug, filters] as const,
  existsCheckin: (spaceSlug: string, date: string) =>
    [...postsKeys.all, 'existsCheckin', spaceSlug, date] as const,
};
