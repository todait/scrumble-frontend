# @PostContent 의 CollpaseSection 디자인 개선 변경

## 요구사항

- CollapseSection 은 여러곳에서 쓰인다. 기존 디자인 및 기능은 유지되어야한다.
- PostContent 에서만 별개의 디자인으로 렌더링 된다.
- 변경되는 디자인은 아래 명세되어있다.

## 디자인 명세

- Header 영역이 개선된다.
- Header > Container 이렇게 구성되고
- Header padding 10px
- Container padding 10px

## Container 안 디자인 요소

### 기본 상태

- Horizontal 배치
  - (ri:check-line) 00% 달성 (n/m) (bar graph)

(ri:check-line)
16x16
#9747FF
우측 8px gap

00% 달성
color: #1D1D1F;
font-size: 13px;
font-weight: 700;
line-height: 120%; /_ 15.6px _/
우측 2px gap

(n/m)
color: #9999A2;
font-size: 13px;
font-weight: 400;
line-height: 120%; /_ 15.6px _/
우측 10px gap

(Bar graph)

w-full
border-radius-full
background: rgba(153, 153, 162, 0.20); // (Bar graph 기본 배경색)

// 00% 만큼 바 색칠
border-radius-full
background: linear-gradient(270deg, rgba(140, 75, 249, 0.90) 0%, rgba(180, 120, 247, 0.90) 100%);

### 100% 달성시

- (ri:sparkling-2-fill) 100% 달성 (n/m) (bar graph)
  아이콘 및 텍스트, 바 모두 color: #FFFFFF
  대신, Header
  {
  border-radius: 12px;
  border: 4px solid rgba(255, 255, 255, 0.20);
  background: linear-gradient(90deg, rgba(140, 75, 249, 0.80) 0%, rgba(180, 120, 247, 0.80) 100%);
  }

- Header 뿐만 아니라 TodoContainer 확장했을때도 안에 모든 컬러 변경
  {
  투두리스트 모든 Icon, 텍스트, strike(포함) color: #FFFFFF
  투두 수정 color: #FFFFFF
  border-radius: 12px;
  border: 4px solid rgba(255, 255, 255, 0.20);
  background: linear-gradient(90deg, rgba(140, 75, 249, 0.80) 0%, rgba(180, 120, 247, 0.80) 100%);
  }
