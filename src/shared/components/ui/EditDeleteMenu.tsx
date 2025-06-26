'use client';

import { RiDeleteBinLine, RiEdit2Line, RiMore2Line } from '@remixicon/react';
import { forwardRef, useEffect, useRef, useState } from 'react';

interface EditDeleteMenuProps {
  onEdit: () => void;
  onDelete: () => void;
  showDesktop?: boolean;
  showMobile?: boolean;
  variant?: 'default' | 'comment';
}

export function EditDeleteMenu({
  onEdit,
  onDelete,
  showDesktop = true,
  showMobile = true,
  variant = 'default',
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
    onEdit();
  };

  const handleMobileDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setShowMobileMenu(false);
    onDelete();
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
                onEdit();
              }}
              className="flex h-[34px] w-[62px] items-center justify-center gap-1 rounded-lg hover:bg-[#F1F1F1]"
            >
              <RiEdit2Line className="h-4 w-4 text-[#222222]" />
              <span className="text-[13px] font-medium text-[#222222]">수정</span>
            </button>
            <button
              onClick={e => {
                e.stopPropagation();
                onDelete();
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
      {showDesktop && variant === 'comment' && (
        <div className="absolute right-0 top-0 z-30 hidden opacity-0 transition-opacity group-hover:opacity-100 md:block">
          <div className="flex items-center gap-1 rounded-lg bg-white p-1 shadow-[0px_2px_8px_rgba(0,0,0,0.08)]">
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
          </div>
        </div>
      )}

      {/* 모바일 더보기 메뉴 */}
      {showMobile && (
        <MobileMoreMenu
          ref={mobileMenuRef}
          showMenu={showMobileMenu}
          onMenuToggle={handleMobileMenuToggle}
          onEdit={handleMobileEdit}
          onDelete={handleMobileDelete}
          variant={variant}
        />
      )}
    </>
  );
}

// 모바일 더보기 메뉴 컴포넌트
interface MobileMoreMenuProps {
  showMenu: boolean;
  onMenuToggle: (e: React.MouseEvent) => void;
  onEdit: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
  variant?: 'default' | 'comment';
}

const MobileMoreMenu = forwardRef<HTMLDivElement, MobileMoreMenuProps>(
  ({ showMenu, onMenuToggle, onEdit, onDelete, variant = 'default' }, ref) => (
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
  )
);

MobileMoreMenu.displayName = 'MobileMoreMenu';