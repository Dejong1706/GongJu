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
