import type { ImageMetadata } from '@/shared/types/upload.types';
import type { CheckinPost, CheckoutPost, Post, TeamSummary } from '../types/feed.types';

// 헬퍼 함수: URL을 ImageMetadata로 변환
const createMockImageMetadata = (urls: string[]): ImageMetadata[] => {
  return urls.map((url, index) => ({
    url,
    key: `mock-image-${index}-${Date.now()}`,
    size: 1024 * 1024, // 1MB
    width: 800,
    height: 600,
    format: 'jpg',
    name: `mock-image-${index}.jpg`,
  }));
};

const createMockPosts = (): Post[] => {
  const posts: (Omit<CheckinPost, 'commentCount'> | Omit<CheckoutPost, 'commentCount'>)[] = [
    {
      id: '1',
      type: 'checkout',
      author: {
        id: '1',
        name: '강지은',
        profileImage: 'https://randomuser.me/api/portraits/women/1.jpg',
      },
      reflectionText:
        '숱한 나무들 무성히 무성히 우거진 산마루에 금빛 기름진 햇살은 내려오고, 둥둥 산을 넘어 흰 구름 걷는 자리 씻기는 하늘 사슴도 안 오고 바람도 안 불고 너멋골 골짜기서 울어 오는 뻐꾸기. 아득히 가 버린 것 잊어버린 하늘과 아른아른 오지 않고 보고 싶은 하늘에 어쩌면 만도 질 볼이 고운 사람이 난 혼자 그리워라.',
      postedAt: new Date('2024-06-22T11:02:00'),
      createdAt: new Date('2024-06-22T11:02:00'),
      updatedAt: new Date('2024-06-22T11:05:00'),
      reactions: [
        { emoji: '🌼', count: 12, spaceMemberIds: ['3', '4', '5'] },
        { emoji: '💕', count: 1, spaceMemberIds: ['2'] },
        { emoji: '😍', count: 0, spaceMemberIds: [] },
        { emoji: '🥰', count: 12, spaceMemberIds: ['5', '6'] },
      ],
      comments: [
        {
          id: '1',
          author: {
            id: '2',
            name: '이민수',
            profileImage: 'https://randomuser.me/api/portraits/men/2.jpg',
          },
          content: '좋은 하루 보내세요!',
          createdAt: new Date(),
          reactions: [],
        },
        {
          id: '2',
          author: {
            id: '3',
            name: '박서연',
            profileImage: 'https://randomuser.me/api/portraits/women/3.jpg',
          },
          content: '수고하셨습니다!',
          createdAt: new Date(),
          reactions: [],
        },
        {
          id: '3',
          author: {
            id: '4',
            name: '김준호',
            profileImage: 'https://randomuser.me/api/portraits/men/4.jpg',
          },
          content: '오늘도 화이팅!',
          createdAt: new Date(),
          reactions: [],
        },
      ],
      lastCommentTime: new Date(Date.now() - 24 * 60 * 1000),
    },
    {
      id: '2',
      type: 'checkin',
      author: {
        id: '2',
        name: '이선우',
        profileImage: 'https://randomuser.me/api/portraits/men/2.jpg',
      },
      conditionText:
        '저건 또 무슨 꽃이지. 적잖이 비탈진 곳에 칡덩굴이 엉키어 꽃을 달고 있었다. 그 날, 도랑을 건너면서 내가 업힌 일이 있지. 그 때, 네 등에서 옮은 물이다.',
      postedAt: new Date('2024-06-22T11:02:00'),
      createdAt: new Date('2024-06-22T11:02:00'),
      conditionScore: 10,
      conditionEmoji: '🦄',
      reactions: [
        { emoji: '😃', count: 12, spaceMemberIds: ['1', '3'] },
        { emoji: '🌺', count: 12, spaceMemberIds: ['4', '5'] },
        { emoji: '🍭', count: 0, spaceMemberIds: [] },
        { emoji: '💕', count: 0, spaceMemberIds: [] },
      ],
      comments: [
        {
          id: '1',
          author: {
            id: '1',
            name: '강지은',
            profileImage: 'https://randomuser.me/api/portraits/women/1.jpg',
          },
          content:
            '꽃이 정말 아름답네요! 칡덩굴에도 이렇게 예쁜 꽃이 피는군요.\n자연의 신비로움을 다시 한번 느끼게 됩니다.',
          createdAt: new Date(Date.now() - 5 * 60 * 1000),
          reactions: [],
        },
        {
          id: '2',
          author: {
            id: '3',
            name: '박서연',
            profileImage: 'https://randomuser.me/api/portraits/women/3.jpg',
          },
          content: '추억이 담긴 이야기네요. 그때 그 순간이 떠오르는 것 같아요.',
          createdAt: new Date(Date.now() - 15 * 60 * 1000),
          reactions: [],
          images: createMockImageMetadata([
            'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=400&h=300&fit=crop',
          ]),
        },
        {
          id: '3',
          author: {
            id: '4',
            name: '김준호',
            profileImage: 'https://randomuser.me/api/portraits/men/4.jpg',
          },
          content:
            '도랑을 건너던 그 날의 기억이 생생하게 전해지네요.\n물이 옮은 이야기도 재미있어요! 😊',
          createdAt: new Date(Date.now() - 30 * 60 * 1000),
          images: createMockImageMetadata([
            'https://images.unsplash.com/photo-1490730141103-6cac27aaab94?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=400&h=300&fit=crop',
          ]),
        },
        {
          id: '4',
          author: {
            id: '7',
            name: '박지훈',
            profileImage: 'https://randomuser.me/api/portraits/men/11.jpg',
          },
          content:
            '칡꽃은 보라색이 참 예쁘죠. 향기도 좋고요.\n어릴 적 시골에서 많이 봤던 기억이 나네요. 그립습니다.',
          createdAt: new Date(Date.now() - 45 * 60 * 1000),
        },
        {
          id: '5',
          author: {
            id: '8',
            name: '김소연',
            profileImage: 'https://randomuser.me/api/portraits/women/12.jpg',
          },
          content: '비탈진 곳에서도 꿋꿋하게 피어나는 꽃들을 보면 대단하다는 생각이 들어요.',
          createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
          images: createMockImageMetadata([
            'https://images.unsplash.com/photo-1462275646964-a0e3386b89fa?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1497250681960-ef046c08a56e?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1455659817273-f96807779a8a?w=400&h=300&fit=crop',
          ]),
        },
        {
          id: '6',
          author: {
            id: '9',
            name: '이동현',
            profileImage: 'https://randomuser.me/api/portraits/men/13.jpg',
          },
          content:
            '자연 속에서 발견하는 작은 아름다움들이 일상을 풍요롭게 해주는 것 같아요.\n오늘도 좋은 하루 보내세요! 🌸',
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        },
        {
          id: '7',
          author: {
            id: '10',
            name: '최유나',
            profileImage: 'https://randomuser.me/api/portraits/women/14.jpg',
          },
          content: '물이 옮았다는 표현이 정말 재미있네요!',
          createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
          images: createMockImageMetadata([
            'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=400&h=300&fit=crop',
          ]),
        },
        {
          id: '8',
          author: {
            id: '11',
            name: '정민수',
            profileImage: 'https://randomuser.me/api/portraits/men/15.jpg',
          },
          content:
            '칡덩굴이 엉킨 모습도 나름의 운치가 있죠.\n자연의 모습 그대로가 가장 아름다운 것 같아요.\n사진으로 담아보고 싶네요!',
          createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
          images: createMockImageMetadata([
            'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=400&h=300&fit=crop',
          ]),
        },
        {
          id: '9',
          author: {
            id: '12',
            name: '김태연',
            profileImage: 'https://randomuser.me/api/portraits/women/16.jpg',
          },
          content: '꽃을 보면 마음이 편안해지는 것 같아요. 🌺',
          createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
        },
        {
          id: '10',
          author: {
            id: '13',
            name: '이재호',
            profileImage: 'https://randomuser.me/api/portraits/men/17.jpg',
          },
          content:
            '어릴 적 추억이 떠오르네요.\n저도 친구들과 도랑을 건너며 놀던 기억이 있어요.\n그때가 그립습니다.',
          createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
          images: createMockImageMetadata([
            'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?w=400&h=300&fit=crop',
          ]),
        },
        {
          id: '11',
          author: {
            id: '14',
            name: '박하은',
            profileImage: 'https://randomuser.me/api/portraits/women/18.jpg',
          },
          content: '그날의 감정까지 전해지는 것 같아요. 따뜻한 글 감사합니다.',
          createdAt: new Date(Date.now() - 7 * 60 * 60 * 1000),
        },
        {
          id: '12',
          author: {
            id: '15',
            name: '최준영',
            profileImage: 'https://randomuser.me/api/portraits/men/19.jpg',
          },
          content:
            '비탈진 곳에서도 생명은 피어나네요.\n우리도 어려운 상황에서도 희망을 잃지 말아야겠어요.\n힘내세요! 💪',
          createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
          images: createMockImageMetadata([
            'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=400&h=300&fit=crop',
          ]),
        },
        {
          id: '13',
          author: {
            id: '16',
            name: '송민지',
            profileImage: 'https://randomuser.me/api/portraits/women/20.jpg',
          },
          content: '자연을 관찰하는 섬세한 시선이 느껴져요. 👀',
          createdAt: new Date(Date.now() - 9 * 60 * 60 * 1000),
        },
        {
          id: '14',
          author: {
            id: '17',
            name: '김동욱',
            profileImage: 'https://randomuser.me/api/portraits/men/21.jpg',
          },
          content: '칡꽃의 향기가 여기까지 전해지는 것 같네요.\n봄날의 추억이 새록새록 떠오릅니다.',
          createdAt: new Date(Date.now() - 10 * 60 * 60 * 1000),
          images: createMockImageMetadata([
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
          ]),
        },
        {
          id: '15',
          author: {
            id: '18',
            name: '이서연',
            profileImage: 'https://randomuser.me/api/portraits/women/22.jpg',
          },
          content:
            '물이 옮았다는 표현이 너무 귀여워요! 😄\n그런 순간들이 오래 기억에 남는 것 같아요.\n좋은 추억이네요.',
          createdAt: new Date(Date.now() - 11 * 60 * 60 * 1000),
        },
        {
          id: '16',
          author: {
            id: '19',
            name: '박성준',
            profileImage: 'https://randomuser.me/api/portraits/men/23.jpg',
          },
          content: '자연과 함께한 추억이 가장 오래 남는 것 같아요.',
          createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
          images: createMockImageMetadata([
            'https://images.unsplash.com/photo-1505765050516-f72dcac9c60e?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1439853949127-fa647821eba0?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=400&h=300&fit=crop',
          ]),
        },
        {
          id: '17',
          author: {
            id: '20',
            name: '정유진',
            profileImage: 'https://randomuser.me/api/portraits/women/24.jpg',
          },
          content:
            '칡덩굴의 생명력이 대단하죠!\n어디서든 뿌리를 내리고 꽃을 피우는 모습이 감동적이에요.',
          createdAt: new Date(Date.now() - 13 * 60 * 60 * 1000),
        },
        {
          id: '18',
          author: {
            id: '21',
            name: '이민재',
            profileImage: 'https://randomuser.me/api/portraits/men/25.jpg',
          },
          content:
            '업혔던 기억까지 생생하게 전해지네요.\n친구와의 소중한 추억이었겠어요.\n그런 순간들이 우리를 더 가깝게 만들어주죠.',
          createdAt: new Date(Date.now() - 14 * 60 * 60 * 1000),
          images: createMockImageMetadata([
            'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1494500764479-0c8f2919a3d8?w=400&h=300&fit=crop',
          ]),
        },
        {
          id: '19',
          author: {
            id: '22',
            name: '김나영',
            profileImage: 'https://randomuser.me/api/portraits/women/26.jpg',
          },
          content: '자연을 느끼며 살아가는 삶이 부럽네요. 🌿',
          createdAt: new Date(Date.now() - 15 * 60 * 60 * 1000),
        },
        {
          id: '20',
          author: {
            id: '23',
            name: '최현우',
            profileImage: 'https://randomuser.me/api/portraits/men/27.jpg',
          },
          content:
            '비탈진 곳의 칡덩굴이라니, 정말 특별한 발견이네요!\n자연은 언제나 우리에게 놀라움을 선사하는 것 같아요.\n내일도 좋은 발견이 있기를!',
          createdAt: new Date(Date.now() - 16 * 60 * 60 * 1000),
          images: createMockImageMetadata([
            'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1490730141103-6cac27aaab94?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=400&h=300&fit=crop',
          ]),
        },
        {
          id: '21',
          author: {
            id: '5',
            name: '최민지',
            profileImage: 'https://randomuser.me/api/portraits/women/5.jpg',
          },
          content: '오늘도 멋진 하루 보내세요! 👍',
          createdAt: new Date(Date.now() - 17 * 60 * 60 * 1000),
        },
        {
          id: '22',
          author: {
            id: '6',
            name: '정하늘',
            profileImage: 'https://randomuser.me/api/portraits/women/6.jpg',
          },
          content: '최고예요! 자연과 함께하는 순간이 가장 행복한 것 같아요.',
          createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000),
        },
        {
          id: '23',
          author: {
            id: '24',
            name: '김수현',
            profileImage: 'https://randomuser.me/api/portraits/women/28.jpg',
          },
          content:
            '칡꽃을 보니 어머니가 해주시던 칡차가 생각나네요.\n건강에도 좋고 맛도 좋았던 기억이 있어요.\n오늘 저녁엔 칡차 한잔 해야겠어요! ☕',
          createdAt: new Date(Date.now() - 19 * 60 * 60 * 1000),
          images: createMockImageMetadata([
            'https://images.unsplash.com/photo-1497250681960-ef046c08a56e?w=400&h=300&fit=crop',
          ]),
        },
        {
          id: '24',
          author: {
            id: '25',
            name: '이승호',
            profileImage: 'https://randomuser.me/api/portraits/men/29.jpg',
          },
          content: '도랑을 건너며 업힌 추억이라니 정말 재미있네요! 😊',
          createdAt: new Date(Date.now() - 20 * 60 * 60 * 1000),
        },
        {
          id: '25',
          author: {
            id: '26',
            name: '박지민',
            profileImage: 'https://randomuser.me/api/portraits/women/30.jpg',
          },
          content: '칡덩굴의 끈질긴 생명력처럼 우리도 강하게 살아가요!',
          createdAt: new Date(Date.now() - 21 * 60 * 60 * 1000),
          images: createMockImageMetadata([
            'https://images.unsplash.com/photo-1462275646964-a0e3386b89fa?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1455659817273-f96807779a8a?w=500&h=200&fit=crop',
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1505765050516-f72dcac9c60e?w=1440&h=1080&fit=crop',
            'https://images.unsplash.com/photo-1439853949127-fa647821eba0?w=1440&h=1080&fit=crop',
            'https://images.unsplash.com/photo-1462275646964-a0e3386b89fa?w=1440&h=1080&fit=crop',
            'https://images.unsplash.com/photo-1455659817273-f96807779a8a?w=1440&h=1080&fit=crop',
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=300&fit=crop',
            'https://images.unsplash.com/photo-1505765050516-f72dcac9c60e?w=400&h=1200&fit=crop',
            'https://images.unsplash.com/photo-1439853949127-fa647821eba0?w=400&h=300&fit=crop',
          ]),
        },
      ],
      lastCommentTime: new Date(Date.now() - 24 * 60 * 1000),
    },
    {
      id: '3',
      type: 'checkin',
      author: {
        id: '3',
        name: '김유진',
        profileImage: 'https://randomuser.me/api/portraits/women/7.jpg',
      },
      conditionText:
        '소년은 공연히 열없어, 책보를 집어던지고는 외양간으로 가, 쇠잔등을 한 번 철썩 갈겼다. 그리고는, 안고 온 꽃묶음 속에서 가지가 꺾이고 꽃이 일그러진 송이를 골라 발 밑에 버린다.',
      postedAt: new Date('2024-06-22T11:02:00'),
      createdAt: new Date('2024-06-22T11:02:00'),
      conditionScore: 7,
      conditionEmoji: '🎵',
      reactions: [
        { emoji: '🐝', count: 0, spaceMemberIds: [] },
        { emoji: '😀', count: 5, spaceMemberIds: ['1', '2'] },
        { emoji: '🍯', count: 0, spaceMemberIds: [] },
        { emoji: '👍', count: 8, spaceMemberIds: ['4', '5', '6'] },
      ],
      comments: [],
      images: createMockImageMetadata([
        'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=300&fit=crop',
      ]),
    },
    {
      id: '4',
      type: 'checkin',
      author: {
        id: '4',
        name: '이영준',
        profileImage: 'https://randomuser.me/api/portraits/men/8.jpg',
      },
      conditionText: '티끌 부는 세상에도 벌레 같은 세상에도 눈 맑은 가슴 맑은 보고 지운 나의 사람.',
      postedAt: new Date('2024-06-22T11:02:00'),
      createdAt: new Date('2024-06-22T11:02:00'),
      conditionScore: 4,
      conditionEmoji: '🐌',
      reactions: [
        { emoji: '💐', count: 12, spaceMemberIds: ['1', '2', '3'] },
        { emoji: '🎶', count: 12, spaceMemberIds: ['5', '6'] },
        { emoji: '🤗', count: 0, spaceMemberIds: [] },
        { emoji: '🎈', count: 0, spaceMemberIds: [] },
      ],
      comments: [
        {
          id: '1',
          author: {
            id: '1',
            name: '강지은',
            profileImage: 'https://randomuser.me/api/portraits/women/1.jpg',
          },
          content: '힘내세요!',
          createdAt: new Date(),
        },
        {
          id: '2',
          author: {
            id: '2',
            name: '이선우',
            profileImage: 'https://randomuser.me/api/portraits/men/2.jpg',
          },
          content: '응원합니다!',
          createdAt: new Date(),
        },
        {
          id: '3',
          author: {
            id: '3',
            name: '김유진',
            profileImage: 'https://randomuser.me/api/portraits/women/7.jpg',
          },
          content: '같이 힘내요!',
          createdAt: new Date(),
        },
      ],
      lastCommentTime: new Date(Date.now() - 24 * 60 * 1000),
      images: createMockImageMetadata([
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1920&h=1080&fit=crop',
        'https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?w=1200&h=400&fit=crop',
        'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?w=400&h=800&fit=crop',
        'https://images.unsplash.com/photo-1494500764479-0c8f2919a3d8?w=1600&h=900&fit=crop',
        'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&h=1200&fit=crop',
        'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=2000&h=800&fit=crop',
        'https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=400&h=600&fit=crop',
        'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=1440&h=960&fit=crop',
        'https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=800&h=1600&fit=crop',
        'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=3000&h=2000&fit=crop',
        'https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?w=600&h=400&fit=crop',
      ]),
    },
    {
      id: '5',
      type: 'checkin',
      author: {
        id: '5',
        name: '윤주',
        profileImage: 'https://randomuser.me/api/portraits/women/9.jpg',
      },
      conditionText:
        '푸른 산 한나절 구름은 가고 고을 너머 뻐꾸기는 우는데 눈에 어려 흘러가는 물결 같은 사람 속 아우성쳐 흘러가는 물결 같은 사람 속에 난 그리노라. 청산도 산아 우뚝 솟은 푸른 산아.\n\n숱한 나무들 무성히 무성히 우거진 산마루에 금빛 기름진 햇살은 내려오고, 둥둥 산을 넘어 흰 구름 걷는 자리 씻기는 하늘 사슴도 안',
      postedAt: new Date('2024-06-22T11:02:00'),
      createdAt: new Date('2024-06-22T11:02:00'),
      conditionScore: 2,
      conditionEmoji: '💢',
      reactions: [
        { emoji: '🌸', count: 12, spaceMemberIds: ['1', '2'] },
        { emoji: '😃', count: 12, spaceMemberIds: ['3', '4'] },
        { emoji: '😊', count: 0, spaceMemberIds: [] },
        { emoji: '🌈', count: 0, spaceMemberIds: [] },
      ],
      comments: [
        {
          id: '1',
          author: {
            id: '1',
            name: '강지은',
            profileImage: 'https://randomuser.me/api/portraits/women/1.jpg',
          },
          content: '힘내세요!',
          createdAt: new Date(),
        },
        {
          id: '2',
          author: {
            id: '2',
            name: '이선우',
            profileImage: 'https://randomuser.me/api/portraits/men/2.jpg',
          },
          content: '곧 좋은 일이 있을 거예요!',
          createdAt: new Date(),
        },
        {
          id: '3',
          author: {
            id: '3',
            name: '김유진',
            profileImage: 'https://randomuser.me/api/portraits/women/7.jpg',
          },
          content: '응원합니다!',
          createdAt: new Date(),
        },
      ],
      lastCommentTime: new Date(Date.now() - 24 * 60 * 1000),
      images: createMockImageMetadata([
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400&h=300&fit=crop',
      ]),
    },
    {
      id: '6',
      type: 'checkin',
      author: {
        id: '6',
        name: '최우',
        profileImage: 'https://randomuser.me/api/portraits/men/10.jpg',
      },
      conditionText:
        '아득히 가 버린 것 잊어버린 하늘과 아른아른 오지 않고 보고 싶은 하늘에 어쩌면 만도 질 볼이 고운 사람이 난 혼자 그리워라. 숱한 나무들 무성히 무성히 우거진 산마루에 금빛 기름진 햇살은 내려오고, 둥둥 산을 넘어 흰 구름 걷는 자리 씻기는 하늘 사슴도 안 오고 바람도 안 불고 너멋골 골짜기서 울어 오는 뻐꾸기.',
      postedAt: new Date('2024-06-22T11:02:00'),
      createdAt: new Date('2024-06-22T11:02:00'),
      conditionScore: 6,
      conditionEmoji: '🪴',
      reactions: [
        { emoji: '🥳', count: 12, spaceMemberIds: ['1', '2', '3'] },
        { emoji: '🍭', count: 12, spaceMemberIds: ['4', '5'] },
        { emoji: '🍀', count: 0, spaceMemberIds: [] },
        { emoji: '🌻', count: 0, spaceMemberIds: [] },
      ],
      comments: [
        {
          id: '1',
          author: {
            id: '1',
            name: '강지은',
            profileImage: 'https://randomuser.me/api/portraits/women/1.jpg',
          },
          content: '좋은 글이네요!',
          createdAt: new Date(),
        },
        {
          id: '2',
          author: {
            id: '2',
            name: '이선우',
            profileImage: 'https://randomuser.me/api/portraits/men/2.jpg',
          },
          content: '공감됩니다!',
          createdAt: new Date(),
        },
        {
          id: '3',
          author: {
            id: '3',
            name: '김유진',
            profileImage: 'https://randomuser.me/api/portraits/women/7.jpg',
          },
          content: '멋져요!',
          createdAt: new Date(),
        },
      ],
      lastCommentTime: new Date(Date.now() - 24 * 60 * 1000),
      images: createMockImageMetadata([
        'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
      ]),
    },
  ];

  return posts.map(post => ({
    ...post,
    comments: post.comments.map(comment => ({
      reactions: [],
      ...comment,
    })),
    commentCount: post.comments.length,
  })) as Post[];
};

export const mockPosts: Post[] = createMockPosts();

export const mockTeamSummary: TeamSummary = {
  teamCondition: 7.2,
  checkedInCount: 14,
  totalMembers: 14,
  checkedOutCount: 26,
  nextCheckinOrder: 15,
};
