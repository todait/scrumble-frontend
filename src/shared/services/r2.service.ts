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
    try {
      console.log('=== Presigned URL 요청 시작 ===');
      console.log('파일명:', fileName, '타입:', contentType);
      
      const { data } = await uploadApiClient.post<PresignedUrlResponse>('/upload/presigned-url', {
        fileName,
        contentType,
      });
      
      console.log('=== Presigned URL 응답 ===', data);
      return data;
    } catch (error) {
      console.error('=== Presigned URL 요청 실패 ===');
      console.error('Error:', error);
      
      if (error instanceof Error) {
        console.error('Error message:', error.message);
      }
      
      // axios 에러인 경우 응답 상세 정보 로깅
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as any;
        console.error('Response status:', axiosError.response?.status);
        console.error('Response data:', axiosError.response?.data);
        console.error('Response headers:', axiosError.response?.headers);
      }
      
      throw error;
    }
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
