'use client';

import { ProfileImage } from '@/shared/components/ui';
import { useAuth } from '@/shared/contexts/AuthContext';

interface Comment {
  id: string;
  content: string;
  createdAt: Date;
  author: {
    id: string;
    name: string;
    profileImage?: string | null;
  };
}

interface PostCommentSectionProps {
  postAuthorName: string;
  comments?: Comment[];
  onCommentClick?: (action: 'scroll' | 'focus') => void;
  postType: 'checkin' | 'checkout';
}

export function PostCommentSection({
  postAuthorName,
  comments = [],
  onCommentClick,
  postType,
}: PostCommentSectionProps) {
  const { currentSpaceMember } = useAuth();

  // 최신 댓글 2개 가져오기 (배열 끝에서 2개)
  const latestComments = comments.slice(-2);

  // 댓글 내용에서 이미지 제거하고 텍스트만 추출
  const extractTextContent = (content: string) => {
    // 간단한 이미지 태그 제거 (필요시 더 정교한 처리 가능)
    return content.replace(/<img[^>]*>/g, '').trim();
  };

  const postTypeText = postType === 'checkin' ? '체크인' : '체크아웃';

  return (
    <div className="space-y-2.5 py-5">
      {/* 최신 댓글이 있을 때 헤더 표시 */}
      {latestComments.length > 0 && (
        <>
          {/* 최신 댓글 헤더 */}
          <div className="flex items-center">
            <span className="text-[13px] font-normal leading-[140%] text-[#6E6E73]">최신 댓글</span>
            <div className="ml-2.5 flex-1 border-b border-dashed border-[#1D1D1F]/[0.08]" />
          </div>

          {/* 최신 댓글 목록 */}
          {latestComments.map(comment => {
            const textContent = extractTextContent(comment.content);
            return (
              <button
                key={comment.id}
                onClick={e => {
                  e.stopPropagation();
                  e.preventDefault();
                  onCommentClick?.('scroll');
                }}
                className="flex w-full items-center gap-2 py-1 text-left transition-opacity hover:opacity-70"
              >
                <ProfileImage
                  src={comment.author.profileImage ?? undefined}
                  alt={comment.author.name}
                  size={20}
                />
                <span className="text-[14px] font-bold leading-[150%] text-[#1D1D1F]/80">
                  {comment.author.name}
                </span>
                <span className="flex-1 truncate text-[14px] font-normal leading-[150%] text-[#1D1D1F]/80">
                  {textContent}
                </span>
              </button>
            );
          })}
        </>
      )}

      {/* 코멘트 남기기 유도 메시지 */}
      <button
        onClick={e => {
          e.stopPropagation();
          e.preventDefault();
          onCommentClick?.('focus');
        }}
        className="flex items-center gap-2 py-1 transition-opacity hover:opacity-70"
      >
        <ProfileImage
          src={currentSpaceMember?.avatarURL}
          alt={currentSpaceMember?.name || ''}
          size={20}
        />
        <span className="text-[14px] font-normal leading-[150%] text-[#1D1D1F]/40">
          {postAuthorName}님의 {postTypeText}에 가볍게 코멘트를 남겨보세요
        </span>
      </button>
    </div>
  );
}
