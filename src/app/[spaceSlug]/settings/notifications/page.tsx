'use client';

import { withAuth } from '@/shared/components/auth';
import { useState } from 'react';

interface NotificationSetting {
  id: string;
  label: string;
  sublabel?: string;
  enabled: boolean;
}

function NotificationsSettingsPage() {
  const [allNotifications, setAllNotifications] = useState(false);
  const [feeds, setFeeds] = useState(false);
  const [activities, setActivities] = useState({
    newPost: true,
    myPostReaction: true, 
    myPostReply: false,
    myPostTag: false,
  });
  const [spaces, setSpaces] = useState({
    invitation: true,
    info: true,
    newMember: true,
  });

  const handleToggle = (category: string, key?: string) => {
    if (category === 'all') {
      setAllNotifications(!allNotifications);
    } else if (category === 'feeds') {
      setFeeds(!feeds);
    } else if (category === 'activities' && key) {
      setActivities({
        ...activities,
        [key]: !activities[key as keyof typeof activities],
      });
    } else if (category === 'spaces' && key) {
      setSpaces({
        ...spaces,
        [key]: !spaces[key as keyof typeof spaces],
      });
    }
  };

  const hasChanges = true; // 실제로는 초기값과 비교해서 변경사항 있는지 체크

  return (
    <div className="p-10">
      <div className="mb-10">
        <h1 className="mb-2 text-[20px] font-bold text-[#1D1D1F]">푸시 알림</h1>
      </div>

      <div className="space-y-8 max-w-[600px]">
        {/* 모든 알림 끄기 */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[14px] font-medium text-[#1D1D1F]">모든 알림 끄기</p>
            <p className="text-[12px] text-[#86868B] mt-1">
              피드와 활동, 스페이스 공지 등 모든 푸시 알림을 일시 중단합니다
            </p>
          </div>
          <button
            onClick={() => handleToggle('all')}
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
              allNotifications ? 'bg-[#E5E5EA]' : 'bg-[#E5E5EA]'
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${
                allNotifications ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* 피드 */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-[14px] font-medium text-[#1D1D1F]">피드</p>
              <p className="text-[12px] text-[#86868B] mt-1">
                다른 멤버의 포스트 (체크인, 체크아웃)
              </p>
            </div>
            <button
              onClick={() => handleToggle('feeds')}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                feeds ? 'bg-[#E5E5EA]' : 'bg-[#E5E5EA]'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${
                  feeds ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* 활동 */}
        <div>
          <p className="text-[14px] font-medium text-[#1D1D1F] mb-4">활동</p>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-[13px] text-[#1D1D1F]">내 포스트에 달린 댓글</p>
              <button
                onClick={() => handleToggle('activities', 'newPost')}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                  activities.newPost ? 'bg-[#9747FF]' : 'bg-[#E5E5EA]'
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${
                    activities.newPost ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-[13px] text-[#1D1D1F]">내가 참여한 다른 사람의 포스트에 새로운 댓글</p>
              <button
                onClick={() => handleToggle('activities', 'myPostReaction')}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                  activities.myPostReaction ? 'bg-[#9747FF]' : 'bg-[#E5E5EA]'
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${
                    activities.myPostReaction ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-[13px] text-[#1D1D1F]">내 포스트 또는 댓글에 달린 이모지</p>
              <button
                onClick={() => handleToggle('activities', 'myPostReply')}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                  activities.myPostReply ? 'bg-[#E5E5EA]' : 'bg-[#E5E5EA]'
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${
                    activities.myPostReply ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-[13px] text-[#1D1D1F]">포스트나 댓글에서 나를 언급</p>
              <button
                onClick={() => handleToggle('activities', 'myPostTag')}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                  activities.myPostTag ? 'bg-[#E5E5EA]' : 'bg-[#E5E5EA]'
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${
                    activities.myPostTag ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* 공지 */}
        <div>
          <p className="text-[14px] font-medium text-[#1D1D1F] mb-4">공지</p>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-[13px] text-[#1D1D1F]">스페이스 공지사항</p>
              <button
                onClick={() => handleToggle('spaces', 'invitation')}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                  spaces.invitation ? 'bg-[#9747FF]' : 'bg-[#E5E5EA]'
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${
                    spaces.invitation ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-[13px] text-[#1D1D1F]">스페이스의 정보 변경</p>
              <button
                onClick={() => handleToggle('spaces', 'info')}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                  spaces.info ? 'bg-[#9747FF]' : 'bg-[#E5E5EA]'
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${
                    spaces.info ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-[13px] text-[#1D1D1F]">스페이스 내에서 나의 권한 변경</p>
              <button
                onClick={() => handleToggle('spaces', 'newMember')}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                  spaces.newMember ? 'bg-[#9747FF]' : 'bg-[#E5E5EA]'
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${
                    spaces.newMember ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* 저장/취소 버튼 */}
        <div className="flex justify-center gap-4 pt-12">
          <button className="w-[180px] rounded-[10px] bg-[#F2F2F7] px-6 py-3.5 text-[14px] font-medium text-[#1D1D1F] transition-colors hover:bg-[#E5E5EA]">
            취소
          </button>
          <button
            className={`w-[180px] rounded-[10px] px-6 py-3.5 text-[14px] font-medium transition-colors ${
              hasChanges
                ? 'bg-[#1D1D1F] text-white hover:bg-[#000000]'
                : 'bg-[#E5E5EA] text-[#C7C7CC] cursor-not-allowed'
            }`}
            disabled={!hasChanges}
          >
            변경사항 저장
          </button>
        </div>
      </div>
    </div>
  );
}

export default withAuth(NotificationsSettingsPage);