'use client';

import { useImageUpload } from '@/shared/hooks/useImageUpload';
import { useState } from 'react';

export default function TestHeicPage() {
  const [logs, setLogs] = useState<string[]>([]);
  const [testFile, setTestFile] = useState<File | null>(null);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log(logMessage);
    setLogs(prev => [...prev, logMessage]);
  };

  const {
    uploadImages,
    uploadingImages,
    isUploading,
    isConverting,
    convertingCount,
    removeImage,
    clearImages,
  } = useImageUpload({
    maxSize: 50 * 1024 * 1024, // 50MB
    maxFiles: 5,
    acceptedFormats: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif'],
    onUploadComplete: (images) => {
      addLog(`✅ 업로드 완료: ${images.length}개 이미지`);
      images.forEach(img => {
        addLog(`   - ${img.name} (${(img.size / 1024).toFixed(1)} KB)`);
      });
    },
    onError: (error) => {
      addLog(`❌ 오류: ${error}`);
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setTestFile(file);
      addLog(`📁 파일 선택: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
      addLog(`   타입: ${file.type || '알 수 없음'}`);
      
      // 파일 확장자 체크
      const isHeic = file.type === 'image/heic' || file.type === 'image/heif' || 
                     file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif');
      
      if (isHeic) {
        addLog('🔥 HEIC 파일 감지됨! UltraThink 변환 준비 완료');
      } else {
        addLog('ℹ️ 일반 이미지 파일');
      }
    }
  };

  const handleUploadTest = async () => {
    if (!testFile) {
      addLog('❌ 파일을 먼저 선택해주세요');
      return;
    }

    addLog('🚀 이미지 업로드 테스트 시작...');
    clearImages();
    
    try {
      await uploadImages([testFile]);
    } catch (error) {
      addLog(`💥 업로드 실패: ${error}`);
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-6 text-3xl font-bold">🔥 UltraThink HEIC 변환 테스트</h1>
        
        {/* 파일 선택 섹션 */}
        <div className="mb-6 rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold">파일 선택</h2>
          <div className="space-y-4">
            <input
              type="file"
              accept=".heic,.heif,image/*"
              onChange={handleFileSelect}
              className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-full file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
            />
            <div className="flex gap-2">
              <button
                onClick={handleUploadTest}
                disabled={!testFile || isUploading}
                className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:bg-gray-400"
              >
                {isUploading ? '업로드 중...' : '업로드 테스트'}
              </button>
              <button
                onClick={clearLogs}
                className="rounded bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
              >
                로그 초기화
              </button>
              <button
                onClick={clearImages}
                className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
              >
                이미지 초기화
              </button>
            </div>
          </div>
        </div>

        {/* 상태 표시 */}
        <div className="mb-6 rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold">변환 상태</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="rounded bg-blue-50 p-3 text-center">
              <div className="text-2xl font-bold text-blue-600">{uploadingImages.length}</div>
              <div className="text-sm text-gray-600">총 이미지</div>
            </div>
            <div className="rounded bg-yellow-50 p-3 text-center">
              <div className="text-2xl font-bold text-yellow-600">{convertingCount}</div>
              <div className="text-sm text-gray-600">변환 중</div>
            </div>
            <div className="rounded bg-green-50 p-3 text-center">
              <div className="text-2xl font-bold text-green-600">
                {uploadingImages.filter(img => img.progress === 100 && !img.error).length}
              </div>
              <div className="text-sm text-gray-600">완료</div>
            </div>
            <div className="rounded bg-red-50 p-3 text-center">
              <div className="text-2xl font-bold text-red-600">
                {uploadingImages.filter(img => img.error).length}
              </div>
              <div className="text-sm text-gray-600">실패</div>
            </div>
          </div>
        </div>

        {/* 업로드 중인 이미지들 */}
        {uploadingImages.length > 0 && (
          <div className="mb-6 rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-semibold">이미지 목록</h2>
            <div className="space-y-3">
              {uploadingImages.map(img => (
                <div
                  key={img.id}
                  className={`flex items-center justify-between rounded p-3 ${
                    img.error
                      ? 'bg-red-50 border border-red-200'
                      : img.isConverting
                      ? 'bg-yellow-50 border border-yellow-200'
                      : img.progress === 100
                      ? 'bg-green-50 border border-green-200'
                      : 'bg-blue-50 border border-blue-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {img.preview && (
                      <img
                        src={img.preview}
                        alt="미리보기"
                        className="h-12 w-12 rounded object-cover"
                      />
                    )}
                    <div>
                      <div className="font-medium">{img.file.name}</div>
                      <div className="text-sm text-gray-600">
                        {(img.file.size / 1024).toFixed(1)} KB
                      </div>
                      {img.isConverting && (
                        <div className="text-sm text-yellow-600">🔄 변환 중...</div>
                      )}
                      {img.error && (
                        <div className="text-sm text-red-600">❌ {img.error}</div>
                      )}
                      {img.progress === 100 && !img.error && (
                        <div className="text-sm text-green-600">✅ 완료</div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-sm">{img.progress}%</div>
                    <button
                      onClick={() => removeImage(img.id)}
                      className="rounded bg-red-500 px-2 py-1 text-xs text-white hover:bg-red-600"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 로그 섹션 */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold">테스트 로그</h2>
          <div className="h-96 overflow-y-auto rounded bg-gray-900 p-4 font-mono text-sm text-green-400">
            {logs.length === 0 ? (
              <div className="text-gray-500">로그가 없습니다. HEIC 파일을 선택하고 테스트를 시작해보세요.</div>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="mb-1">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>

        {/* 사용 가이드 */}
        <div className="mt-6 rounded-lg bg-blue-50 p-6">
          <h3 className="mb-2 font-semibold text-blue-800">🔧 테스트 방법</h3>
          <ol className="list-decimal list-inside space-y-1 text-blue-700">
            <li>위 파일 선택 버튼으로 HEIC 파일을 선택하세요</li>
            <li>특히 문제가 되는 파일: <code className="bg-blue-100 px-1 rounded">6B42182F-E419-4ABF-8A96-2B5968E318B5_1_201_a.heic</code></li>
            <li>&quot;업로드 테스트&quot; 버튼을 클릭하여 변환을 시작하세요</li>
            <li>로그에서 각 변환 방법의 성공/실패를 확인하세요</li>
            <li>UltraThink 시스템이 자동으로 4가지 방법을 순차적으로 시도합니다</li>
          </ol>
        </div>
      </div>
    </div>
  );
}