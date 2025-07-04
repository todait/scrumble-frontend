export interface ImageMetadata {
  id?: string;
  url: string;
  key: string;
  size: number;
  width: number;
  height: number;
  format: string;
  name: string;
  isTemporary?: boolean; // WebSocket 이벤트로 받은 임시 데이터 여부
}

export interface UploadingImage {
  id: string;
  file: File;
  preview: string;
  progress: number;
  error?: string;
  metadata?: ImageMetadata;
}

export interface PresignedUrlResponse {
  uploadUrl: string;
  publicUrl: string;
  key: string;
}
