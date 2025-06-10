'use client';

import { CheckInEditModal } from '@/features/checkin/components';
import { SimpleToast } from '@/shared/components/feedback';
import { DeleteConfirmDialog } from '@/shared/components/ui';
import { useAuthStore } from '@/shared/stores/auth.store';
import {
  RiArrowRightSLine,
  RiDeleteBinLine,
  RiEdit2Line,
  RiPokerClubsFill,
  RiPokerDiamondsFill,
} from '@remixicon/react';
import { format, formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import Image from 'next/image';
import { useState } from 'react';
import type { Post } from '../types/feed.types';

interface PostContentProps {
  post: Post;
  isSelected?: boolean;
  isDetailView?: boolean;
  onReaction?: (postId: string, emoji: string) => void;
  onCommentClick?: (postId: string) => void;
}

export function PostContent({
  post,
  isSelected = false,
  isDetailView = false,
  onReaction,
  onCommentClick,
}: PostContentProps) {
  const [showFullContent, setShowFullContent] = useState(isDetailView);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showToast, setShowToast] = useState<{ message: string; actionText?: string } | null>(null);
  const user = useAuthStore(state => state.user);
  const isMyPost = user?.id === post.author.id;
  const isCheckIn = post.type === 'checkin';
  const contentPreview =
    post.content.length > 200 ? post.content.slice(0, 200) + '...' : post.content;

  const handleEdit = () => {
    if (isCheckIn) {
      setShowEditModal(true);
    } else {
      console.log('체크아웃 수정은 아직 구현되지 않았습니다:', post.id);
    }
  };

  const handleDelete = () => {
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    console.log('Delete confirmed for post:', post.id);
    setShowDeleteDialog(false);
    setShowToast({ message: '해당 게시물이 삭제되었습니다' });
  };

  const handleEditSubmit = () => {
    setShowEditModal(false);
    setShowToast({
      message: '노트를 수정했습니다',
      actionText: '보기',
    });
  };

  const handleToastAction = () => {
    console.log('토스트 보기 버튼 클릭');
    setShowToast(null);
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return format(date, 'a h:mm', { locale: ko });
    }
    return format(date, 'M월 d일', { locale: ko });
  };

  const getConditionLabel = (score: number): string => {
    if (score >= 8) return '😊';
    if (score >= 6) return '🙂';
    if (score >= 4) return '😐';
    if (score >= 2) return '😔';
    return '😢';
  };

  const profileImageSize = isDetailView ? 48 : 40;
  const nameTextSize = isDetailView ? 'text-[17px]' : 'text-[15px]';
  const contentTextSize = isDetailView ? 'text-[16px] leading-[1.5]' : 'text-[15px] leading-[1.4]';
  const padding = isDetailView ? 'p-6' : 'p-[30px]';

  return (
    <>
      <div
        className={`group relative flex gap-[10px] ${padding} ${
          isSelected && !isDetailView
            ? 'bg-[rgba(151,71,255,0.04)]'
            : !isDetailView
              ? 'bg-white hover:bg-[rgba(151,71,255,0.04)]'
              : 'bg-white'
        }`}
      >
        {/* 호버 시 왼쪽 보라색 라인 (카드 뷰에서만) */}
        {!isDetailView && (
          <div
            className={`absolute left-0 top-0 h-full w-1 bg-[#9747FF] transition-opacity ${
              isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            }`}
          />
        )}

        {/* 내 포스트일 때 수정/삭제 버튼 - 호버 시 표시 (카드 뷰에서만) */}
        {isMyPost && !isDetailView && (
          <div className="absolute right-[30px] top-0 z-10 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100">
            <div className="flex h-[50px] w-[150px] items-center justify-center gap-[10px] rounded-lg bg-white p-2 shadow-[0px_2px_8px_rgba(0,0,0,0.08)]">
              <button
                onClick={e => {
                  e.stopPropagation();
                  handleEdit();
                }}
                className="flex h-[34px] w-[62px] items-center justify-center gap-1 rounded-lg hover:bg-[#F1F1F1]"
              >
                <RiEdit2Line className="h-4 w-4 text-[#222222]" />
                <span className="text-[13px] font-medium text-[#222222]">수정</span>
              </button>
              <button
                onClick={e => {
                  e.stopPropagation();
                  handleDelete();
                }}
                className="flex h-[34px] w-[62px] items-center justify-center gap-1 rounded-lg text-[#E04646] hover:bg-[rgba(224,70,70,0.04)]"
              >
                <RiDeleteBinLine className="h-4 w-4" />
                <span className="text-[13px] font-medium">삭제</span>
              </button>
            </div>
          </div>
        )}

        {/* 프로필 이미지 */}
        <div className="flex-shrink-0">
          <div
            className={`overflow-hidden rounded-lg border border-[rgba(34,34,34,0.08)]`}
            style={{ width: profileImageSize, height: profileImageSize }}
          >
            {post.author.profileImage ? (
              <Image
                src={post.author.profileImage}
                alt={post.author.name}
                width={profileImageSize}
                height={profileImageSize}
                className="h-full w-full object-cover"
              />
            ) : (
              <div
                className={`flex h-full w-full items-center justify-center bg-gray-200 font-semibold ${
                  isDetailView ? 'text-lg' : 'text-sm'
                }`}
              >
                {post.author.name[0]}
              </div>
            )}
          </div>
        </div>

        {/* 콘텐츠 영역 */}
        <div className="min-w-0 flex-1 space-y-[10px]">
          {/* 헤더 */}
          <div className="flex items-start justify-between gap-2">
            <div
              className="flex min-w-0 flex-1 flex-col justify-between"
              style={{ height: profileImageSize }}
            >
              {/* 이름 - 프로필 이미지 상단에서 0.5px 아래 */}
              <div
                className={`font-bold text-[#222222] ${nameTextSize} leading-none`}
                style={{ transform: 'translateY(2px)' }}
              >
                {post.author.name}
              </div>

              {/* 타입과 시간 - 프로필 이미지 하단에서 0.5px 위 */}
              <div className="flex items-center gap-1" style={{ transform: 'translateY(-1px)' }}>
                <div className="flex items-center gap-0.5">
                  {isCheckIn ? (
                    <>
                      <RiPokerClubsFill className="-mt-[0.5px] h-3 w-3 text-[#39CD32]" />
                      <span className="text-[13px] font-medium leading-none text-[#39CD32]">
                        체크인
                      </span>
                    </>
                  ) : (
                    <>
                      <RiPokerDiamondsFill className="-mt-[1px] h-3 w-3 text-[#009DFF]" />
                      <span className="text-[13px] font-medium leading-none text-[#009DFF]">
                        체크아웃
                      </span>
                    </>
                  )}
                </div>
                <span className="text-[13px] leading-none text-[#222222] opacity-40">
                  {formatTime(post.createdAt)}
                  {post.updatedAt && ' (수정됨)'}
                </span>
              </div>
            </div>
            {isCheckIn && 'conditionScore' in post && (
              <div className="flex-shrink-0 rounded border border-[rgba(34,34,34,0.08)] px-2 py-2">
                <span className="text-[15px] text-[#222222] opacity-80">
                  {post.conditionEmoji || getConditionLabel(post.conditionScore)}{' '}
                  {post.conditionScore}점
                </span>
              </div>
            )}
          </div>

          {/* 본문 */}
          <div className="py-2">
            <p className={`whitespace-pre-wrap text-[#222222] ${contentTextSize}`}>
              {showFullContent ? post.content : contentPreview}
            </p>
            {post.content.length > 200 && !showFullContent && (
              <button
                onClick={() => setShowFullContent(true)}
                className={`mt-1 font-medium text-[#222222] opacity-80 hover:opacity-100 ${contentTextSize}`}
              >
                ...더보기
              </button>
            )}
          </div>

          {/* 이미지 섹션 */}
          {post.images && post.images.length > 0 && (
            <div className="mt-2 min-w-0">
              {post.images.length === 1 ? (
                <div
                  className={`overflow-hidden rounded-lg border border-[#F1F1F1] ${
                    isDetailView ? 'max-w-md' : 'max-w-sm'
                  }`}
                >
                  <Image
                    src={post.images[0]}
                    alt="첨부 이미지"
                    width={isDetailView ? 400 : 320}
                    height={isDetailView ? 300 : 240}
                    className="h-auto w-full object-cover"
                    style={{ aspectRatio: '4/3' }}
                  />
                </div>
              ) : (
                <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'thin' }}>
                  {post.images.map((image, index) => (
                    <div
                      key={index}
                      className={`flex-shrink-0 overflow-hidden rounded-lg border border-[#F1F1F1] ${
                        isDetailView ? 'h-40 w-40' : 'h-32 w-32'
                      }`}
                    >
                      <Image
                        src={image}
                        alt={`첨부 이미지 ${index + 1}`}
                        width={isDetailView ? 160 : 128}
                        height={isDetailView ? 160 : 128}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 리액션 및 댓글 섹션 */}
          <div className="flex flex-col gap-[10px] py-2">
            {/* 이모지 리액션 */}
            <div className="flex items-center gap-2">
              {post.reactions.map((reaction, index) => (
                <button
                  key={index}
                  onClick={e => {
                    e.stopPropagation();
                    onReaction?.(post.id, reaction.emoji);
                  }}
                  className={`flex items-center gap-1 rounded-full px-[10px] py-[6px] text-[13px] ${
                    reaction.userIds.includes('currentUserId')
                      ? 'border border-[#9747FF] bg-[rgba(151,71,255,0.1)] text-[#9747FF]'
                      : 'bg-[rgba(241,241,241,0.5)] text-[#222222] hover:bg-[rgba(241,241,241,0.8)]'
                  }`}
                >
                  <span>{reaction.emoji}</span>
                  {reaction.count > 0 && <span>{reaction.count}</span>}
                </button>
              ))}
            </div>

            {/* 댓글 정보 (카드 뷰에서만) */}
            {!isDetailView && post.commentCount > 0 && (
              <button
                onClick={e => {
                  e.stopPropagation();
                  onCommentClick?.(post.id);
                }}
                className="group/comment flex h-10 items-center gap-2 rounded-lg bg-white px-2"
              >
                <div className="flex gap-1">
                  {post.comments.slice(0, 3).map((comment, index) => (
                    <div
                      key={index}
                      className="h-8 w-8 overflow-hidden rounded-lg border border-[rgba(34,34,34,0.08)] bg-white"
                    >
                      {comment.author.profileImage ? (
                        <Image
                          src={comment.author.profileImage}
                          alt={comment.author.name}
                          width={32}
                          height={32}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gray-200 text-xs">
                          {comment.author.name[0]}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <span className="text-[13px] leading-[1.5] text-[#222222] opacity-80">
                  {post.commentCount}개의 댓글
                </span>
                {post.lastCommentTime && (
                  <>
                    <span className="text-[13px] leading-[1.5] text-[#222222] opacity-40 group-hover:hidden">
                      {formatDistanceToNow(post.lastCommentTime, { addSuffix: true, locale: ko })}
                    </span>
                    <span className="hidden text-[13px] leading-[1.5] text-[#222222] opacity-40 group-hover:block">
                      보기
                    </span>
                  </>
                )}
                <RiArrowRightSLine className="ml-auto h-4 w-4 text-[#222222] opacity-0 transition-opacity group-hover:opacity-60" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 삭제 확인 다이얼로그 */}
      <DeleteConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleConfirmDelete}
      />

      {/* 체크인 수정 모달 */}
      {isCheckIn && 'conditionScore' in post && (
        <CheckInEditModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          post={post}
          onSubmit={handleEditSubmit}
        />
      )}

      {/* 토스트 메시지 */}
      {showToast && (
        <SimpleToast
          message={showToast.message}
          actionText={showToast.actionText}
          onAction={showToast.actionText ? handleToastAction : undefined}
          onClose={() => setShowToast(null)}
        />
      )}
    </>
  );
}
