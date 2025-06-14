'use client';

import Image from 'next/image';
// import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function SpaceSettingsPage() {
  // const params = useParams();
  // const spaceSlug = params.spaceSlug as string;

  // 원본 데이터 (서버에서 가져온 데이터)
  const [originalSpaceName] = useState('팀 스페이스');
  const [originalSpaceIcon] = useState<string | null>(null);

  // 로컬 편집 상태
  const [localSpaceName, setLocalSpaceName] = useState(originalSpaceName);
  const [localSpaceIcon, setLocalSpaceIcon] = useState<File | null>(null);
  const [localSpaceIconPreview, setLocalSpaceIconPreview] = useState<string | null>(
    originalSpaceIcon
  );
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempSpaceName, setTempSpaceName] = useState(originalSpaceName);

  // 변경사항 감지
  const [hasChanges, setHasChanges] = useState(false);

  // 삭제 다이얼로그 상태
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmName, setDeleteConfirmName] = useState('');

  useEffect(() => {
    const nameChanged = localSpaceName.trim() !== originalSpaceName.trim();
    const iconChanged = localSpaceIcon !== null;
    setHasChanges(nameChanged || iconChanged);
  }, [localSpaceName, localSpaceIcon, originalSpaceName]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // 파일 형식 검증
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        alert('JPG, PNG 형식의 이미지만 업로드 가능합니다.');
        return;
      }

      // 파일 크기 검증 (5MB 제한)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        alert('이미지 크기는 5MB 이하로 업로드해 주세요.');
        return;
      }

      // 이미지 크기 검증
      const img = new window.Image();
      img.onload = () => {
        if (img.width < 132 || img.height < 132) {
          alert('이미지는 최소 132x132px 이상이어야 합니다.');
          return;
        }

        // 정사각형 이미지 권장
        if (Math.abs(img.width - img.height) > img.width * 0.1) {
          const proceed = confirm('정사각형 이미지를 권장합니다. 계속 진행하시겠습니까?');
          if (!proceed) return;
        }

        setLocalSpaceIcon(file);
        const previewUrl = URL.createObjectURL(file);
        setLocalSpaceIconPreview(previewUrl);
      };

      img.onerror = () => {
        alert('유효하지 않은 이미지 파일입니다.');
      };

      img.src = URL.createObjectURL(file);
    }
  };

  const handleNameEdit = () => {
    setTempSpaceName(localSpaceName);
    setIsEditingName(true);
  };

  const handleNameChange = (value: string) => {
    setTempSpaceName(value);
  };

  const handleNameConfirm = () => {
    // 빈칸일 경우 원본으로 되돌리기
    const trimmedName = tempSpaceName.trim();
    if (!trimmedName) {
      setLocalSpaceName(originalSpaceName);
    } else {
      setLocalSpaceName(trimmedName);
    }
    setIsEditingName(false);
  };

  const handleNameCancel = () => {
    setTempSpaceName(localSpaceName);
    setIsEditingName(false);
  };

  const handleSaveChanges = () => {
    // 스페이스 이름 빈칸 검증
    const trimmedName = localSpaceName.trim();
    if (!trimmedName) {
      alert('스페이스 이름을 입력해주세요.');
      return;
    }

    // TODO: API 호출로 변경사항 저장
    // Save changes: { spaceSlug, name: trimmedName, icon: localSpaceIcon }
    setHasChanges(false);
  };

  const handleCancelChanges = () => {
    setLocalSpaceName(originalSpaceName);
    setLocalSpaceIcon(null);
    setLocalSpaceIconPreview(originalSpaceIcon);
    setIsEditingName(false);
    setHasChanges(false);
  };

  const handleDeleteSpace = () => {
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmName === localSpaceName) {
      // TODO: 실제 삭제 API 호출 (spaceSlug: ${spaceSlug})
      setShowDeleteDialog(false);
      setDeleteConfirmName('');
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteDialog(false);
    setDeleteConfirmName('');
  };

  return (
    <div className="px-4 py-4 md:px-8 md:py-8">
      <div className="mb-6 md:mb-8">
        <h1 className="mb-2 text-2xl font-bold text-[#181818] md:text-3xl">스페이스 설정</h1>
        <p className="text-sm text-gray-600 md:text-base">스페이스의 기본 정보와 설정을 관리하세요</p>
      </div>

      <div className="space-y-8">
        {/* 변경사항 저장 버튼 */}
        {hasChanges && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center space-x-2">
                <svg
                  className="h-5 w-5 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-sm font-medium text-blue-900">변경사항이 있습니다</span>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handleCancelChanges}
                  className="flex-1 rounded-lg bg-gray-500 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-600 md:flex-none md:px-4"
                >
                  취소
                </button>
                <button
                  onClick={handleSaveChanges}
                  className="flex-1 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 md:flex-none md:px-4"
                >
                  변경사항 저장
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 스페이스 아이콘 설정 */}
        <div className="rounded-lg border border-gray-200 bg-white p-4 md:p-6">
          <h2 className="mb-4 text-base font-semibold text-gray-900 md:text-lg">스페이스 아이콘</h2>
          <div className="flex flex-col items-start space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
            <div className="relative">
              <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border-2 border-gray-200 bg-gray-100">
                {localSpaceIconPreview ? (
                  <Image
                    src={localSpaceIconPreview}
                    alt="스페이스 아이콘"
                    width={96}
                    height={96}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-gray-400">
                    <svg
                      className="mb-1 h-8 w-8"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <span className="text-xs font-medium">아이콘</span>
                  </div>
                )}
              </div>
              {localSpaceIcon && (
                <div className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500">
                  <svg
                    className="h-2.5 w-2.5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              )}
            </div>
            <div className="w-full sm:w-auto">
              <label className="inline-flex cursor-pointer items-center rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 md:px-4">
                <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                이미지 업로드
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
              <div className="mt-3 text-sm text-gray-500">
                <p className="mb-1 text-xs font-medium md:text-sm">권장사항:</p>
                <ul className="space-y-1 text-xs">
                  <li>• 최소 132x132px 이상의 정사각형 이미지</li>
                  <li>• 단색 배경과 명확한 그래픽/로고 사용</li>
                  <li>• JPG, PNG 형식 (최대 5MB)</li>
                  <li>• 아이콘 주변에 여백 포함</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* 스페이스 이름 설정 */}
        <div className="rounded-lg border border-gray-200 bg-white p-4 md:p-6">
          <h2 className="mb-4 text-base font-semibold text-gray-900 md:text-lg">스페이스 이름</h2>
          <div className="flex items-center space-x-4">
            {isEditingName ? (
              <div className="flex flex-1 items-center space-x-3">
                <input
                  type="text"
                  value={tempSpaceName}
                  onChange={e => handleNameChange(e.target.value)}
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      handleNameConfirm();
                    } else if (e.key === 'Escape') {
                      handleNameCancel();
                    }
                  }}
                />
                <button
                  onClick={handleNameConfirm}
                  className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                >
                  확인
                </button>
                <button
                  onClick={handleNameCancel}
                  className="rounded-lg bg-gray-500 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-600"
                >
                  취소
                </button>
              </div>
            ) : (
              <div className="flex flex-1 items-center justify-between">
                <span className="text-base font-medium text-gray-900 md:text-lg">{localSpaceName}</span>
                <button
                  onClick={handleNameEdit}
                  className="rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 md:px-4"
                >
                  수정
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 스페이스 삭제 */}
        <div className="rounded-lg border border-red-200 bg-white p-4 md:p-6">
          <h2 className="mb-4 text-base font-semibold text-red-900 md:text-lg">위험 구역</h2>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-sm font-medium text-red-900">스페이스 삭제</h3>
              <p className="text-xs text-red-700 md:text-sm">
                이 작업은 되돌릴 수 없습니다. 모든 데이터가 영구적으로 삭제됩니다.
              </p>
            </div>
            <button
              onClick={handleDeleteSpace}
              className="w-full rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 sm:w-auto md:px-4"
            >
              스페이스 삭제
            </button>
          </div>
        </div>
      </div>

      {/* 스페이스 삭제 확인 다이얼로그 */}
      {showDeleteDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
          <div className="w-full max-w-md rounded-lg bg-white p-4 md:p-6">
            <div className="mb-4 flex items-center">
              <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                <svg
                  className="h-6 w-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">스페이스 삭제</h3>
            </div>

            <div className="mb-4">
              <p className="mb-2 text-sm text-gray-600 md:text-base">정말로 이 스페이스를 삭제하시겠습니까?</p>
              <p className="mb-4 text-xs text-red-600 md:text-sm">
                이 작업은 되돌릴 수 없으며, 모든 데이터가 영구적으로 삭제됩니다.
              </p>

              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  확인을 위해 스페이스 이름{' '}
                  <span className="font-semibold text-gray-900">&quot;{localSpaceName}&quot;</span>
                  을 정확히 입력하세요:
                </label>
                <input
                  type="text"
                  value={deleteConfirmName}
                  onChange={e => setDeleteConfirmName(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="스페이스 이름을 입력하세요"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCancelDelete}
                className="rounded-lg bg-gray-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-600"
              >
                취소
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleteConfirmName !== localSpaceName}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  deleteConfirmName === localSpaceName
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'cursor-not-allowed bg-gray-300 text-gray-500'
                }`}
              >
                삭제하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
