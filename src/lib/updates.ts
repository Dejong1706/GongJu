/**
 * 가이드 → 업데이트 내역에 보이는 목록. **위가 최신.**
 *
 * 앱을 쓰는 사람이 읽는 글이라 개발 말(트랜잭션·Firestore·컴포넌트…) 은 쓰지 않는다.
 * 같은 날 고친 것은 하루 한 칸에 몰아 넣는다. 적는 규칙은 history.md "업데이트 내역 적기" 참고.
 */

export type UpdateKind = "new" | "change" | "fix";

export type Update = {
  date: string; // YYYY-MM-DD
  items: { kind: UpdateKind; text: string }[];
};

export const UPDATE_LABEL: Record<UpdateKind, string> = {
  new: "새로 생겼어요",
  change: "바뀌었어요",
  fix: "고쳤어요",
};

export const UPDATES: Update[] = [
  {
    date: "2026-09-17",
    items: [
      { kind: "new", text: "왼쪽 위 가이드 버튼 — 포인트 얻는 법과 업데이트 내역을 볼 수 있어요" },
      { kind: "change", text: "강의·과제 체크 포인트는 하루 5번까지 받아요" },
      { kind: "fix", text: "체크를 빠르게 두 번 누르면 포인트가 두 번 들어오던 문제" },
      { kind: "change", text: "산 뒤에 스티커를 떼거나 체크를 풀면 포인트가 마이너스로 보여요" },
      { kind: "change", text: "침대와 책상이 더 길어졌어요" },
      { kind: "change", text: "상점 칸이 7개로 늘었어요 — 옷 · 가구 · 인형 · 소품 · 벽 장식 · 벽지 · 바닥" },
      { kind: "change", text: "상점에서 공을 뺐어요" },
      { kind: "new", text: "👑 프리미엄 아이템 8개 — 왕관 · 요정 날개 · 캐노피 침대 · 공주 화장대 · 어항 · 밤하늘 창문 · 궁전 벽지 · 왕실 카펫" },
      { kind: "new", text: "어항 물고기가 헤엄치고, 밤하늘 창문 별이 반짝이고, 요정 날개가 팔랑여요" },
      { kind: "new", text: "프리미엄은 상점에서 금테 칸으로 따로 보여요" },
      { kind: "new", text: "🏰 왕궁 세트 — 왕실 깃발 · 왕좌 · 유니콘 인형 · 장미 꽃병" },
      { kind: "new", text: "💜 전설 등급 창문 2개(1,000포인트) — 궁전 창문 · 발코니 창문. 상점에서 보라색 칸으로 보여요" },
      { kind: "change", text: "포인트를 더 줘요 — 스티커 25 · 토익 만점 50 · 타이머 25분 15. 부지런한 날이면 하루 180점쯤 모여요" },
      { kind: "change", text: "상점에서 비싼 것부터 보여요" },
      { kind: "fix", text: "옮겨둔 가구가 다른 가구를 옮길 때 원래 자리로 돌아가던 문제" },
    ],
  },
  {
    date: "2026-09-16",
    items: [
      { kind: "new", text: "공부 타이머 — 시간표 탭 안에 있어요. 폰을 눕히면 큰 시계가 돼요" },
      { kind: "new", text: "판다 방이 넓어지고, 판다가 방 안을 돌아다녀요" },
      { kind: "new", text: "가구를 손가락으로 끌어서 옮길 수 있어요" },
      { kind: "new", text: "가구 11개 · 벽지와 바닥 4개 · 러그 · 공 · 액자" },
      { kind: "new", text: "포인트 얻는 방법이 늘었어요 — 강의·과제 체크, 토익 만점, 타이머, 스티커 연속" },
      { kind: "change", text: "물건을 살 때 한 번 더 물어봐요" },
      { kind: "new", text: "🎁 500포인트 선물" },
    ],
  },
  {
    date: "2026-09-15",
    items: [
      { kind: "new", text: "판다 키우기 — 포인트로 옷과 소품을 사서 방을 꾸며요" },
      { kind: "new", text: "창문 7종 · 왕리본" },
      { kind: "change", text: "상점에서 산 것 · 입은 것이 한눈에 보여요" },
      { kind: "fix", text: "판다 방이 한 화면에 다 안 들어가던 문제" },
    ],
  },
  {
    date: "2026-09-14",
    items: [
      { kind: "new", text: "시간표 탭과 캠퍼스 지도" },
      { kind: "change", text: "캘린더에 일정이 많으면 +N 으로 접어요" },
      { kind: "fix", text: "시간표 수업 시각 · 주차 숫자 · 지도가 늦게 뜨던 문제" },
      { kind: "fix", text: "판다 도장이 웃는 얼굴이 됐어요" },
    ],
  },
  {
    date: "2026-09-13",
    items: [
      { kind: "change", text: "강의·과제를 주차별로 모아 보여줘요" },
      { kind: "change", text: "스티커 오늘 칸에 '붙이기' 안내" },
      { kind: "new", text: "불러오는 동안 '잠깐만' 이 통통 튀어요" },
    ],
  },
  {
    date: "2026-09-11",
    items: [{ kind: "new", text: "정연공듀가 태어났어요 🎉" }],
  },
];
