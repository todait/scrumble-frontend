import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

export const formatTime = (date: Date) => {
  const now = new Date();
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

  if (diffInHours < 24) {
    return format(date, 'a h:mm', { locale: ko });
  }
  return format(date, 'M월 d일', { locale: ko });
};

export const getConditionLabel = (score: number): string => {
  if (score >= 8) return '😊';
  if (score >= 6) return '🙂';
  if (score >= 4) return '😐';
  if (score >= 2) return '😔';
  return '😢';
};