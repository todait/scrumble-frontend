'use client';

import {
  RiDeleteBinLine,
  RiEdit2Line,
  RiMore2Line,
  RiEmojiStickerLine,
  RiThumbUpLine,
} from '@remixicon/react';
import { forwardRef, useEffect, useRef, useState } from 'react';

interface EditDeleteMenuProps {
  onEdit?: () => void;
  onDelete?: () => void;
  onEmojiAdd?: () => void;
  showDesktop?: boolean;
  showMobile?: boolean;
  variant?: 'default' | 'comment';
  showEmojiButton?: boolean;
  emojiButtonRef?: React.RefObject<HTMLButtonElement | null>;
  showThumbButton?: boolean;
  onThumbAdd?: () => void;
}

export function EditDeleteMenu({
  onEdit,
  onDelete,
  onEmojiAdd,
  showDesktop = true,
  showMobile = true,
  variant = 'default',
  showEmojiButton = false,
  emojiButtonRef,
  showThumbButton = false,
  onThumbAdd,
}: EditDeleteMenuProps) {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

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

  const handleMobileMenuToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setShowMobileMenu(!showMobileMenu);
  };

  const handleMobileEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setShowMobileMenu(false);
    onEdit?.();
  };

  const handleMobileDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setShowMobileMenu(false);
    onDelete?.();
  };

  const handleMobileEmojiAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setShowMobileMenu(false);
    onEmojiAdd?.();
  };

  return (
    <>
      {/* 데스크톱 호버 메뉴 */}
      {showDesktop && variant === 'default' && (
        <div className="absolute right-[10px] top-[10px] z-10 hidden opacity-0 transition-opacity group-hover:opacity-100 md:block">
          <div className="flex h-[50px] w-[150px] items-center justify-center gap-[10px] rounded-lg bg-white p-2 shadow-[0px_2px_8px_rgba(0,0,0,0.08)]">
            <button
              onClick={e => {
                e.stopPropagation();
                onEdit?.();
              }}
              className="flex h-[34px] w-[62px] items-center justify-center gap-1 rounded-lg hover:bg-[#F1F1F1]"
            >
              <RiEdit2Line className="h-4 w-4 text-[#222222]" />
              <span className="text-[13px] font-medium text-[#222222]">수정</span>
            </button>
            <button
              onClick={e => {
                e.stopPropagation();
                onDelete?.();
              }}
              className="flex h-[34px] w-[62px] items-center justify-center gap-1 rounded-lg text-[#E04646] hover:bg-[rgba(224,70,70,0.04)]"
            >
              <RiDeleteBinLine className="h-4 w-4" />
              <span className="text-[13px] font-medium">삭제</span>
            </button>
          </div>
        </div>
      )}

      {/* 댓글용 데스크톱 호버 메뉴 */}
      {showDesktop && variant === 'comment' && (onEdit || onDelete || showEmojiButton || showThumbButton) && (
        <div className="absolute right-0 top-0 z-30 hidden opacity-0 transition-opacity group-hover:opacity-100 md:block">
          <div className="flex items-center gap-1 rounded-lg bg-white p-1 shadow-[0px_2px_8px_rgba(0,0,0,0.08)]">
            {showThumbButton && onThumbAdd && (
              <button
                onClick={e => {
                  e.stopPropagation();
                  onThumbAdd();
                }}
                className="flex h-7 w-7 items-center justify-center rounded hover:bg-[#F1F1F1]"
                title="엄지 리액션"
              >
                <RiThumbUpLine className="h-4 w-4 text-[#222222]" />
              </button>
            )}
            {onEdit && (
              <button
                onClick={e => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="flex h-7 w-7 items-center justify-center rounded hover:bg-[#F1F1F1]"
                title="수정"
              >
                <RiEdit2Line className="h-4 w-4 text-[#222222]" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={e => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="flex h-7 w-7 items-center justify-center rounded text-[#E04646] hover:bg-[rgba(224,70,70,0.04)]"
                title="삭제"
              >
                <RiDeleteBinLine className="h-4 w-4" />
              </button>
            )}
            {showEmojiButton && onEmojiAdd && (
              <button
                ref={emojiButtonRef}
                onClick={e => {
                  e.stopPropagation();
                  onEmojiAdd();
                }}
                className="flex h-7 w-7 items-center justify-center rounded hover:bg-[#F1F1F1]"
                title="이모지 추가"
              >
                <RiEmojiStickerLine className="h-4 w-4 text-[#222222]" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* 모바일 더보기 메뉴 */}
      {showMobile && (onEdit || onDelete || showEmojiButton || showThumbButton) && (
        <MobileMoreMenu
          ref={mobileMenuRef}
          showMenu={showMobileMenu}
          onMenuToggle={handleMobileMenuToggle}
          onEdit={onEdit ? handleMobileEdit : undefined}
          onDelete={onDelete ? handleMobileDelete : undefined}
          onEmojiAdd={showEmojiButton && onEmojiAdd ? handleMobileEmojiAdd : undefined}
          onThumbAdd={
            showThumbButton && onThumbAdd
              ? e => {
                  e.stopPropagation();
                  e.preventDefault();
                  setShowMobileMenu(false);
                  onThumbAdd?.();
                }
              : undefined
          }
          variant={variant}
          showEmojiButton={showEmojiButton}
          showThumbButton={showThumbButton}
        />
      )}
    </>
  );
}

// 모바일 더보기 메뉴 컴포넌트
interface MobileMoreMenuProps {
  showMenu: boolean;
  onMenuToggle: (e: React.MouseEvent) => void;
  onEdit?: (e: React.MouseEvent) => void;
  onDelete?: (e: React.MouseEvent) => void;
  onEmojiAdd?: (e: React.MouseEvent) => void;
  variant?: 'default' | 'comment';
  showEmojiButton?: boolean;
  onThumbAdd?: (e: React.MouseEvent) => void;
  showThumbButton?: boolean;
}

const MobileMoreMenu = forwardRef<HTMLDivElement, MobileMoreMenuProps>(
  (
    {
      showMenu,
      onMenuToggle,
      onEdit,
      onDelete,
      onEmojiAdd,
      variant = 'default',
      showEmojiButton = false,
      onThumbAdd,
      showThumbButton = false,
    },
    ref
  ) => (
    <div ref={ref} className="relative md:hidden">
      <button
        onClick={onMenuToggle}
        className={`flex ${variant === 'comment' ? 'h-7 w-7' : 'h-8 w-8'} items-center justify-center rounded-lg transition-colors hover:bg-[rgba(34,34,34,0.08)]`}
      >
        <RiMore2Line className={`${variant === 'comment' ? 'h-4 w-4' : 'h-5 w-5'} text-[#222222] opacity-60`} />
      </button>

      {/* 모바일 드롭다운 메뉴 */}
      {showMenu && (
        <div className="absolute right-0 top-full z-[9999] mt-1 flex min-w-[120px] flex-col rounded-lg bg-white p-1 shadow-[0px_4px_20px_rgba(0,0,0,0.15)]">
          {showThumbButton && onThumbAdd && (
            <button
              onClick={onThumbAdd}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-[#F1F1F1]"
            >
              <RiThumbUpLine className="h-4 w-4 text-[#222222]" />
              <span className="font-medium text-[#222222]">엄지 리액션</span>
            </button>
          )}
          {onEdit && (
            <button
              onClick={onEdit}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-[#F1F1F1]"
            >
              <RiEdit2Line className="h-4 w-4 text-[#222222]" />
              <span className="font-medium text-[#222222]">수정</span>
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-[#E04646] transition-colors hover:bg-[rgba(224,70,70,0.04)]"
            >
              <RiDeleteBinLine className="h-4 w-4" />
              <span className="font-medium">삭제</span>
            </button>
          )}
          {showEmojiButton && onEmojiAdd && (
            <button
              onClick={onEmojiAdd}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-[#F1F1F1]"
            >
              <RiEmojiStickerLine className="h-4 w-4 text-[#222222]" />
              <span className="font-medium text-[#222222]">이모지 추가</span>
            </button>
          )}
        </div>
      )}
    </div>
  )
);

MobileMoreMenu.displayName = 'MobileMoreMenu';
