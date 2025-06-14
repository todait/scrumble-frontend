export const formatDate = (date: Date = new Date()) => {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const dayName = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()];
  return `${month}월 ${day}일 ${dayName}요일`;
};

export const formatDateForPage = (date: Date = new Date()) => {
  const monthNames = [
    '1월', '2월', '3월', '4월', '5월', '6월',
    '7월', '8월', '9월', '10월', '11월', '12월',
  ];
  const dayNames = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
  return `${monthNames[date.getMonth()]} ${date.getDate()}일 ${dayNames[date.getDay()]}`;
};

/**
 * Date 객체를 로컬 타임존을 고려한 YYYY-MM-DD 문자열로 변환
 * toISOString().split('T')[0] 대신 사용하여 UTC 변환 이슈를 방지
 */
export const formatDateToAPIString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};