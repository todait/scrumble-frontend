import type { ImageMetadata, PresignedUrlResponse } from '@/shared/types/upload.types';
import axios from 'axios';
import { TokenManager } from '@/shared/lib/token';

// Next.js API 라우트용 별도 axios 인스턴스
const uploadApiClient = axios.create({
  baseURL: '/api', // Next.js API 라우트 사용
  timeout: 30000, // 업로드는 시간이 걸릴 수 있으므로 30초로 설정
});

// 인증 토큰 추가
uploadApiClient.interceptors.request.use(
  config => {
    const token = TokenManager.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

class R2Service {
  // Presigned URL 요청
  async getPresignedUrl(fileName: string, contentType: string): Promise<PresignedUrlResponse> {
    const { data } = await uploadApiClient.post<PresignedUrlResponse>('/upload/presigned-url', {
      fileName,
      contentType,
    });
    return data;
  }

  // R2에 직접 업로드 (진행률 콜백 포함)
  async uploadToR2(
    uploadUrl: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', e => {
        if (e.lengthComputable && onProgress) {
          const progress = (e.loaded / e.total) * 100;
          onProgress(progress);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed'));
      });

      xhr.open('PUT', uploadUrl);
      xhr.setRequestHeader('Content-Type', file.type);
      xhr.send(file);
    });
  }

  // 이미지 메타데이터 추출
  async getImageMetadata(file: File): Promise<Partial<ImageMetadata>> {
    return new Promise(resolve => {
      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        resolve({
          width: img.width,
          height: img.height,
        });
        URL.revokeObjectURL(url);
      };

      img.onerror = () => {
        resolve({});
        URL.revokeObjectURL(url);
      };

      img.src = url;
    });
  }
}

export const r2Service = new R2Service();
