'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { createSpaceSchema } from '@/schemas';
import { IntroLayout } from '@/shared/components/layout';
import { useForm } from '@/shared/hooks';
import { useCreateSpace } from '@/shared/hooks/queries/useSpaces';
import { useToast } from '@/shared/hooks/useToast';

import { useSpaceLogin } from '@/shared/hooks/auth/useSpaceLogin';
import {
  CreateButton,
  CreateSpaceHeader,
  DividerLine,
  InviteSpaceButton,
  SpaceNameInput,
} from '../components';

type LoadingStage = 'idle' | 'creating' | 'logging-in';

const CreateSpacePage = () => {
  const router = useRouter();
  const [loadingStage, setLoadingStage] = useState<LoadingStage>('idle');
  const { error } = useToast();
  const createSpaceMutation = useCreateSpace();
  const { loginToSpace } = useSpaceLogin({ autoRedirect: false });

  const { values, setValue, isValid, handleSubmit } = useForm({
    schema: createSpaceSchema,
    initialValues: { name: '' },
    onSubmit: data => {
      setLoadingStage('creating');
      createSpaceMutation.mutate(data, {
        onSuccess: async response => {
          try {
            setLoadingStage('logging-in');
            await loginToSpace(response.space.slug, response.space.name);
            router.push(`/spaces/${response.space.slug}/invite`);
          } catch {
            // 스페이스는 생성되었지만 로그인 실패
            error({
              title: '로그인 실패',
              message: `스페이스는 생성되었지만 로그인에 실패했습니다. 다시 시도해주세요.`,
            });
            // 생성된 스페이스 목록 페이지로 이동
            router.push('/spaces');
          } finally {
            setLoadingStage('idle');
          }
        },
        onError: () => {
          setLoadingStage('idle');
        },
      });
    },
  });

  const handleJoinSpace = () => {
    // TODO: 초대받은 스페이스 입장 로직
    router.push('/spaces/join');
  };

  return (
    <IntroLayout>
      {/* 헤더 섹션 */}
      <div className="px-12 py-8">
        <CreateSpaceHeader />
      </div>

      {/* Divider */}
      <div className="h-[1px] bg-[#1D1D1F]/10" />

      {/* 스페이스 생성 폼 섹션 */}
      <form onSubmit={handleSubmit} className="px-12 pb-4 pt-8">
        <div className="flex flex-col items-center gap-4">
          <SpaceNameInput
            value={values.name || ''}
            onChange={value => setValue('name', value)}
            disabled={loadingStage !== 'idle'}
          />

          <CreateButton
            disabled={loadingStage !== 'idle' || !isValid}
            isLoading={loadingStage !== 'idle'}
            loadingText={
              loadingStage === 'creating'
                ? '스페이스 생성 중...'
                : loadingStage === 'logging-in'
                ? '로그인 중...'
                : undefined
            }
          />

          <DividerLine />

          <InviteSpaceButton
            onClick={handleJoinSpace}
            disabled={loadingStage !== 'idle'}
          />
        </div>
      </form>
    </IntroLayout>
  );
};

export default CreateSpacePage;
