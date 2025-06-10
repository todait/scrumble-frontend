'use client';

import { PostContent } from './PostContent';
import type { Post } from '../types/feed.types';

interface PostCardProps {
  post: Post;
  onReaction?: (postId: string, emoji: string) => void;
  onCommentClick?: (postId: string) => void;
  isSelected?: boolean;
}

export function PostCard({ post, onReaction, onCommentClick, isSelected = false }: PostCardProps) {
  return (
    <div className="border-b border-[rgba(34,34,34,0.08)]">
      <PostContent
        post={post}
        isSelected={isSelected}
        isDetailView={false}
        onReaction={onReaction}
        onCommentClick={onCommentClick}
      />
    </div>
  );
}