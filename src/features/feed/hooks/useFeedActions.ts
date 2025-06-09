import { useRouter } from 'next/navigation';

export const useFeedActions = (spaceId: string) => {
  const router = useRouter();

  const handleOpenCheckOut = () => {
    router.push(`/${spaceId}/posts/checkouts/new`);
  };

  const handleReaction = (postId: string, emoji: string) => {
    console.log('Reaction:', postId, emoji);
    // TODO: API 호출로 리액션 추가/제거
  };

  const handleCommentClick = (postId: string) => {
    console.log('Open comments:', postId);
    // TODO: 댓글 모달 열기
  };

  const handleViewSummaryClick = () => {
    console.log('View summary');
    // TODO: 활동 요약 페이지로 이동
  };

  const handleDateClick = () => {
    console.log('Open date picker');
    // TODO: 날짜 선택 모달 열기
  };

  return {
    handleOpenCheckOut,
    handleReaction,
    handleCommentClick,
    handleViewSummaryClick,
    handleDateClick,
  };
};