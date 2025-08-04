'use client';

import { useAuth } from '@/shared/contexts/AuthContext';
import { useImageUpload } from '@/shared/hooks/useImageUpload';
import { useUpdateSpace, useDeleteSpace } from '@/shared/hooks/queries/useSpaces';
import { RiAddLine } from '@remixicon/react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function SpaceSettingsPage() {
  const { currentSpace, currentSpaceSlug } = useAuth();
  const router = useRouter();
  const updateSpaceMutation = useUpdateSpace();
  const deleteSpaceMutation = useDeleteSpace();
  
  // useImageUpload 훅 사용
  const { uploadImages, isUploading } = useImageUpload({
    maxFiles: 1,
    onUploadComplete: (images) => {
      if (images.length > 0) {
        setUploadedIconUrl(images[0].url);
      }
    },
  });

  // 원본 데이터 (서버에서 가져온 데이터)
  const [originalSpaceName] = useState(currentSpace?.name || 'dev_ved');
  const [originalSpaceIcon] = useState<string | null>(currentSpace?.iconURL || null);
  // const [originalSpaceDays] = useState<string[]>(['월', '화', '수', '목', '금']); // 미구현 기능

  // 로컬 편집 상태
  const [localSpaceName, setLocalSpaceName] = useState(originalSpaceName);
  const [localSpaceIcon, setLocalSpaceIcon] = useState<File | null>(null);
  const [localSpaceIconPreview, setLocalSpaceIconPreview] = useState<string | null>(
    originalSpaceIcon
  );
  const [uploadedIconUrl, setUploadedIconUrl] = useState<string | null>(null);
  // const [localSpaceDays, setLocalSpaceDays] = useState<string[]>(originalSpaceDays); // 미구현 기능

  // 변경사항 감지
  const [hasChanges, setHasChanges] = useState(false);

  // 삭제 다이얼로그 상태
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmName, setDeleteConfirmName] = useState('');

  // const daysOfWeek = ['월', '화', '수', '목', '금', '토', '일']; // 미구현 기능

  useEffect(() => {
    const nameChanged = localSpaceName.trim() !== originalSpaceName.trim();
    const iconChanged = localSpaceIcon !== null || uploadedIconUrl !== null;
    // const daysChanged =
    //   JSON.stringify(localSpaceDays.sort()) !== JSON.stringify(originalSpaceDays.sort()); // 미구현 기능
    setHasChanges(nameChanged || iconChanged /* || daysChanged */);
  }, [localSpaceName, localSpaceIcon, uploadedIconUrl, originalSpaceName /* , localSpaceDays, originalSpaceDays */]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // 파일 형식 검증
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        alert('JPG, PNG, WebP, GIF 형식의 이미지만 업로드 가능합니다.');
        return;
      }

      // 파일 크기 검증 (10MB 제한)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        alert('이미지 크기는 10MB 이하로 업로드해 주세요.');
        return;
      }

      setLocalSpaceIcon(file);
      const previewUrl = URL.createObjectURL(file);
      setLocalSpaceIconPreview(previewUrl);
      
      // R2에 업로드
      await uploadImages([file]);
    }
  };

  const handleSpaceNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSpaceName(e.target.value);
  };

  // const handleDayToggle = (day: string) => {
  //   setLocalSpaceDays(prev => (prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]));
  // }; // 미구현 기능

  const handleSaveChanges = async () => {
    // 스페이스 이름 빈칸 검증
    const trimmedName = localSpaceName.trim();
    if (!trimmedName) {
      alert('스페이스 이름을 입력해주세요.');
      return;
    }

    if (!currentSpaceSlug) {
      alert('스페이스 정보를 불러올 수 없습니다.');
      return;
    }

    try {
      await updateSpaceMutation.mutateAsync({
        spaceSlug: currentSpaceSlug,
        name: trimmedName !== originalSpaceName ? trimmedName : undefined,
        iconUrl: uploadedIconUrl || undefined,
      });

      // 성공 시 상태 초기화
      setHasChanges(false);
      setLocalSpaceIcon(null);
      if (uploadedIconUrl) {
        setLocalSpaceIconPreview(uploadedIconUrl);
        setUploadedIconUrl(null);
      }
    } catch (error) {
      // 에러는 useUpdateSpace 훅에서 toast로 처리됨
    }
  };

  const handleCancelChanges = () => {
    setLocalSpaceName(originalSpaceName);
    setLocalSpaceIcon(null);
    setLocalSpaceIconPreview(originalSpaceIcon);
    setUploadedIconUrl(null);
    // setLocalSpaceDays(originalSpaceDays); // 미구현 기능
    setHasChanges(false);
  };

  const handleDeleteSpace = () => {
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (deleteConfirmName === localSpaceName && currentSpaceSlug) {
      try {
        await deleteSpaceMutation.mutateAsync({
          spaceSlug: currentSpaceSlug,
        });
        
        // 성공 시 홈으로 이동
        router.push('/');
      } catch (error) {
        // 에러는 useDeleteSpace 훅에서 toast로 처리됨
        setShowDeleteDialog(false);
        setDeleteConfirmName('');
      }
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteDialog(false);
    setDeleteConfirmName('');
  };

  return (
    <div className="p-10">
      <div className="mb-10">
        <h1 className="mb-2 text-[20px] font-bold text-[#1D1D1F]">스페이스 정보</h1>
        <p className="text-[14px] leading-[20px] text-[#86868B]">
          스페이스 정보를 직접 수정할 수 있으며, 변경 사항은 모든 멤버에게 자동으로 알림이
          전송됩니다.
        </p>
      </div>

      <div className="space-y-12">
        {/* 스페이스 정보 섹션 */}
        <div className="rounded-[30px] bg-[#FAFAFA] p-8">
          <div className="flex items-start gap-[30px]">
            {/* 스페이스 아이콘 - 120x120 */}
            <button
              onClick={() => document.getElementById('icon-upload')?.click()}
              className="block transition-opacity hover:opacity-80 relative"
              disabled={isUploading}
            >
              <div className="flex h-[120px] w-[120px] items-center justify-center overflow-hidden rounded-[20px] bg-[#9747FF]">
                {localSpaceIconPreview || currentSpace?.iconURL ? (
                  <Image
                    src={localSpaceIconPreview || currentSpace?.iconURL || ''}
                    alt={currentSpace?.name || localSpaceName || 'Space'}
                    width={120}
                    height={120}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-[48px] font-bold text-white">
                    {(currentSpace?.name || localSpaceName || 'S').charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              {isUploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-[20px]">
                  <div className="text-white text-sm">업로드 중...</div>
                </div>
              )}
            </button>
            <input
              id="icon-upload"
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
              onChange={handleImageUpload}
              className="hidden"
            />

            {/* 스페이스 정보 영역 */}
            <div className="flex h-[120px] flex-1 flex-col justify-between">
              {/* 상단 정보 */}
              <div>
                <h2 className="text-[20px] font-bold text-[#1D1D1F]">
                  {currentSpace?.name || localSpaceName}
                </h2>
                <p className="mt-1 text-[15px] font-medium text-[#6E6E73]">
                  2025년 7월 16일 개설 • {currentSpace?.members?.length || 39}명
                </p>
                <p className="text-[15px] font-medium text-[#6E6E73]">워크데이 : 월-금</p>
              </div>

              {/* 하단 초대하기 버튼 */}
              <div className="flex justify-end">
                <button className="flex items-center gap-1 rounded-[8px] border border-[#E5E5EA] bg-white px-3 py-2 text-[13px] text-[#1D1D1F] transition-colors hover:bg-gray-50">
                  <RiAddLine className="h-4 w-4" />
                  초대하기
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="border-b border-[#F2F2F7]"></div>

        {/* 스페이스 이름 수정 */}
        <div className="flex items-start justify-between gap-6">
          <h3 className="whitespace-nowrap text-[15px] font-bold text-[#1D1D1F]">스페이스 이름</h3>
          <div className="w-full max-w-[750px]">
            <input
              type="text"
              value={localSpaceName}
              onChange={handleSpaceNameChange}
              className="h-[54px] w-full rounded-[10px] border border-[#D2D2D7] bg-[#F9F9FB] px-4 text-[16px] font-normal text-[#1D1D1F] transition-colors focus:border-[#9747FF] focus:outline-none"
              placeholder="스페이스 이름 입력"
            />
          </div>
        </div>

        {/* 스페이스 데이 섹션 - 미구현 기능으로 주석 처리 */}
        {/*
        <div>
          <div className="mb-3 flex items-center gap-2">
            <h3 className="text-[16px] font-semibold text-[#1D1D1F]">스페이스 데이</h3>
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#86868B] text-[10px] font-medium text-white">
              ?
            </div>
          </div>
          <p className="mb-2 text-[13px] text-[#86868B]">
            팀의 주간 업무 리듬에 맞춰 워크데이와 오프데이를 선택하세요.
          </p>
          <p className="mb-6 text-[11px] text-[#B1B1B6]">
            매주 반복되는 업무일과 휴일을 설정하면, 팀 스케줄을 더 정확히 관리할 수 있어요.
          </p>

          {/* 요일 선택 */}
        {/*
          <div className="grid max-w-[500px] grid-cols-7 gap-3">
            {daysOfWeek.map(day => {
              const isSelected = localSpaceDays.includes(day);
              const isWeekend = day === '토' || day === '일';

              return (
                <div key={day} className="flex flex-col items-center gap-2">
                  <button
                    onClick={() => !isWeekend && handleDayToggle(day)}
                    className={`relative flex h-[56px] w-[56px] items-center justify-center rounded-[10px] text-[14px] font-medium transition-all ${
                      isSelected
                        ? 'bg-[#9747FF] text-white'
                        : isWeekend
                          ? 'bg-[#F2F2F7] text-[#C7C7CC]'
                          : 'bg-[#F2F2F7] text-[#1D1D1F] hover:bg-[#E5E5EA]'
                    }`}
                    disabled={isWeekend}
                  >
                    {day}
                    {isSelected && !isWeekend && (
                      <svg
                        className="absolute bottom-1 right-1 h-4 w-4"
                        viewBox="0 0 16 16"
                        fill="none"
                      >
                        <path
                          d="M13 4L6 11L3 8"
                          stroke="white"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </button>
                  {isWeekend && <span className="mt-1 text-[12px] text-[#C7C7CC]">✕</span>}
                </div>
              );
            })}
          </div>
        </div>
        */}

        <div>
          {/* 저장/취소 버튼 */}
          <div className="mt-12 flex gap-5">
            <button
              onClick={handleCancelChanges}
              className={`flex-1 rounded-[10px] px-6 py-3.5 text-[14px] font-medium transition-colors ${
                hasChanges && !updateSpaceMutation.isPending
                  ? 'bg-[#F2F2F7] text-[#1D1D1F] hover:bg-[#E5E5EA]'
                  : 'cursor-not-allowed bg-[#F2F2F7] text-[#C7C7CC]'
              }`}
              disabled={!hasChanges || updateSpaceMutation.isPending}
            >
              취소
            </button>
            <button
              onClick={handleSaveChanges}
              className={`flex-1 rounded-[10px] px-6 py-3.5 text-[14px] font-medium transition-colors ${
                hasChanges && !updateSpaceMutation.isPending && !isUploading
                  ? 'bg-[#9747FF] text-white hover:bg-[#8739E6]'
                  : 'cursor-not-allowed bg-[#E5E5EA] text-[#C7C7CC]'
              }`}
              disabled={!hasChanges || updateSpaceMutation.isPending || isUploading}
            >
              {updateSpaceMutation.isPending ? '저장 중...' : '저장'}
            </button>
          </div>
        </div>

        {/* 스페이스 삭제 섹션 */}
        <div className="mt-16 flex justify-end border-t border-[#F2F2F7] pt-10">
          <button
            onClick={handleDeleteSpace}
            className="text-[14px] font-medium text-[#FF3B30] transition-colors hover:text-[#D70015]"
          >
            스페이스 삭제하기
          </button>
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
              <p className="mb-2 text-sm text-gray-600 md:text-base">
                정말로 이 스페이스를 삭제하시겠습니까?
              </p>
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
                disabled={deleteConfirmName !== localSpaceName || deleteSpaceMutation.isPending}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  deleteConfirmName === localSpaceName && !deleteSpaceMutation.isPending
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'cursor-not-allowed bg-gray-300 text-gray-500'
                }`}
              >
                {deleteSpaceMutation.isPending ? '삭제 중...' : '삭제하기'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
