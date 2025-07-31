'use client';

import { useRouter } from 'next/navigation';

import { createSpaceSchema } from '@/schemas';
import { IntroLayout } from '@/shared/components/layout';
import { useForm } from '@/shared/hooks';
import { useToast } from '@/shared/hooks/useToast';

import {
  CreateButton,
  CreateSpaceHeader,
  DividerLine,
  InviteSpaceButton,
  SpaceNameInput,
} from '../components';

const CreateSpacePage = () => {
  const router = useRouter();
  // const { isAuthenticated, isLoading } = useAuth();
  const { success, error } = useToast();

  const { values, setValue, isValid, isSubmitting, handleSubmit } = useForm({
    schema: createSpaceSchema,
    initialValues: { name: '' },
    onSubmit: async data => {
      try {
        // TODO: API 호출로 워크스페이스 생성
        // const response = await createSpace(data);

        // 임시로 성공 처리
        await new Promise(resolve => setTimeout(resolve, 1000));

        success({
          title: '워크스페이스 생성 완료!',
          message: `${data.name} 워크스페이스가 생성되었습니다.`,
        });

        // 팀 초대 페이지로 이동
        // TODO: 실제 API 응답에서 스페이스 ID를 받아와서 사용
        const spaceSlug = 'temp-space-id'; // 임시 ID, 추후 API 응답에서 받아올 예정
        router.push(`/spaces/${spaceSlug}/invite`);
      } catch {
        error({
          title: '생성 실패',
          message: '워크스페이스 생성 중 오류가 발생했습니다.',
        });
      }
    },
  });

  // useEffect(() => {
  //   // 로그인하지 않은 경우 로그인 페이지로 리다이렉트
  //   if (!isLoading && !isAuthenticated) {
  //     router.push('/auth');
  //   }
  // }, [isAuthenticated, isLoading, router]);

  const handleJoinSpace = () => {
    // TODO: 초대받은 스페이스 입장 로직
    router.push('/spaces/join');
  };

  // 로딩 중일 때 표시
  // if (isLoading) {
  //   return <LoadingScreen />;
  // }

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
            disabled={isSubmitting}
          />

          <CreateButton disabled={isSubmitting || !isValid} isLoading={isSubmitting} />

          <DividerLine />

          <InviteSpaceButton onClick={handleJoinSpace} disabled={isSubmitting} />
        </div>
      </form>
    </IntroLayout>
  );
};

export default CreateSpacePage;
