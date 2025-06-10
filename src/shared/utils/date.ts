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