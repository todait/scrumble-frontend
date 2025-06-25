'use client';

import { CheckInEditModal } from '@/features/checkin/components';
import { CheckOutEditModal } from '@/features/checkout/components';
import { SimpleToast } from '@/shared/components/feedback';
import {
  DeleteConfirmDialog,
  ImageGallery,
  ImageViewer,
  ProfileImage,
  StatusBadge,
} from '@/shared/components/ui';
import { useAuth } from '@/shared/hooks/auth/useAuth';
import { useDeleteCheckIn, useDeleteCheckOut, useExistsCheckin } from '@/shared/hooks/queries';
import { useToggleReaction } from '@/shared/hooks/queries/useReactions';
import { formatDateToAPIString, formatTime, getConditionLabel } from '@/shared/utils';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import {
  RiArrowRightSLine,
  RiDeleteBinLine,
  RiEdit2Line,
  RiEmojiStickerLine,
  RiMore2Line,
} from '@remixicon/react';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import router from 'next/router';
import { forwardRef, useCallback, useEffect, useRef, useState } from 'react';
import type { EmojiData, Post } from '../types/feed.types';
import { getPostContent } from '../types/feed.types';

interface PostContentProps {
  spaceSlug: string;
  post: Post;
  isSelected?: boolean;
  isDetailView?: boolean;
  onReaction?: (postId: string, emoji: string) => void; // 옵셔널 - 컴포넌트에서 직접 처리하거나 상위에서 처리 가능
  onCommentClick?: (postId: string) => void;
}

