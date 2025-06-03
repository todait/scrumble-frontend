'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

export default function SpaceSettingsPage() {
  const params = useParams();
  const spaceId = params.spaceId as string;
  
  // 원본 데이터 (서버에서 가져온 데이터)
  const [originalSpaceName] = useState('팀 스페이스');
  const [originalSpaceIcon] = useState<string | null>(null);
  
  // 로컬 편집 상태
  const [localSpaceName, setLocalSpaceName] = useState(originalSpaceName);
  const [localSpaceIcon, setLocalSpaceIcon] = useState<File | null>(null);
  const [localSpaceIconPreview, setLocalSpaceIconPreview] = useState<string | null>(originalSpaceIcon);
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
      const img = new Image();
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

    console.log('Saving changes:', {
      spaceId,
      name: trimmedName,
      icon: localSpaceIcon
    });
    // TODO: API 호출로 변경사항 저장
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
      console.log('spaceId:', spaceId);
      setShowDeleteDialog(false);
      setDeleteConfirmName('');
      // TODO: 실제 삭제 API 호출
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteDialog(false);
    setDeleteConfirmName('');
  };

  return (
    <div className="px-8 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-[#181818]">스페이스 설정</h1>
        <p className="text-gray-600">스페이스의 기본 정보와 설정을 관리하세요</p>
      </div>

      <div className="space-y-8">
        {/* 변경사항 저장 버튼 */}
        {hasChanges && (
          <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium text-blue-900">변경사항이 있습니다</span>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handleCancelChanges}
                  className="px-4 py-2 bg-gray-500 text-white text-sm font-medium rounded-lg hover:bg-gray-600 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleSaveChanges}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  변경사항 저장
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 스페이스 아이콘 설정 */}
        <div className="rounded-lg bg-white border border-gray-200 p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">스페이스 아이콘</h2>
          <div className="flex items-start space-x-4">
            <div className="relative">
              <div className="h-24 w-24 rounded-2xl bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-gray-200">
                {localSpaceIconPreview ? (
                  <img 
                    src={localSpaceIconPreview} 
                    alt="스페이스 아이콘" 
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-gray-400">
                    <svg className="h-8 w-8 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-xs font-medium">아이콘</span>
                  </div>
                )}
              </div>
              {localSpaceIcon && (
                <div className="absolute -top-1 -right-1 h-4 w-4 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg className="h-2.5 w-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </div>
            <div>
              <label className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 cursor-pointer transition-colors">
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
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
                <p className="font-medium mb-1">권장사항:</p>
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
        <div className="rounded-lg bg-white border border-gray-200 p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">스페이스 이름</h2>
          <div className="flex items-center space-x-4">
            {isEditingName ? (
              <div className="flex-1 flex items-center space-x-3">
                <input
                  type="text"
                  value={tempSpaceName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleNameConfirm();
                    } else if (e.key === 'Escape') {
                      handleNameCancel();
                    }
                  }}
                />
                <button
                  onClick={handleNameConfirm}
                  className="px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  확인
                </button>
                <button
                  onClick={handleNameCancel}
                  className="px-3 py-2 bg-gray-500 text-white text-sm font-medium rounded-lg hover:bg-gray-600 transition-colors"
                >
                  취소
                </button>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-between">
                <span className="text-lg font-medium text-gray-900">{localSpaceName}</span>
                <button
                  onClick={handleNameEdit}
                  className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
                >
                  수정
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 스페이스 삭제 */}
        <div className="rounded-lg bg-white border border-red-200 p-6">
          <h2 className="mb-4 text-lg font-semibold text-red-900">위험 구역</h2>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-red-900">스페이스 삭제</h3>
              <p className="text-sm text-red-700">이 작업은 되돌릴 수 없습니다. 모든 데이터가 영구적으로 삭제됩니다.</p>
            </div>
            <button
              onClick={handleDeleteSpace}
              className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
            >
              스페이스 삭제
            </button>
          </div>
        </div>
      </div>

      {/* 스페이스 삭제 확인 다이얼로그 */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center mb-4">
              <div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">스페이스 삭제</h3>
            </div>
            
            <div className="mb-4">
              <p className="text-gray-600 mb-2">
                정말로 이 스페이스를 삭제하시겠습니까?
              </p>
              <p className="text-sm text-red-600 mb-4">
                이 작업은 되돌릴 수 없으며, 모든 데이터가 영구적으로 삭제됩니다.
              </p>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  확인을 위해 스페이스 이름 <span className="font-semibold text-gray-900">"{localSpaceName}"</span>을 정확히 입력하세요:
                </label>
                <input
                  type="text"
                  value={deleteConfirmName}
                  onChange={(e) => setDeleteConfirmName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                  placeholder="스페이스 이름을 입력하세요"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCancelDelete}
                className="px-4 py-2 bg-gray-500 text-white text-sm font-medium rounded-lg hover:bg-gray-600 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleteConfirmName !== localSpaceName}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  deleteConfirmName === localSpaceName
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
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
