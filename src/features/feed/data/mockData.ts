import type { Post, TeamSummary } from '../types/feed.types';

export const mockPosts: Post[] = [
  {
    id: '1',
    type: 'checkout',
    author: { id: '1', name: '강지은', profileImage: '' },
    content:
      '숱한 나무들 무성히 무성히 우거진 산마루에 금빛 기름진 햇살은 내려오고, 둥둥 산을 넘어 흰 구름 걷는 자리 씻기는 하늘 사슴도 안 오고 바람도 안 불고 너멋골 골짜기서 울어 오는 뻐꾸기. 아득히 가 버린 것 잊어버린 하늘과 아른아른 오지 않고 보고 싶은 하늘에 어쩌면 만도 질 볼이 고운 사람이 난 혼자 그리워라.',
    createdAt: new Date('2024-06-22T11:02:00'),
    updatedAt: new Date('2024-06-22T11:05:00'),
    reactions: [
      { emoji: '🌼', count: 12, userIds: ['2', '3', '4'] },
      { emoji: '💕', count: 0, userIds: [] },
      { emoji: '😍', count: 0, userIds: [] },
      { emoji: '🥰', count: 12, userIds: ['5', '6'] },
    ],
    comments: [
      {
        id: '1',
        author: { id: '2', name: '이민수' },
        content: '좋은 하루 보내세요!',
        createdAt: new Date(),
      },
      {
        id: '2',
        author: { id: '3', name: '박서연' },
        content: '수고하셨습니다!',
        createdAt: new Date(),
      },
      {
        id: '3',
        author: { id: '4', name: '김준호' },
        content: '오늘도 화이팅!',
        createdAt: new Date(),
      },
    ],
    commentCount: 999,
    lastCommentTime: new Date(Date.now() - 24 * 60 * 1000),
  },
  {
    id: '2',
    type: 'checkin',
    author: { id: '2', name: '이선우', profileImage: '' },
    content:
      '저건 또 무슨 꽃이지. 적잖이 비탈진 곳에 칡덩굴이 엉키어 꽃을 달고 있었다. 그 날, 도랑을 건너면서 내가 업힌 일이 있지. 그 때, 네 등에서 옮은 물이다.',
    createdAt: new Date('2024-06-22T11:02:00'),
    conditionScore: 10,
    conditionEmoji: '🦄',
    reactions: [
      { emoji: '😃', count: 12, userIds: ['1', '3'] },
      { emoji: '🌺', count: 12, userIds: ['4', '5'] },
      { emoji: '🍭', count: 0, userIds: [] },
      { emoji: '💕', count: 0, userIds: [] },
    ],
    comments: [
      { id: '1', author: { id: '1', name: '강지은' }, content: '멋져요!', createdAt: new Date() },
      {
        id: '2',
        author: { id: '3', name: '박서연' },
        content: '좋은 하루!',
        createdAt: new Date(),
      },
      { id: '3', author: { id: '4', name: '김준호' }, content: '화이팅!', createdAt: new Date() },
      { id: '4', author: { id: '5', name: '최민지' }, content: '👍', createdAt: new Date() },
      { id: '5', author: { id: '6', name: '정하늘' }, content: '최고예요!', createdAt: new Date() },
    ],
    commentCount: 999,
    lastCommentTime: new Date(Date.now() - 24 * 60 * 1000),
  },
  {
    id: '3',
    type: 'checkin',
    author: { id: '3', name: '김유진', profileImage: '' },
    content:
      '소년은 공연히 열없어, 책보를 집어던지고는 외양간으로 가, 쇠잔등을 한 번 철썩 갈겼다. 그리고는, 안고 온 꽃묶음 속에서 가지가 꺾이고 꽃이 일그러진 송이를 골라 발 밑에 버린다.',
    createdAt: new Date('2024-06-22T11:02:00'),
    conditionScore: 7,
    conditionEmoji: '🎵',
    reactions: [
      { emoji: '🐝', count: 0, userIds: [] },
      { emoji: '😀', count: 5, userIds: ['1', '2'] },
      { emoji: '🍯', count: 0, userIds: [] },
      { emoji: '👍', count: 8, userIds: ['4', '5', '6'] },
    ],
    comments: [],
    commentCount: 0,
  },
  {
    id: '4',
    type: 'checkin',
    author: { id: '4', name: '이영준', profileImage: '' },
    content: '티끌 부는 세상에도 벌레 같은 세상에도 눈 맑은 가슴 맑은 보고 지운 나의 사람.',
    createdAt: new Date('2024-06-22T11:02:00'),
    conditionScore: 4,
    conditionEmoji: '🐌',
    reactions: [
      { emoji: '💐', count: 12, userIds: ['1', '2', '3'] },
      { emoji: '🎶', count: 12, userIds: ['5', '6'] },
      { emoji: '🤗', count: 0, userIds: [] },
      { emoji: '🎈', count: 0, userIds: [] },
    ],
    comments: [
      { id: '1', author: { id: '1', name: '강지은' }, content: '힘내세요!', createdAt: new Date() },
      {
        id: '2',
        author: { id: '2', name: '이선우' },
        content: '응원합니다!',
        createdAt: new Date(),
      },
      {
        id: '3',
        author: { id: '3', name: '김유진' },
        content: '같이 힘내요!',
        createdAt: new Date(),
      },
    ],
    commentCount: 999,
    lastCommentTime: new Date(Date.now() - 24 * 60 * 1000),
    images: ['/sample1.jpg', '/sample2.jpg', '/sample3.jpg', '/sample4.jpg'],
  },
  {
    id: '5',
    type: 'checkin',
    author: { id: '5', name: '윤주', profileImage: '' },
    content:
      '푸른 산 한나절 구름은 가고 고을 너머 뻐꾸기는 우는데 눈에 어려 흘러가는 물결 같은 사람 속 아우성쳐 흘러가는 물결 같은 사람 속에 난 그리노라. 청산도 산아 우뚝 솟은 푸른 산아.\n\n숱한 나무들 무성히 무성히 우거진 산마루에 금빛 기름진 햇살은 내려오고, 둥둥 산을 넘어 흰 구름 걷는 자리 씻기는 하늘 사슴도 안',
    createdAt: new Date('2024-06-22T11:02:00'),
    conditionScore: 2,
    conditionEmoji: '💢',
    reactions: [
      { emoji: '🌸', count: 12, userIds: ['1', '2'] },
      { emoji: '😃', count: 12, userIds: ['3', '4'] },
      { emoji: '😊', count: 0, userIds: [] },
      { emoji: '🌈', count: 0, userIds: [] },
    ],
    comments: [
      { id: '1', author: { id: '1', name: '강지은' }, content: '힘내세요!', createdAt: new Date() },
      {
        id: '2',
        author: { id: '2', name: '이선우' },
        content: '곧 좋은 일이 있을 거예요!',
        createdAt: new Date(),
      },
      {
        id: '3',
        author: { id: '3', name: '김유진' },
        content: '응원합니다!',
        createdAt: new Date(),
      },
    ],
    commentCount: 999,
    lastCommentTime: new Date(Date.now() - 24 * 60 * 1000),
    images: ['/sample1.jpg', '/sample2.jpg'],
  },
  {
    id: '6',
    type: 'checkin',
    author: { id: '6', name: '최우', profileImage: '' },
    content:
      '아득히 가 버린 것 잊어버린 하늘과 아른아른 오지 않고 보고 싶은 하늘에 어쩌면 만도 질 볼이 고운 사람이 난 혼자 그리워라. 숱한 나무들 무성히 무성히 우거진 산마루에 금빛 기름진 햇살은 내려오고, 둥둥 산을 넘어 흰 구름 걷는 자리 씻기는 하늘 사슴도 안 오고 바람도 안 불고 너멋골 골짜기서 울어 오는 뻐꾸기.',
    createdAt: new Date('2024-06-22T11:02:00'),
    conditionScore: 6,
    conditionEmoji: '🪴',
    reactions: [
      { emoji: '🥳', count: 12, userIds: ['1', '2', '3'] },
      { emoji: '🍭', count: 12, userIds: ['4', '5'] },
      { emoji: '🍀', count: 0, userIds: [] },
      { emoji: '🌻', count: 0, userIds: [] },
    ],
    comments: [
      {
        id: '1',
        author: { id: '1', name: '강지은' },
        content: '좋은 글이네요!',
        createdAt: new Date(),
      },
      {
        id: '2',
        author: { id: '2', name: '이선우' },
        content: '공감됩니다!',
        createdAt: new Date(),
      },
      { id: '3', author: { id: '3', name: '김유진' }, content: '멋져요!', createdAt: new Date() },
    ],
    commentCount: 999,
    lastCommentTime: new Date(Date.now() - 24 * 60 * 1000),
    images: ['/sample1.jpg', '/sample2.jpg'],
  },
];

export const mockTeamSummary: TeamSummary = {
  teamCondition: 7.2,
  checkedInCount: 14,
  totalMembers: 14,
  checkedOutCount: 26,
};