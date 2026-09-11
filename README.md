# Study Diary

직장과 대학생활을 병행하는 한 사람이 매일 쓰는 개인 학업 관리 앱.
도트 픽셀 + 핑크 파스텔 테마, 모바일(iPhone) 우선.

## 실행

```bash
npm install
npm run dev
```

http://localhost:3000 에서 확인. PC 브라우저에서는 아이폰 프레임 안에 들어가서 보이고,
폰에서 열면 화면을 꽉 채운다.

## 지금 단계

**UI만 완성된 상태다.** 데이터는 `src/lib/mock.ts` 의 샘플을 `useState` 로 들고 있어서
새로고침하면 초기화된다. Firebase 는 아직 연결하지 않았다.

다음 단계에서 `src/app/page.tsx` 의 `useState` 네 줄을 Firestore 구독으로 바꾸면 된다.
그 자리에 `// TODO` 를 달아뒀다.

## 구조

```
src/
  app/
    layout.tsx      폰트, viewport, safe-area 설정
    page.tsx        앱 껍데기 + 탭 전환 + 전역 상태  ← Firestore 연결 지점
    globals.css     픽셀 테마 전체 (색, 뜯긴 종이, 팝업, 버튼)
  components/
    TabBar.tsx      하단 탭 4개
    Popup.tsx       가운데 뜨는 픽셀 팝업 (공통)
    PixelSprite.tsx 도트 배열 -> SVG 렌더러
    CalendarView.tsx
    LectureView.tsx
    ToeicView.tsx
    StickerView.tsx
  lib/
    types.ts        데이터 타입
    date.ts         날짜 / 주차 계산
    sprites.ts      토끼 · 판다 도트 데이터
    mock.ts         샘플 데이터 + 과목 + 파스텔 6색
```

## 화면

- **캘린더** — 과목 요일에 따라 색 점이 자동으로 찍힌다. 날짜를 누르면 그 날 팝업,
  아래 버튼으로 일정 추가. 일정은 파스텔 6색 중 골라 지정.
- **강의** — 월~일 기준으로 주 묶음. 이번 주가 맨 위, 아래로 갈수록 과거.
  날짜만 넣으면 학기 시작일 기준으로 몇 주차인지 자동 계산된다.
- **토익** — 단어 등록 / 랜덤 테스트 두 입구. 오답 보기는 본인 단어장의 다른 뜻에서 뽑는다.
- **스티커** — 그 달 일수만큼 칸이 생기고, 10개째마다 반짝인다.

## 손보고 싶을 때

- 색 바꾸기: `src/app/globals.css` 의 `:root` 변수 + `tailwind.config.ts`
- 토끼 · 판다 모양: `src/lib/sprites.ts` 의 문자 배열. 한 글자가 픽셀 하나다.
- 과목 / 학기: `src/lib/mock.ts` 의 `COURSES`, `SEM_START`

## 나중에

`firestore.rules` 와 `.env.local.example` 은 Firebase 연결 단계를 위해 미리 넣어뒀다.
보안 규칙은 본인 uid 하위 문서만 읽고 쓸 수 있게 잠겨 있다.
