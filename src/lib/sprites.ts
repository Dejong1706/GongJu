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

export const PANDA: Sprite = {
  rows: [
    "..KK......KK..",
    ".KKKK....KKKK.",
    ".KKKK....KKKK.",
    ".KKKKKKKKKKKK.",
    "KWWWWWWWWWWWWK",
    "KWWWWWWWWWWWWK",
    "KWKKKWWWWKKKWK",
    "KWKWKWWWWKWKWK",
    "KWKKKWWWWKKKWK",
    "KPPWWWKKWWWPPK",
    "KPPWWKWWKWWPPK",
    "KWWWWWWWWWWWWK",
    ".KWWWWWWWWWWK.",
    "..KKKKKKKKKK..",
  ],
  palette: { K: INK, W: "#FFFFFF", P: "#FFA5C3" },
};
