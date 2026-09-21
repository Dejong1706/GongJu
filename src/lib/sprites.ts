/**
 * 도트 스프라이트. 문자 한 글자가 픽셀 하나.
 * palette 에 없는 문자(".")는 투명하게 건너뛴다.
 */
export type Sprite = { rows: string[]; palette: Record<string, string> };

const INK = "#3A2230";

export const BUNNY: Sprite = {
  rows: [
    ".....KKKKK....KKKKK.....",
    ".....KWPWK....KWPWK.....",
    ".....KWPWK....KWPWK.....",
    ".....KWPWK....KWPWK.....",
    ".....KWPWK....KWPWK.....",
    ".....KWPWK....KWPWK.....",
    ".....KWPWK....KWPWK.....",
    ".....KWPWK....KWPWK.....",
    ".....KWPWK....KWPWK.....",
    ".....KWWWK....KWWWK.....",
    "...KKKWWWKKKKKKWWWKKK...",
    "...KWWWWWWWWWWWWWWWWK...",
    "...KWWWWWWWWWWWWWWWWK...",
    "...KWWWWWWWWWWWWWWWWK...",
    "...KWWWEEWWWWWWEEWWWK...",
    "...KWWWEEWWWWWWEEWWWK...",
    "...KWBBWWWWKKWWWWBBWK...",
    "...KWBBWWWWWWWWWWBBWK...",
    "...KWWWWWWWWWWWWWWWWK...",
    "...KWWWWWWWWWWWWWWWWK...",
    "...KWWWWWWWWWWWWWWWWK...",
    "....KWWWWWWWWWWWWWWK....",
    "....KKKKKKKKKKKKKKKK....",
    ".....KWWWWWWWWWWWWK.....",
    ".....KWWWWWPPWWWWWK.....",
    ".....KWWWWWWWWWWWWK.....",
    ".....KWWWWWWWWWWWWK.....",
    ".....KKKKKKKKKKKKKK.....",
  ],
  palette: { K: INK, W: "#FFFFFF", P: "#FFB7D0", E: INK, B: "#FFA5C3" },
};

/**
 * 눈을 한 칸 올려 자리를 만들고, 코 아래에 넓게 웃는 입을 넣었다.
 * 예전에는 입이 ∧ (가운데가 위, 양끝이 아래) 라 울상으로 보였다.
 */
export const PANDA: Sprite = {
  rows: [
    "..KK......KK..",
    ".KKKK....KKKK.",
    ".KKKK....KKKK.",
    ".KKKKKKKKKKKK.",
    "KWWWWWWWWWWWWK",
    "KWKKKWWWWKKKWK",
    "KWKWKWWWWKWKWK",
    "KWKKKWWWWKKKWK",
    "KWWWWWKKWWWWWK",
    "KPPWKWWWWKWPPK",
    "KPPWWKKKKWWPPK",
    "KWWWWWWWWWWWWK",
    ".KWWWWWWWWWWK.",
    "..KKKKKKKKKK..",
  ],
  palette: { K: INK, W: "#FFFFFF", P: "#FFA5C3" },
};

/* ── 판다 키우기 ─────────────────────────────
   방은 48 x 57 칸. 판다를 (10,28) 에 세우면
   귀 28~29 · 머리위선 30 · 눈 33~34 · 코 36 · 발끝 44(걸레받이) 가 된다.
   소품 좌표는 전부 이 기준에 맞춰져 있다.
   ───────────────────────────────────────── */

/** 아기 판다 16 x 16. 머리 12폭 12줄, 몸통 8폭 4줄. */
export const BABY: Sprite = {
  rows: [
    "....KK....KK....",
    "...KKKK..KKKK...",
    "...KKKKKKKKKK...",
    "..KWWWWWWWWWWK..",
    "..KWWWWWWWWWWK..",
    "..KWWKKWWKKWWK..",
    "..KWWKKWWKKWWK..",
    "..KWWWWWWWWWWK..",
    "..KPPWWKKWWPPK..",
    "..KPPWWWWWWPPK..",
    "..KWWWWWWWWWWK..",
    "...KKKKKKKKKK...",
    ".....KKWWKK.....",
    "....KKWWWWKK....",
    "....KKWWWWKK....",
    "....KKKKKKKK....",
  ],
  palette: { K: INK, W: "#FFFFFF", P: "#FFA5C3" },
};

/** 판다를 누르면 머리 위로 뜬다. 아래 꼬리가 판다를 가리킨다. */
export const HEART: Sprite = {
  rows: [
    ".KKKKKKK.",
    "KWWWWWWWK",
    "KW.R.R.WK",
    "KWRRRRRWK",
    "KWRRRRRWK",
    "KW.RRR.WK",
    "KWW.R.WWK",
    "KWWWWWWWK",
    ".KKWKKKK.",
    "..KWK....",
    "...K.....",
  ],
  palette: { K: INK, W: "#FFFFFF", R: "#E2648F" },
};

/** 포인트 옆에 붙는 동전 */
export const COIN: Sprite = {
  rows: [
    "..KKKK..",
    ".KNNNNK.",
    "KNWNNNNK",
    "KNNNNNNK",
    "KNNNNNNK",
    "KNNNNNNK",
    ".KNNNNK.",
    "..KKKK..",
  ],
  palette: { K: INK, N: "#FFD34D", W: "#FFFFFF" },
};

/**
 * 로딩 화면 당근 게이지. 누워 있고 왼쪽(꼭지 쪽)부터 찬다.
 *
 * 한 장을 두 벌로 나눠 쓴다 — 바탕(`CARROT_EMPTY`) 은 먹 테두리 · 초록 꼭지 · 빈 속이고,
 * 그 위에 속만 그린 `CARROT_FILL` 을 덮은 뒤 왼쪽부터 잘라서 보여준다 (`Splash`).
 * 두 벌의 `rows` 가 같아야 겹쳐지므로 아래 한 벌만 고친다.
 *
 * 몸통은 32칸이다. 잘리는 폭을 6 → 38 으로 32번 나눠 옮기므로(globals.css `carrot-fill`)
 * **폭을 바꾸면 그 키프레임의 칸 수도 같이 고쳐야** 한 칸씩 또렷하게 찬다.
 */
const CARROT_ROWS = [
  "..G..G..K.............................",
  ".GLLLLKKHKKKKKKKKKK...................",
  "..GLLLKHODHHHHDHHHHKKKKKKKK...........",
  "...GLLKOODOOOODOOOODHHHHDHHKKKKKK.....",
  "....GGKOODOOOODOOOODOOOODOOHHDHHHKKKK.",
  ".....GKOODOOOODOOOODOOOODOOOODOOOHDKKK",
  "......KOODOOOODOOOODOOOODOOOODKKKKK...",
  "......KOODOOOODOOOODOOOKKKKKKK........",
  "......KOODOOOOKKKKKKKKK...............",
  ".......KKKKKKK........................",
];

/** 빈 당근. 속은 연분홍이라 크림색 바탕 위에서 "아직 안 찬 칸" 으로 보인다 */
export const CARROT_EMPTY: Sprite = {
  rows: CARROT_ROWS,
  palette: { K: INK, G: "#4E9E5C", L: "#8FD08F", O: "#F6E4EC", H: "#F6E4EC", D: "#F6E4EC" },
};

/** 찬 속만. 테두리 · 꼭지가 없어서 바탕 위에 덮어도 윤곽을 가리지 않는다 */
export const CARROT_FILL: Sprite = {
  rows: CARROT_ROWS,
  palette: { O: "#FF9A3C", H: "#FFC073", D: "#E8761C" },
};
