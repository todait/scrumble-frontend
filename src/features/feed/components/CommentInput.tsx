'use client';

import { TiptapEditor } from '@/shared/components/tiptap/TiptapEditor';
import { IconButton, ImagePreviewList, LoadingSpinner } from '@/shared/components/ui';
import { useDragAndDrop } from '@/shared/hooks/useDragAndDrop';
import { useImageUpload } from '@/shared/hooks/useImageUpload';
import { useClipboardImagePaste } from '@/shared/hooks/useClipboardImagePaste';
import type { ImageMetadata } from '@/shared/types/upload.types';
import { handleFileInputChange } from '@/shared/utils/image.utils';
import { RiImageLine, RiSendPlaneFill } from '@remixicon/react';
import type { JSONContent } from '@tiptap/core';
import { useEffect, useRef, useState } from 'react';

interface CommentInputProps {
  authorName: string;
  placeholder?: string;
  onSubmit: (content: string, contentJson: JSONContent | undefined, images: ImageMetadata[]) => void;
  isSubmitting?: boolean; // 사용하지 않지만 API 호환성을 위해 유지
}

export function CommentInput({
  authorName,
  placeholder,
  onSubmit,
  isSubmitting: _isSubmitting = false, // _ prefix로 사용하지 않음을 명시
}: CommentInputProps) {
  const [plainText, setPlainText] = useState('');
  const [contentJson, setContentJson] = useState<JSONContent | undefined>();
  const [editorKey, setEditorKey] = useState(0); // 에디터 강제 리렌더용
  const [shouldFocus, setShouldFocus] = useState(false); // 제출 후 포커스 플래그
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);

  const { uploadImages, uploadingImages, completedImages, removeImage, clearImages, isUploading } =
    useImageUpload({
      onError: error => {
        alert(error);
      },
    });

  const { isDragging, dragHandlers } = useDragAndDrop({
    onDrop: uploadImages,
    acceptedFileTypes: ['image/'],
  });

  const { handlePaste: handleClipboardPaste } = useClipboardImagePaste({
    onImagePaste: uploadImages,
    onError: error => {
      alert(error);
    },
  });

  const handleSubmit = () => {
    if (plainText.trim() || completedImages.length > 0) {
      // 이미지 상태를 먼저 복사해서 안전하게 전달
      const imagesToSubmit = [...completedImages];
      const textToSubmit = plainText.trim();
      const jsonToSubmit = contentJson;

      // 복사된 데이터로 제출
      onSubmit(textToSubmit, jsonToSubmit, imagesToSubmit);

      // 제출 후 상태 초기화
      clearImages();
      setPlainText('');
      setContentJson(undefined);
      setEditorKey(prev => prev + 1); // 에디터 강제 리마운트
      setShouldFocus(true); // 포커스 플래그 설정
    }
  };

  // 에디터 리마운트 후 포커스
  useEffect(() => {
    if (shouldFocus) {
      // 에디터가 리마운트될 시간을 주기 위해 약간의 지연
      const timer = setTimeout(() => {
        const editor = editorContainerRef.current?.querySelector('[data-tiptap-editor]');
        if (editor) {
          (editor as HTMLElement).focus();
        }
        setShouldFocus(false);
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [shouldFocus, editorKey]); // editorKey 변경 시에도 확인

  // 업로드 중인 이미지가 있는지 확인
  const hasUploadingImages = uploadingImages.some(
    img => (img.progress > 0 && img.progress < 100) || !img.metadata
  );

  const isSubmitEnabled =
    (plainText.trim().length > 0 || completedImages.length > 0) &&
    !isUploading &&
    !hasUploadingImages;

  const displayPlaceholder = placeholder || `${authorName}님의 체크인에 가볍게 코멘트를 남겨보세요`;

  return (
    <div
      className={`relative flex flex-col gap-4 rounded-xl border border-[rgba(34,34,34,0.08)] bg-white p-4 transition-colors ${
        isDragging ? 'bg-blue-50' : ''
      }`}
      {...dragHandlers}
    >
      {/* 텍스트 입력 영역 - TiptapEditor */}
      <div ref={editorContainerRef} className="flex items-start gap-2">
        <div className="relative flex-1">
          <TiptapEditor
            key={editorKey}
            content={contentJson}
            onChange={(json, text) => {
              setContentJson(json);
              setPlainText(text);
            }}
            placeholder={displayPlaceholder}
            minHeight={22}
            maxHeight={150}
            disabled={false}
            onKeyDown={(event, _editor) => {
              // Enter 키로 제출 (Shift+Enter는 줄바꿈)
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                handleSubmit();
                return true;
              }
              return false;
            }}
            onPaste={handleClipboardPaste}
          />
        </div>
      </div>

      {/* 이미지 미리보기 */}
      {uploadingImages.length > 0 && (
        <ImagePreviewList images={uploadingImages} onRemove={removeImage} disabled={false} />
      )}

      {/* 하단 액션 바 */}
      <div className="flex items-center justify-between">
        {/* 왼쪽 액션 버튼들 */}
        <div className="flex items-center gap-1">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={e => handleFileInputChange(e, uploadImages, fileInputRef)}
            className="hidden"
            disabled={isUploading}
          />
          <IconButton
            icon={<RiImageLine className="h-4 w-4 text-[#222222] opacity-50" />}
            title="이미지 첨부"
            className="h-8 w-8 hover:bg-[#F1F1F1] active:bg-[#E5E5E5]"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          />
          {/* <IconButton
            icon={<RiAttachment2 className="h-4 w-4 text-[#222222] opacity-50" />}
            title="파일 첨부"
            className="h-8 w-8 hover:bg-[#F1F1F1] active:bg-[#E5E5E5]"
          />
          <IconButton
            icon={<RiAtLine className="h-4 w-4 text-[#222222] opacity-50" />}
            title="멘션"
            className="h-8 w-8 hover:bg-[#F1F1F1] active:bg-[#E5E5E5]"
          /> */}
        </div>

        {/* 오른쪽 전송 버튼 */}
        <button
          onClick={handleSubmit}
          disabled={!isSubmitEnabled}
          className={`flex items-center justify-center rounded border transition-all ${
            isSubmitEnabled
              ? 'border-[rgba(255,255,255,0.08)] bg-[#9747FF] hover:bg-[#8537EF]'
              : 'border-[rgba(255,255,255,0.08)] bg-[#9747FF] opacity-30'
          } ${isUploading ? 'min-w-[120px] px-3' : 'h-8 w-8'}`}
          title="전송"
        >
          {isUploading ? (
            <>
              <LoadingSpinner size="sm" className="mr-2 text-white" />
              <span className="text-sm text-white">업로드 중...</span>
            </>
          ) : (
            <RiSendPlaneFill className="h-4 w-4 text-white" />
          )}
        </button>
      </div>

      {/* 드래그 오버레이 */}
      {isDragging && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-blue-50 bg-opacity-90">
          <div className="rounded-lg bg-white p-4 shadow-lg">
            <p className="text-sm font-medium text-blue-600">이미지를 여기에 놓으세요</p>
          </div>
        </div>
      )}
    </div>
  );
}
