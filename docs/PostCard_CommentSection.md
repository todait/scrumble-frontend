## 1. CommentPreview 교체

- 기존 CommentPreview 는 삭제한다.

원래 CommentPreview 가 있었던 위치에 다음 구성으로 교체한다.

### 구성 (이하 남겨보세요)

(현재 접속 멤버 프로필 아바타) {현재 Post author name}님의 체크인에 가볍게 코멘트를 남겨보세요

### 세부 스타일

현재 접속 멤버 프로필 아바타
{
border-radius full
20x20
}

그 옆에 gap-8px

{현재 Post author name}님의 체크인에 가볍게 코멘트를 남겨보세요
{
color: #1D1D1F; opacity: 0.4;
font-size: 14px;
font-weight: 400;
line-height: 150%; /_ 21px _/
}

---

## 2. 최신 댓글 미리보기

- 제일 최신 댓글 2개를 항상 보여준다. 맨 밑 댓글이 제일 최신 댓글이다. (PostDetail 댓글 순서랑 똑같음)
- 댓글에 들어가있는 이미지는 생략하고, 텍스트만 한줄로 보여주고, Card 의 Width 가 넘어가면 ... 생략 처리한다.
- 남겨보세요는 항상 제일 아래에 붙는다.

최신 댓글이 있다면 다음과 같이 컴포넌트가 구성된다.

### 구성

최신 댓글 -----
(댓글 Author 프로필 아바타) {댓글 Author name} {댓글 내용}
(댓글 Author 프로필 아바타) {댓글 Author name} {댓글 내용}
(현재 접속 멤버 프로필 아바타) {현재 Post author name}님의 체크인에 가볍게 코멘트를 남겨보세요 // 남겨보세요 컴포넌트

### 세부 스타일

1. 최신 댓글 -----

최신 댓글
{
color: #6E6E73;
text-align: right;
font-size: 13px;
font-weight: 400;
line-height: 140%; /_ 18.2px _/
}

오른쪽에 10px gap 을 두고
dot 이 들어간 불연속 line 을 그어준다. (#1D1D1F14)

2. (댓글 Author 프로필 아바타) {댓글 Author name} {댓글 내용}
   댓글 Author 프로필 아바타
   {
   border-radius full
   20x20
   }

댓글 Author name
#1D1D1FCC
font-size-14px
font-weight: 700;
line-height: 150%; /_ 21px _/

padding 좌우 로 8px 씩

각 요소 위아래 사이에는 10px 씩 간격을 두고 이 전체 컴포넌트 위아래는 20px 씩 두면 된다.
위에 배치된 다른 컴포넌트와 마찬가지로 왼쪽 정렬이고
최신 댓글과 남겨보세요 컴포넌트는 프로필 아바타 기준으로 같이 정렬되어있어야한다.
