export * from './cn';
export * from './date';
export * from './error';
export * from './heic-converter';
export { SubscriptionManager, subscriptionManager } from './subscriptionManager';
export * from './time';
export * from './timezone';

/**
 * 숫자를 한국어 순서로 변환
 * @param num - 변환할 숫자
 * @returns 한국어 순서 문자열 (예: 1 -> "첫", 2 -> "두", 11 -> "열한")
 */
export function convertToKoreanOrder(num: number): string {
  const koreanNumbers = ['', '첫', '두', '세', '네', '다섯', '여섯', '일곱', '여덟', '아홉', '열'];
  const koreanNumbersForTens = ['', '한', '두', '세', '네', '다섯', '여섯', '일곱', '여덟', '아홉'];

  if (num <= 0) return '';
  if (num <= 10) return koreanNumbers[num];
  if (num <= 19) return `열${koreanNumbersForTens[num - 10]}`;
  if (num === 20) return '스무';
  if (num <= 29) return `스물${koreanNumbersForTens[num - 20]}`;

  // 30 이상은 숫자로 표시
  return num.toString();
}
