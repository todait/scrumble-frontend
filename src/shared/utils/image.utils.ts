export const handleFileInputChange = (
  event: React.ChangeEvent<HTMLInputElement>,
  onFilesSelected: (files: File[]) => void,
  fileInputRef?: React.RefObject<HTMLInputElement | null>
) => {
  const files = Array.from(event.target.files || []);
  
  if (files.length > 0) {
    onFilesSelected(files);
  }
  
  // 같은 파일 재선택 가능하도록 초기화
  if (fileInputRef?.current) {
    fileInputRef.current.value = '';
  }
};

export const filterImageFiles = (files: File[]): File[] => {
  return files.filter(file => file.type.startsWith('image/'));
};

export const validateImageFiles = (files: File[], maxSizeInMB: number = 10): { valid: File[]; invalid: { file: File; reason: string }[] } => {
  const valid: File[] = [];
  const invalid: { file: File; reason: string }[] = [];
  
  files.forEach(file => {
    if (!file.type.startsWith('image/')) {
      invalid.push({ file, reason: '이미지 파일만 업로드 가능합니다.' });
    } else if (file.size > maxSizeInMB * 1024 * 1024) {
      invalid.push({ file, reason: `파일 크기는 ${maxSizeInMB}MB 이하여야 합니다.` });
    } else {
      valid.push(file);
    }
  });
  
  return { valid, invalid };
};