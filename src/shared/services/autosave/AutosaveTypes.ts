import type { ImageMetadata } from '@/shared/types/upload.types';
import type { Todo } from '@/features/todo';

// 자동 저장 데이터의 기본 구조
export interface AutosaveData<T> {
  data: T;
  timestamp: number;
  version: string;
}

// CheckIn 임시 저장 데이터
export interface CheckInAutosaveData {
  score: number | null;
  message: string;
  messageJson?: any;
  images: ImageMetadata[];
  step: 'note' | 'todo';
  todos: {
    yesterday: Todo[];
    today: Todo[];
  };
  date: string; // 체크인 날짜 (formatDateToAPIString 형식)
}

// CheckOut 임시 저장 데이터
export interface CheckOutAutosaveData {
  message: string;
  messageJson?: any;
  images: ImageMetadata[];
  step: 'todo' | 'checkout';
  todos: Todo[];
  date: string; // 체크아웃 날짜
}

// 자동 저장 상태
export type AutosaveStatus = 'idle' | 'saving' | 'saved' | 'restored' | 'error';

// 자동 저장 옵션
export interface AutosaveOptions<T = unknown> {
  debounceMs?: number; // 기본값: 1000ms
  expirationMinutes?: number; // 기본값: 60분
  onRestore?: (data: T) => void;
  onSave?: () => void;
  onError?: (error: Error) => void;
}

// 스토리지 키 타입
export type AutosaveKey = 
  | `checkin:${string}:${string}` // checkin:spaceSlug:date
  | `checkout:${string}:${string}`; // checkout:spaceSlug:date

// 자동 저장 메타데이터
export interface AutosaveMetadata {
  key: AutosaveKey;
  timestamp: number;
  expiresAt: number;
  type: 'checkin' | 'checkout';
  spaceSlug: string;
  date: string;
}