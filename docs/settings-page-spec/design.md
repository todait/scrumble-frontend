각 메뉴 피그마 링크, 스샷을 참고해서 메뉴 UI를 구현해라. playwright mcp 를 활용해서 이미지와 맞는지 비교하고, 일치하지 않으면 일치할떄까지 반복해서 구현해라. UltraThink! 빈 메뉴는 빈 page.tsx 를 만들어놔라.
개발 서버는 3000 포트에 이미 열려 있다. (npm run dev 실행 중)

playwright mcp 실행시 먼저 로그인을 해야하니, 먼저 로그인을 하기 위해 playwright 를 실행해라.
http://localhost:3000/testspace123/settings/space 로 접속해서 스크린샷을 테스트해보고 그리고 나서 구현을 시작해라.

아래 총 4가지 메뉴 화면을 완성할때까지 절대 종료하지마라. (스타일도 중요하지만, 기본적인 기능 구현도 다 해야한다.)

- 스페이스 정보 메뉴
  @https://www.figma.com/design/3aWPQs3E15z05h8zcng2ol/Scrumble?node-id=2015-70658&t=iwSBrfxiOnnbrQ5q-1
  @docs/settings-page-spec/images/SettingsSpace.png

- 내 정보 메뉴
  @https://www.figma.com/design/3aWPQs3E15z05h8zcng2ol/Scrumble?node-id=2015-63835&t=iwSBrfxiOnnbrQ5q-1
  @docs/settings-page-spec/images/내 정보 메뉴 화면 - 전체 레이아웃.png
  @docs/settings-page-spec/images/내 정보 메뉴 화면.png

- 알림 메뉴
  @https://www.figma.com/design/3aWPQs3E15z05h8zcng2ol/Scrumble?node-id=2165-70795&t=iwSBrfxiOnnbrQ5q-1
  @docs/settings-page-spec/images/멤버리스트 - 전체 레이아웃.png
  @docs/settings-page-spec/images/멤버리스트.png

- 멤버 리스트
  @https://www.figma.com/design/3aWPQs3E15z05h8zcng2ol/Scrumble?node-id=1812-110867&t=iwSBrfxiOnnbrQ5q-1
  @docs/settings-page-spec/images/알림 메뉴 - 전체 레이아웃.png
  @docs/settings-page-spec/images/알림 메뉴 화면.png
