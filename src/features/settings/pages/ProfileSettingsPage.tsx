'use client';

import { useMyProfile, useUpdateMyProfile } from '@/shared/hooks/queries/useMembers';
import { useImageUpload } from '@/shared/hooks/useImageUpload';
import { RiGoogleFill, RiUser6Line } from '@remixicon/react';
import Image from 'next/image';
import { useEffect, useState } from 'react';

export function ProfileSettingsPage() {
  // Query 및 mutation
  const { data: profileData, isLoading } = useMyProfile();
  const updateProfileMutation = useUpdateMyProfile();

  // 프로필 데이터
  const profile = profileData?.spaceMember;

  // 로컬 상태
  const [localName, setLocalName] = useState('');
  const [localAvatar, setLocalAvatar] = useState<File | null>(null);
  const [localAvatarPreview, setLocalAvatarPreview] = useState<string | null>(null);
  const [uploadedAvatarUrl, setUploadedAvatarUrl] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // 이미지 업로드 훅
  const { uploadImages, isUploading } = useImageUpload({
    maxFiles: 1,
    onUploadComplete: images => {
      if (images.length > 0) {
        setUploadedAvatarUrl(images[0].url);
      }
    },
  });

  // 프로필 데이터가 변경되면 로컬 상태 업데이트
  useEffect(() => {
    if (profile) {
      setLocalName(profile.name || '');
      // 사용자가 직접 수정 중이 아닐 때만 서버 이미지로 업데이트
      if (!localAvatar && !uploadedAvatarUrl) {
        if (profile.avatarURL !== localAvatarPreview) {
          setLocalAvatarPreview(profile.avatarURL);
        }
      }
    }
  }, [profile, localAvatar, uploadedAvatarUrl, localAvatarPreview]);

  // 변경사항 감지
  useEffect(() => {
    const nameChanged = localName.trim() !== profile?.name;
    const avatarChanged = !!localAvatar || !!uploadedAvatarUrl;
    setHasChanges(nameChanged || avatarChanged);
  }, [localName, localAvatar, uploadedAvatarUrl, profile?.name]);

  // 아바타 파일 선택 핸들러
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLocalAvatar(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLocalAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // 저장 핸들러
  const handleSaveChanges = async () => {
    // 이름 빈칸 검증
    const trimmedName = localName.trim();
    if (!trimmedName) {
      alert('이름을 입력해주세요.');
      return;
    }

    try {
      if (localAvatar && !uploadedAvatarUrl) {
        await uploadImages([localAvatar]);
        // onUploadComplete 콜백에서 uploadedAvatarUrl이 설정됨
        // 업로드 완료를 기다리기 위해 짧은 지연 추가
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // 프로필 업데이트
      const result = await updateProfileMutation.mutateAsync({
        name: trimmedName !== profile?.name ? trimmedName : undefined,
        avatarUrl: uploadedAvatarUrl || undefined,
      });

      // 성공 시 상태 초기화
      setHasChanges(false);
      setLocalAvatar(null);

      // 서버에서 반환된 새 이미지 URL을 localAvatarPreview에 설정
      if (result?.spaceMember?.avatarURL) {
        setLocalAvatarPreview(result.spaceMember.avatarURL);
      } else if (uploadedAvatarUrl) {
        setLocalAvatarPreview(uploadedAvatarUrl);
      }

      setUploadedAvatarUrl(null);
    } catch (error) {
      // 에러는 useUpdateMyProfile 훅에서 toast로 처리됨
    }
  };

  // 취소 핸들러
  const handleCancelChanges = () => {
    setLocalName(profile?.name || '');
    setLocalAvatar(null);
    setLocalAvatarPreview(profile?.avatarURL || null);
    setUploadedAvatarUrl(null);
    setHasChanges(false);
  };

  // 가입 날짜 포맷팅
  const formatJoinDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 가입`;
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-10">
        <div className="text-[#6E6E73]">로딩 중...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex h-full items-center justify-center p-10">
        <div className="text-[#6E6E73]">프로필을 불러올 수 없습니다.</div>
      </div>
    );
  }

  return (
    <div className="p-10">
      {/* Header */}
      <div className="mb-10">
        <h1 className="mb-2.5 text-[20px] font-bold leading-[120%] text-[#1D1D1F]">프로필 설정</h1>
        <p className="text-[15px] font-normal leading-[160%] text-[#9999A2]">
          스페이스에서 보여지는 프로필의 정보를 관리할 수 있습니다.
        </p>
      </div>

      {/* Contents */}
      <div className="mt-5">
        {/* 프로필 섹션 */}
        <div className="flex items-start justify-between gap-6">
          <h3 className="whitespace-nowrap text-[15px] font-bold text-[#1D1D1F]">프로필</h3>
          <div className="w-full max-w-[750px]">
            <button
              onClick={() => document.getElementById('avatar-upload')?.click()}
              className="relative block cursor-pointer transition-opacity hover:opacity-80"
              disabled={isUploading}
            >
              <div className="flex h-[120px] w-[120px] items-center justify-center overflow-hidden rounded-[24px] bg-[#9747FF]">
                {localAvatarPreview || profile?.avatarURL ? (
                  <Image
                    src={localAvatarPreview || profile?.avatarURL || ''}
                    alt={profile?.name || 'Profile'}
                    width={120}
                    height={120}
                    className="h-full w-full object-cover"
                    priority
                  />
                ) : (
                  <span className="text-[48px] font-bold text-white">
                    {(profile?.name || 'U').charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              {isUploading && (
                <div className="absolute inset-0 flex items-center justify-center rounded-[24px] bg-black bg-opacity-50">
                  <div className="text-white">업로드 중...</div>
                </div>
              )}
            </button>
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
            <div className="mt-5">
              <p className="text-[15px] font-bold leading-[120%] text-[#6E6E73]">{profile.name}</p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="my-10 h-px w-full bg-[#1D1D1F14]"></div>

        {/* 이름 섹션 */}
        <div className="flex items-start justify-between gap-6">
          <h3 className="whitespace-nowrap text-[15px] font-bold text-[#1D1D1F]">이름</h3>
          <div className="w-full max-w-[750px]">
            <div className="relative">
              <RiUser6Line className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#6E6E73]" />
              <input
                type="text"
                value={localName}
                onChange={e => setLocalName(e.target.value)}
                className="h-[54px] w-full rounded-[10px] border border-[#D2D2D7] bg-[#F9F9FB] px-5 pl-12 text-[16px] font-normal text-[#1D1D1F] transition-colors focus:border-[#9747FF] focus:outline-none"
                placeholder="이름 입력"
              />
            </div>
            <p className="mt-2.5 text-[13px] font-normal leading-[160%] text-[#9999A2]">
              멤버 리스트와 포스트에 표시되는 이름입니다.
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="my-10 h-px w-full bg-[#1D1D1F14]"></div>

        {/* 연결된 계정 섹션 */}
        <div className="flex items-start justify-between gap-6">
          <h3 className="whitespace-nowrap text-[15px] font-bold text-[#1D1D1F]">연결된 계정</h3>
          <div className="w-full max-w-[750px]">
            <div className="relative">
              <RiGoogleFill className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#6E6E73]" />
              <input
                type="text"
                value={profile.email}
                disabled
                className="h-[54px] w-full cursor-not-allowed rounded-[10px] border border-[#D2D2D7] bg-[#F9F9FB] px-5 pl-12 text-[16px] font-normal text-[#6E6E73] opacity-60"
              />
            </div>
            <p className="mt-2.5 text-[13px] font-normal leading-[160%] text-[#9999A2]">
              {formatJoinDate(profile.joinedAt)}
            </p>
          </div>
        </div>

        {/* 버튼 */}
        <div className="mt-12 flex gap-5">
          <button
            onClick={handleCancelChanges}
            className={`flex-1 rounded-[10px] px-6 py-3.5 text-[14px] font-medium transition-colors ${
              hasChanges && !updateProfileMutation.isPending
                ? 'bg-[#F2F2F7] text-[#1D1D1F] hover:bg-[#E5E5EA]'
                : 'cursor-not-allowed bg-[#F2F2F7] text-[#C7C7CC]'
            }`}
            disabled={!hasChanges || updateProfileMutation.isPending}
          >
            취소
          </button>
          <button
            onClick={handleSaveChanges}
            disabled={!hasChanges || isUploading || updateProfileMutation.isPending}
            className={`flex-1 rounded-[10px] px-6 py-3.5 text-[14px] font-medium transition-colors ${
              hasChanges && !isUploading && !updateProfileMutation.isPending
                ? 'bg-[#9747FF] text-white hover:bg-[#8739E6]'
                : 'cursor-not-allowed bg-[#E5E5EA] text-[#C7C7CC]'
            }`}
          >
            {updateProfileMutation.isPending ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>
    </div>
  );
}
