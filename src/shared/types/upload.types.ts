export interface ImageMetadata {
  id?: string;
  url: string;
  key: string;
  size: number;
  width: number;
  height: number;
  format: string;
  name: string;
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
