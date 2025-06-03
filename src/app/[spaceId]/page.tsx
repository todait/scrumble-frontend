interface SpacePageProps {
  params: Promise<{ spaceId: string }>;
}

export default async function SpacePage({ params }: SpacePageProps) {
  const { spaceId } = await params;

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">팀 피드</h1>

        {/* 임시 콘텐츠 - 추후 실제 팀 피드 컴포넌트로 교체 예정 */}
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <p className="text-gray-600">스페이스 ID: {spaceId}</p>
          <p className="mt-2 text-gray-600">팀 피드 컴포넌트가 여기에 표시됩니다.</p>
        </div>
      </div>
    </div>
  );
}
