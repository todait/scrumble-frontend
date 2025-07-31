'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { IntroLayout } from '@/shared/components/layout';
import { useToast } from '@/shared/hooks/useToast';

import {
  JoinSpaceHeader,
  DividerLine,
  JoinCodeInput,
  JoinButton,
  CreateNewSpaceButton,
} from '../components';

const JoinSpacePage = () => {
  const router = useRouter();
  const { success, error } = useToast();
  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!code.trim()) {
      error({
        title: '입장 실패',
        message: '입장 코드를 입력해주세요.',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // TODO: API 호출로 스페이스 입장
      // const response = await joinSpace({ code });

      // 임시로 성공 처리
      await new Promise(resolve => setTimeout(resolve, 1000));

      success({
        title: '스페이스 입장 성공!',
        message: '스페이스에 성공적으로 입장했습니다.',
      });

      // 스페이스 목록 페이지로 이동
      router.push('/spaces');
    } catch {
      error({
        title: '입장 실패',
        message: '유효하지 않은 입장 코드입니다.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateSpace = () => {
    router.push('/spaces/new');
  };

  return (
    <IntroLayout>
      {/* 헤더 섹션 */}
      <div className="px-12 py-8">
        <JoinSpaceHeader />
      </div>

      {/* Divider */}
      <div className="h-[1px] bg-[#1D1D1F]/10" />

      {/* 입장 코드 입력 폼 섹션 */}
      <form onSubmit={handleSubmit} className="px-12 pb-4 pt-8">
        <div className="flex flex-col items-center gap-4">
          <JoinCodeInput
            value={code}
            onChange={setCode}
            disabled={isSubmitting}
          />

          <JoinButton disabled={isSubmitting || !code.trim()} isLoading={isSubmitting} />

          <DividerLine />

          <CreateNewSpaceButton onClick={handleCreateSpace} disabled={isSubmitting} />
        </div>
      </form>
    </IntroLayout>
  );
};

export default JoinSpacePage;