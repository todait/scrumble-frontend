import { useRouter } from 'next/navigation';

import { ROUTES } from '@/shared/constants';
import { useAuthStore } from '@/shared/stores/auth.store';

import type { Post } from '../types/feed.types';
// TODO: API 연동 시 feedService import
// import { feedService } from '../services';

export const useFeedActions = (spaceId: string, posts: Post[], setPosts: (posts: Post[]) => void) => {
  const router = useRouter();
  const user = useAuthStore(state => state.user);

  const handleOpenCheckOut = () => {
    router.push(ROUTES.POST_CHECKOUT_NEW(spaceId));
  };

  const handleReaction = async (postId: string, emoji: string) => {
    if (!user) return;
    
    // TODO: API 연동 시 실제 API 호출
    // try {
    //   const existingReaction = findUserReaction(postId, emoji, user.id);
    //   
    //   if (existingReaction) {
    //     // 리액션 제거
    //     await feedService.removeReaction(postId, existingReaction.id);
    //   } else {
    //     // 리액션 추가
    //     await feedService.addReaction(postId, emoji);
    //   }
    //   
    //   // 성공 시 로컬 상태 업데이트 또는 데이터 다시 가져오기
    // } catch (error) {
    //   console.error('Reaction error:', error);
    //   // 에러 처리
    // }
    
    // 현재는 로컬 상태만 업데이트 (임시)
    const updatedPosts = posts.map(post => {
      if (post.id !== postId) return post;

      const updatedReactions = post.reactions.map(reaction => {
        if (reaction.emoji !== emoji) return reaction;

        const userIndex = reaction.userIds.indexOf(user.id);
        if (userIndex > -1) {
          // 사용자가 이미 반응했다면 제거
          return {
            ...reaction,
            count: Math.max(0, reaction.count - 1),
            userIds: reaction.userIds.filter(id => id !== user.id)
          };
        } else {
          // 사용자가 반응하지 않았다면 추가
          return {
            ...reaction,
            count: reaction.count + 1,
            userIds: [...reaction.userIds, user.id]
          };
        }
      });

      return {
        ...post,
        reactions: updatedReactions
      };
    });

    setPosts(updatedPosts);
  };

  const handleCommentClick = (postId: string) => {
    // TODO: API 연동 시 실제 댓글 작성 기능 구현
    // const handleAddComment = async (content: string) => {
    //   try {
    //     await feedService.addComment(postId, content);
    //     // 성공 시 피드 데이터 갱신
    //   } catch (error) {
    //     console.error('Comment error:', error);
    //   }
    // };
    
    // 타임스탬프를 추가하여 매번 다른 URL로 만들어 useEffect가 실행되도록 함
    const timestamp = Date.now();
    router.push(`${ROUTES.SPACE_FEED(spaceId)}?post=${postId}&comments=${timestamp}`, { scroll: false });
  };

  const handleViewSummaryClick = () => {
    // TODO: 활동 요약 페이지로 이동 (reports 페이지)
    router.push(ROUTES.SPACE_REPORTS(spaceId));
  };

  const handleDateClick = () => {
    // TODO: 날짜 선택 모달 열기
    // setIsDatePickerOpen(true);
  };

  return {
    handleOpenCheckOut,
    handleReaction,
    handleCommentClick,
    handleViewSummaryClick,
    handleDateClick,
  };
};