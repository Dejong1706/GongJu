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
    date: "2026-09-21",
    items: [
      { kind: "fix", text: "가구를 뒷벽까지 밀어붙일 수 있어요 — 키 큰 가구가 벽에서 떨어져 서던 문제" },
      { kind: "fix", text: "화분 · 책 · 꽃병을 키 큰 장 위에도 얹을 수 있어요" },
      { kind: "fix", text: "창문 · 액자 · 청사초롱이 바닥까지 내려와요" },
    ],
  },
  {
    date: "2026-09-17",
    items: [
      { kind: "new", text: "가구 · 인형 돌리기 — 옮기기를 누르고 ↺ ↻ 를 눌러요" },
      { kind: "new", text: "신규 아이템 30종 추가" },
      { kind: "new", text: "움직이는 아이템이 생겼어요" },
      { kind: "new", text: "가이드 — 왼쪽 위 버튼에서 포인트 얻는 법을 볼 수 있어요" },
      { kind: "change", text: "받는 포인트가 늘었어요" },
      { kind: "change", text: "스티커 한 장에 100점, 한 달에 10장 모으면 500점 더" },
      { kind: "change", text: "토익 퀴즈는 한 문제 맞힐 때마다 10점 — 하루 첫 판만 받아요" },
      { kind: "change", text: "상점 등급이 생겼어요 — 골드 · 프리미엄" },
      { kind: "change", text: "상점 칸이 7개로 나뉘고, 비싼 것부터 보여요" },
      { kind: "change", text: "강의·과제 체크 포인트는 하루 5번까지 받아요" },
      { kind: "change", text: "일부 아이템의 가격 · 모양이 바뀌었어요" },
      { kind: "change", text: "아이템 2종 삭제" },
      { kind: "fix", text: "체크를 빠르게 두 번 누르면 포인트가 두 번 들어오던 문제" },
      { kind: "fix", text: "옮겨둔 가구가 원래 자리로 돌아가던 문제" },
    ],
  },
  {
    date: "2026-09-16",
    items: [
      { kind: "new", text: "공부 타이머 — 시간표 탭 안에 있어요" },
      { kind: "new", text: "판다가 방 안을 돌아다녀요" },
      { kind: "new", text: "가구를 끌어서 옮길 수 있어요" },
      { kind: "new", text: "신규 아이템 18종 추가" },
      { kind: "new", text: "포인트 얻는 방법이 늘었어요" },
      { kind: "change", text: "물건을 살 때 한 번 더 물어봐요" },
      { kind: "new", text: "🎁 500포인트 선물" },
    ],
  },
  {
    date: "2026-09-15",
    items: [
      { kind: "new", text: "판다 키우기 — 포인트로 아이템을 사서 방을 꾸며요" },
      { kind: "new", text: "신규 아이템 9종 추가" },
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
