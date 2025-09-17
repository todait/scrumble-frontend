export const CONDITION_SCORE_COLORS: Record<number, string> = {
  1: '#D94848',
  2: '#DF5E2B',
  3: '#E0890E',
  4: '#EDC41F',
  5: '#6CC921',
  6: '#21C993',
  7: '#27A8ED',
  8: '#3666D6',
  9: '#6A45E2',
  10: '#9747FF',
};

export const getConditionScoreColor = (score: number): string => {
  return CONDITION_SCORE_COLORS[score] || '#222222';
};
