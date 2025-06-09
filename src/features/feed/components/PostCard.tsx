'use client';

import { RiPokerClubsFill, RiPokerDiamondsFill } from '@remixicon/react';
import { format, formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import Image from 'next/image';
import { useState } from 'react';
import type { Post } from '../types/feed.types';

interface PostCardProps {
  post: Post;
  onReaction?: (postId: string, emoji: string) => void;
  onCommentClick?: (postId: string) => void;
}

export function PostCard({ post, onReaction, onCommentClick }: PostCardProps) {
  const [showFullContent, setShowFullContent] = useState(false);
  const isCheckIn = post.type === 'checkin';
  const contentPreview =
    post.content.length > 200 ? post.content.slice(0, 200) + '...' : post.content;

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

  return (
    <div className="border-b border-[rgba(34,34,34,0.08)] bg-white p-[30px]">
      <div className="flex gap-[10px]">
        {/* 프로필 이미지 */}
        <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg border border-[rgba(34,34,34,0.08)]">
          {post.author.profileImage ? (
            <Image
              src={post.author.profileImage}
              alt={post.author.name}
              width={40}
              height={40}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gray-200 text-sm font-semibold">
              {post.author.name[0]}
            </div>
          )}
        </div>

        {/* 콘텐츠 영역 */}
        <div className="min-w-0 flex-1 space-y-[10px]">
          {/* 헤더 */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <div className="text-[15px] font-bold text-[#222222]">{post.author.name}</div>
              <div className="flex items-center gap-1">
                <div className="flex items-center gap-0.5">
                  {isCheckIn ? (
                    <>
                      <RiPokerClubsFill className="h-3 w-3 text-[#39CD32]" />
                      <span className="text-[13px] font-medium text-[#39CD32]">체크인</span>
                    </>
                  ) : (
                    <>
                      <RiPokerDiamondsFill className="h-3 w-3 text-[#009DFF]" />
                      <span className="text-[13px] font-medium text-[#009DFF]">체크아웃</span>
                    </>
                  )}
                </div>
                <span className="text-[13px] text-[#222222] opacity-40">
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
            <p className="whitespace-pre-wrap text-[15px] leading-[1.4] text-[#222222]">
              {showFullContent ? post.content : contentPreview}
            </p>
            {post.content.length > 200 && !showFullContent && (
              <button
                onClick={() => setShowFullContent(true)}
                className="mt-1 text-[15px] font-medium text-[#222222] opacity-80 hover:opacity-100"
              >
                ...더보기
              </button>
            )}
          </div>

          {/* 이미지 섹션 */}
          {post.images && post.images.length > 0 && (
            <div className="mt-2 min-w-0">
              {post.images.length === 1 ? (
                // 이미지 1개일 때 - 적당한 크기로 표시
                <div className="max-w-sm overflow-hidden rounded-lg border border-[#F1F1F1]">
                  <Image
                    src={post.images[0]}
                    alt="첨부 이미지"
                    width={320}
                    height={240}
                    className="h-auto w-full object-cover"
                    style={{ aspectRatio: '4/3' }}
                  />
                </div>
              ) : (
                // 이미지 여러 개일 때 - 수평 스크롤
                <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'thin' }}>
                  {post.images.map((image, index) => (
                    <div
                      key={index}
                      className="h-32 w-32 flex-shrink-0 overflow-hidden rounded-lg border border-[#F1F1F1]"
                    >
                      <Image
                        src={image}
                        alt={`첨부 이미지 ${index + 1}`}
                        width={128}
                        height={128}
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
                  onClick={() => onReaction?.(post.id, reaction.emoji)}
                  className={`flex items-center gap-1 rounded-full px-[10px] py-[6px] text-[13px] ${
                    reaction.userIds.includes('currentUserId') // TODO: 실제 현재 유저 ID로 변경
                      ? 'border border-[#9747FF] bg-[rgba(151,71,255,0.1)] text-[#9747FF]'
                      : 'bg-[rgba(241,241,241,0.5)] text-[#222222] hover:bg-[rgba(241,241,241,0.8)]'
                  }`}
                >
                  <span>{reaction.emoji}</span>
                  {reaction.count > 0 && <span>{reaction.count}</span>}
                </button>
              ))}
            </div>

            {/* 댓글 정보 */}
            {post.commentCount > 0 && (
              <button
                onClick={() => onCommentClick?.(post.id)}
                className="flex items-center gap-2 rounded-lg p-1"
              >
                <div className="flex -space-x-2">
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
                  <span className="text-[13px] leading-[1.5] text-[#222222] opacity-40">
                    {formatDistanceToNow(post.lastCommentTime, { addSuffix: true, locale: ko })}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