export function PostContent({
  spaceSlug,
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
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emojiPickerPosition, setEmojiPickerPosition] = useState<{
    top: number;
    right?: number;
    left?: number;
  }>({ top: 0, right: 0 });
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const emojiButtonRef = useRef<HTMLButtonElement>(null);
  const { user } = useAuth();
  const isMyPost = user?.id === post.author.id;
  const isCheckIn = post.type === 'checkin';
  const isCheckOut = post.type === 'checkout';
  const content = getPostContent(post) || '';
  const contentPreview = content && content.length > 200 ? content.slice(0, 200) + '...' : content;
  const { mutate: deleteCheckIn, isPending: isDeleteCheckInPending } = useDeleteCheckIn();
  const { mutate: deleteCheckOut, isPending: isDeleteCheckOutPending } = useDeleteCheckOut();
  const { refetch: refetchExistsCheckin } = useExistsCheckin({
    spaceSlug,
    date: formatDateToAPIString(new Date()),
  });
  const { mutate: toggleReaction } = useToggleReaction(spaceSlug);
  const imageUrls = post.images?.map(image => image.url);

  const calculateEmojiPickerPosition = useCallback(() => {
    if (!emojiButtonRef.current) return;

    const buttonRect = emojiButtonRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const pickerWidth = 360;
    const pickerHeight = 233; // 350 * 2/3

    // 화면 공간 확인
    const bottomSpace = viewportHeight - buttonRect.bottom;

    // 세로 위치 결정
    const top =
      bottomSpace < pickerHeight + 16
        ? Math.max(8, buttonRect.top - pickerHeight - 8)
        : buttonRect.bottom + 8;

    // 가로 위치 결정 - 아이콘 바로 밑에서 시작하여 오른쪽으로
    const position: { top: number; right?: number; left?: number } = { top };

    // 아이콘의 왼쪽 모서리에서 시작
    let leftPosition = buttonRect.left;

    // 피커가 화면 오른쪽을 벗어나는지 확인
    if (leftPosition + pickerWidth > viewportWidth - 8) {
      // 화면 오른쪽을 벗어나면 오른쪽 정렬로 조정
      leftPosition = viewportWidth - pickerWidth - 8;
    }

    // 최소 8px 여백 확보
    leftPosition = Math.max(8, leftPosition);

    position.left = leftPosition;

    setEmojiPickerPosition(position);
  }, []);

  // 모바일 메뉴 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setShowMobileMenu(false);
      }
    };

    if (showMobileMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showMobileMenu]);

  // 이모지 피커 외부 클릭 시 닫기 및 스크롤/리사이즈 시 위치 업데이트
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      // 버튼이나 피커 내부 클릭이 아닌 경우에만 닫기
      if (
        emojiButtonRef.current &&
        !emojiButtonRef.current.contains(target) &&
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(target)
      ) {
        setShowEmojiPicker(false);
      }
    };

    const handleScrollOrResize = () => {
      if (showEmojiPicker) {
        calculateEmojiPickerPosition();
      }
    };

    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('scroll', handleScrollOrResize, true);
      window.addEventListener('resize', handleScrollOrResize);

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        window.removeEventListener('scroll', handleScrollOrResize, true);
        window.removeEventListener('resize', handleScrollOrResize);
      };
    }
  }, [showEmojiPicker, calculateEmojiPickerPosition]);

  const handleEdit = () => {
    setShowEditModal(true);
  };

  const handleDelete = () => {
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    const onSuccess = () => {
      setShowDeleteDialog(false);
      setShowToast({ message: '해당 게시물이 삭제되었습니다' });
    };

    if (isCheckIn) {
      deleteCheckIn(
        {
          spaceSlug,
          postId: post.id,
        },
        {
          onSuccess: async () => {
            let success = false;
            for (let i = 0; i < 5; i++) {
              const { data: existsCheckin } = await refetchExistsCheckin();
              if (existsCheckin?.exists === true) {
                success = true;
                break;
              }
              await new Promise(res => setTimeout(res, 200)); // 200ms 대기 후 재시도
            }
            if (success) {
              router.replace(`/${spaceSlug}/posts/checkins/new`);
            }
          },
        }
      );
    }

    if (isCheckOut) {
      deleteCheckOut(
        {
          spaceSlug,
          postId: post.id,
        },
        { onSuccess }
      );
    }
  };

  const handleEditSubmit = () => {
    setShowEditModal(false);
    setShowToast({
      message: '노트를 수정했습니다',
      actionText: '보기',
    });
  };

  const handleToastAction = () => {
    setShowToast(null);
  };

  const handleMobileMenuToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setShowMobileMenu(!showMobileMenu);
  };

  const handleMobileEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setShowMobileMenu(false);
    handleEdit();
  };

  const handleMobileDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setShowMobileMenu(false);
    handleDelete();
  };

  const handleEmojiClick = (emoji: EmojiData, event?: React.MouseEvent<HTMLDivElement>) => {
    const shiftPressed = !!event?.shiftKey; // ⇧ 키 여부

    // 상위 컴포넌트에서 리액션 처리를 원하는 경우
    if (onReaction) {
      onReaction(post.id, emoji.native);
    } else {
      toggleReaction(
        {
          targetType: 'posts',
          targetId: post.id,
          emoji: emoji.native,
          currentReactions: post.reactions,
        },
        {
          onError: error => {
            console.error('[PostContent] 리액션 실패:', error);
            setShowToast({
              message: '리액션 추가에 실패했습니다. 다시 시도해주세요.',
            });
          },
        }
      );
    }

    // ② Shift가 눌리지 않았을 때만 픽커 닫기
    if (!shiftPressed) {
      setShowEmojiPicker(false);
    }
  };

  const handleEmojiPickerToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (!showEmojiPicker) {
      calculateEmojiPickerPosition();
    }

    setShowEmojiPicker(!showEmojiPicker);
  };

  const profileImageSize = isDetailView ? 48 : 40;
  const nameTextSize = isDetailView ? 'text-lg md:text-[17px]' : 'text-base md:text-[15px]';
  const contentTextSize = isDetailView
    ? 'text-base leading-[1.5] md:text-[16px] md:leading-[1.5]'
    : 'text-base leading-[1.4] md:text-[15px] md:leading-[1.4]';
  const padding = isDetailView ? 'p-4 md:p-6' : 'p-5 md:p-[30px]';

  // 모바일 더보기 메뉴 컴포넌트
  const MobileMoreMenu = forwardRef<
    HTMLDivElement,
    {
      showMenu: boolean;
      onMenuToggle: (e: React.MouseEvent) => void;
      onEdit: (e: React.MouseEvent) => void;
      onDelete: (e: React.MouseEvent) => void;
    }
  >(({ showMenu, onMenuToggle, onEdit, onDelete }, ref) => (
    <div ref={ref} className="relative md:hidden">
      <button
        onClick={onMenuToggle}
        className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-[rgba(34,34,34,0.08)]"
      >
        <RiMore2Line className="h-5 w-5 text-[#222222] opacity-60" />
      </button>

      {/* 모바일 드롭다운 메뉴 */}
      {showMenu && (
        <div className="absolute right-0 top-full z-30 mt-1 flex min-w-[120px] flex-col rounded-lg bg-white p-1 shadow-[0px_4px_20px_rgba(0,0,0,0.15)]">
          <button
            onClick={onEdit}
            className="flex items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-[#F1F1F1]"
          >
            <RiEdit2Line className="h-4 w-4 text-[#222222]" />
            <span className="font-medium text-[#222222]">수정</span>
          </button>
          <button
            onClick={onDelete}
            className="flex items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-[#E04646] transition-colors hover:bg-[rgba(224,70,70,0.04)]"
          >
            <RiDeleteBinLine className="h-4 w-4" />
            <span className="font-medium">삭제</span>
          </button>
        </div>
      )}
    </div>
  ));

  MobileMoreMenu.displayName = 'MobileMoreMenu';

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
        {/* 선택 시 왼쪽 보라색 라인 (카드 뷰에서만) */}
        {!isDetailView && isSelected && (
          <div className="absolute left-0 top-0 h-full w-1 bg-[#9747FF]" />
        )}

        {/* 내 포스트일 때 수정/삭제 버튼 - 데스크톱 호버 메뉴 (카드 뷰에서만) */}
        {isMyPost && !isDetailView && (
          <div className="absolute right-[10px] top-[10px] z-10 hidden opacity-0 transition-opacity group-hover:opacity-100 md:block">
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
          <ProfileImage
            src={post.author.profileImage}
            alt={post.author.name}
            size={profileImageSize}
          />
        </div>

        {/* 콘텐츠 영역 */}
        <div className="min-w-0 flex-1 space-y-[10px] overflow-hidden">
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
                <StatusBadge type={isCheckIn ? 'checkin' : 'checkout'} />
                <span className="text-sm leading-none text-[#222222] opacity-40 md:text-[13px]">
                  {formatTime(post.createdAt)}
                  {post.updatedAt &&
                    new Date(post.updatedAt).getTime() - new Date(post.createdAt).getTime() >
                      1000 &&
                    ' (수정됨)'}
                </span>
              </div>
            </div>

            {/* 체크인 점수 + 더보기 메뉴 */}
            {isCheckIn && 'conditionScore' in post && (
              <div className="flex flex-shrink-0 items-center gap-2">
                <div className="rounded border border-[rgba(34,34,34,0.08)] px-2 py-2">
                  <span className="text-base text-[#222222] opacity-80 md:text-[15px]">
                    {post.conditionEmoji || getConditionLabel(post.conditionScore)}{' '}
                    {post.conditionScore}점
                  </span>
                </div>

                {/* 모바일 더보기 메뉴 - 내 포스트일 때만 표시 */}
                {isMyPost && !isDetailView && (
                  <MobileMoreMenu
                    ref={mobileMenuRef}
                    showMenu={showMobileMenu}
                    onMenuToggle={handleMobileMenuToggle}
                    onEdit={handleMobileEdit}
                    onDelete={handleMobileDelete}
                  />
                )}
              </div>
            )}

            {/* 체크아웃 더보기 메뉴 - 체크인 점수가 없을 때 */}
            {isCheckOut && isMyPost && !isDetailView && (
              <div className="flex-shrink-0">
                <MobileMoreMenu
                  ref={mobileMenuRef}
                  showMenu={showMobileMenu}
                  onMenuToggle={handleMobileMenuToggle}
                  onEdit={handleMobileEdit}
                  onDelete={handleMobileDelete}
                />
              </div>
            )}
          </div>

          {/* 본문 */}
          <div className="py-2">
            {showFullContent ? (
              <p className={`whitespace-pre-wrap text-[#222222] ${contentTextSize}`}>{content}</p>
            ) : (
              <p className={`whitespace-pre-wrap text-[#222222] ${contentTextSize}`}>
                {content.length > 200 ? (
                  <>
                    {contentPreview.replace(/\.\.\.$/, '')}
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        setShowFullContent(true);
                      }}
                      className="ml-1 text-base font-medium text-[#A0A0A0] hover:text-[#808080] md:text-[15px]"
                    >
                      ...더보기
                    </button>
                  </>
                ) : (
                  content
                )}
              </p>
            )}
          </div>

          {/* 이미지 섹션 */}
          {post.images && post.images.length > 0 && (
            <ImageGallery
              images={post.images}
              className="mt-2"
              onClick={(index, event) => {
                // 이벤트 전파를 막고 이미지 뷰어 열기
                event.stopPropagation();
                event.preventDefault();
                setSelectedImageIndex(index);
                // setTimeout을 사용하여 다음 이벤트 루프에서 실행
                setTimeout(() => {
                  setImageViewerOpen(true);
                }, 0);
              }}
            />
          )}

          {/* 리액션 및 댓글 섹션 */}
          <div className="flex flex-col gap-[10px] py-2">
            {/* 이모지 리액션 */}
            <div className="flex flex-wrap items-center gap-x-2 gap-y-2">
              {post.reactions.map((reaction, index) => (
                <button
                  key={`${post.id}-${reaction.emoji}-${index}`}
                  onClick={e => {
                    e.stopPropagation();
                    // 상위 컴포넌트에서 리액션 처리를 원하는 경우
                    if (onReaction) {
                      onReaction(post.id, reaction.emoji);
                    } else {
                      // 컴포넌트에서 직접 리액션 API 호출
                      toggleReaction(
                        {
                          targetType: 'posts',
                          targetId: post.id,
                          emoji: reaction.emoji,
                          currentReactions: post.reactions,
                        },
                        {
                          onError: error => {
                            console.error('[PostContent] 리액션 토글 실패:', error);
                            setShowToast({
                              message: '리액션 처리에 실패했습니다. 다시 시도해주세요.',
                            });
                          },
                        }
                      );
                    }
                  }}
                  className={`flex items-center gap-1 rounded-2xl border px-[10px] py-[6px] text-sm transition-colors md:text-[13px] ${
                    reaction.userIds.includes(user?.id || '')
                      ? 'border-[#9747FF] bg-[rgba(151,71,255,0.1)] text-[#9747FF]'
                      : 'border-transparent bg-[rgba(241,241,241,0.5)] text-[#222222] hover:bg-[rgba(241,241,241,0.8)]'
                  } `}
                >
                  <span>{reaction.emoji}</span>
                  {reaction.count > 0 && <span>{reaction.count}</span>}
                </button>
              ))}

              {/* 이모지 추가 버튼 - 항상 표시 */}
              <div>
                <button
                  ref={emojiButtonRef}
                  onClick={handleEmojiPickerToggle}
                  className={`flex h-[26px] w-[36px] items-center justify-center rounded-2xl bg-[rgba(241,241,241,0.5)] text-[#222222] opacity-50 transition-all hover:bg-[rgba(241,241,241,0.8)] hover:opacity-100`}
                >
                  <RiEmojiStickerLine className="h-4 w-4" />
                </button>

                {/* 이모지 피커 */}
                {showEmojiPicker && (
                  <div
                    ref={emojiPickerRef}
                    className="fixed z-[9999]"
                    style={{
                      top: `${emojiPickerPosition.top}px`,
                      ...(emojiPickerPosition.right !== undefined && {
                        right: `${emojiPickerPosition.right}px`,
                      }),
                      ...(emojiPickerPosition.left !== undefined && {
                        left: `${emojiPickerPosition.left}px`,
                      }),
                    }}
                    onClick={e => {
                      e.stopPropagation();
                      e.preventDefault();
                    }}
                  >
                    <div className="overflow-hidden rounded-lg shadow-[0px_4px_20px_rgba(0,0,0,0.15)]">
                      <Picker
                        data={data}
                        onEmojiSelect={(
                          emoji: EmojiData,
                          event: React.MouseEvent<HTMLDivElement>
                        ) => handleEmojiClick(emoji, event)}
                        autoFocus={false}
                        searchPosition="sticky"
                        navPosition="bottom"
                        previewPosition="none"
                        skinTonePosition="none"
                        set="native"
                        theme="light"
                        emojiButtonSize={34}
                        emojiSize={28}
                        perLine={9}
                        maxFrequentRows={2}
                        categories={[
                          'frequent',
                          'people',
                          'nature',
                          'foods',
                          'activity',
                          'places',
                          'objects',
                          'symbols',
                          'flags',
                        ]}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 댓글 정보 (카드 뷰에서만) */}
            {!isDetailView && post.commentCount > 0 && (
              <button
                onClick={e => {
                  e.stopPropagation();
                  e.preventDefault();
                  onCommentClick?.(post.id);
                }}
                className="group/comment flex h-10 items-center gap-2 rounded-lg bg-white px-2"
              >
                <div className="flex gap-1">
                  {post.comments
                    .slice(-5) // 최신 5개 댓글
                    .reverse() // 최신순으로 정렬
                    .map((comment, index) => (
                      <ProfileImage
                        key={`${post.id}-comment-${comment.id}-${index}`}
                        src={comment.author.profileImage}
                        alt={comment.author.name}
                        size={32}
                        className="bg-white"
                      />
                    ))}
                </div>
                <span className="text-sm leading-[1.5] text-[#222222] opacity-80 md:text-[13px]">
                  {post.commentCount}개의 댓글
                </span>
                {post.lastCommentTime && (
                  <>
                    <span className="text-sm leading-[1.5] text-[#222222] opacity-40 group-hover:hidden md:text-[13px]">
                      {formatDistanceToNow(post.lastCommentTime, { addSuffix: true, locale: ko })}
                    </span>
                    <span className="hidden text-sm leading-[1.5] text-[#222222] opacity-40 group-hover:block md:text-[13px]">
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
        isLoading={isDeleteCheckInPending || isDeleteCheckOutPending}
      />

      {/* 체크인 수정 모달 */}
      {isCheckIn && 'conditionScore' in post && (
        <CheckInEditModal
          spaceSlug={spaceSlug}
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          post={post}
          onSubmit={handleEditSubmit}
        />
      )}

      {/* 체크아웃 수정 모달 */}
      {isCheckOut && 'reflectionText' in post && (
        <CheckOutEditModal
          spaceSlug={spaceSlug}
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

      {/* 이미지 뷰어 */}
      {imageUrls && imageUrls.length > 0 && (
        <ImageViewer
          images={imageUrls}
          initialIndex={selectedImageIndex}
          isOpen={imageViewerOpen}
          onClose={() => setImageViewerOpen(false)}
        />
      )}
    </>
  );
}
