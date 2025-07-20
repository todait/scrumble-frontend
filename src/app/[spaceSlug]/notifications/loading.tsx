import { NotificationSkeleton } from '@/features/notifications/components/ui';

export default function NotificationsLoading() {
  return (
    <div className="flex h-screen justify-center overflow-hidden">
      <div className="flex w-full transition-all duration-300 pt-4 md:w-[672px] md:pt-6">
        <div className="relative flex min-h-0 w-full flex-col px-2 transition-all duration-300 md:px-4">
          {/* 헤더 스켈레톤 */}
          <div className="mb-4 flex flex-shrink-0 items-center justify-between px-2 md:mb-[22px] md:justify-center md:px-0">
            <div className="w-10 md:hidden"></div>
            <div className="h-6 w-12 animate-pulse rounded bg-gray-200" />
            <div className="h-10 w-10 animate-pulse rounded-lg bg-gray-200 md:hidden" />
          </div>

          {/* 알림 컨테이너 */}
          <div className="flex flex-1 flex-col overflow-hidden">
            {/* 헤더 스켈레톤 */}
            <div className="rounded-t-xl shadow-[4px_4px_20px_0px_rgba(160,160,160,0.04),-4px_-4px_20px_0px_rgba(160,160,160,0.04)] md:rounded-t-2xl">
              <div className="overflow-visible rounded-t-2xl border-b border-[rgba(34,34,34,0.08)] bg-white px-[30px] py-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-5 w-12 animate-pulse rounded bg-gray-200" />
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-12 animate-pulse rounded-full bg-gray-200" />
                      <div className="h-7 w-12 animate-pulse rounded-full bg-gray-200" />
                      <div className="h-7 w-12 animate-pulse rounded-full bg-gray-200" />
                    </div>
                  </div>
                  <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
                </div>
              </div>
            </div>

            {/* 알림 목록 스켈레톤 */}
            <div className="scrollbar-hide overflow-y-auto pb-20 md:pb-0 rounded-b-xl shadow-[4px_4px_20px_0px_rgba(160,160,160,0.04),-4px_-4px_20px_0px_rgba(160,160,160,0.04)] md:rounded-b-2xl">
              <NotificationSkeleton count={8} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}