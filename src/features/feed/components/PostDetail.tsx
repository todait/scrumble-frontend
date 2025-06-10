'use client';

import { RiCloseLine } from '@remixicon/react';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import Image from 'next/image';
import { PostContent } from './PostContent';
import type { Post } from '../types/feed.types';

interface PostDetailProps {
  post: Post;
  onClose: () => void;
}

export function PostDetail({ post, onClose }: PostDetailProps) {
  const isCheckIn = post.type === 'checkin';

  return (
    <div className="flex h-full flex-col">
      {/* 헤더 */}
      <div className="flex items-center justify-between border-b border-[rgba(34,34,34,0.08)] px-6 py-5">
        <h2 className="text-lg font-bold text-[#222222]">
          {post.author.name}님의 {isCheckIn ? '체크인' : '체크아웃'}
        </h2>
        <button
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-[rgba(34,34,34,0.08)] transition-colors"
        >
          <RiCloseLine className="h-5 w-5 text-[#222222]" />
        </button>
      </div>

      {/* 포스트 내용 */}
      <div className="flex-1 overflow-y-auto">
        <PostContent
          post={post}
          isDetailView={true}
          onReaction={(postId, emoji) => {
            console.log('Reaction in detail:', postId, emoji);
          }}
        />

        {/* 댓글 섹션 */}
        {post.commentCount > 0 && (
          <div className="border-t border-[rgba(34,34,34,0.08)] p-6">
            <h3 className="mb-4 text-[16px] font-bold text-[#222222]">
              댓글 {post.commentCount}개
            </h3>
            <div className="space-y-4">
              {post.comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <div className="h-8 w-8 flex-shrink-0 overflow-hidden rounded-lg border border-[rgba(34,34,34,0.08)]">
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
                  <div className="flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <span className="text-[14px] font-bold text-[#222222]">
                        {comment.author.name}
                      </span>
                      <span className="text-[13px] text-[#222222] opacity-40">
                        {formatDistanceToNow(comment.createdAt, { addSuffix: true, locale: ko })}
                      </span>
                    </div>
                    <p className="text-[14px] text-[#222222]">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}