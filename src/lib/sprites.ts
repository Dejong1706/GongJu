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
