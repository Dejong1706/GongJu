/**
 * 7세그먼트 시계 숫자.
 *
 * `sprites.ts` 의 그림들과 달리 **도트가 아니다.** 획 하나를 육각형 하나로 그린다.
 * 도트로 찍어봤더니 획 끝 계단이 커서 화면이 정신없었다. 여기선 45도로 매끈하게 깎인다.
 *
 * 한 글자 12 x 22, 획 두께 3, 획 사이 0.9칸. 꺼진 획은 안 그린다 —
 * 진짜 LCD 처럼 뒤에 8 을 깔아봤지만 그것도 정신없어서 뺐다.
 */
const DW = 12;
const DH = 22;
const T = 3; // 획 두께
const GAP = 0.9; // 획과 획 사이
const SPACE = 3; // 글자 사이
const COLON_W = 3;

const h = T / 2;
const CX = [h, DW - h]; // 세로획 중심선 — 1.5, 10.5
const CY = [h, DH / 2, DH - h]; // 가로획 중심선 — 1.5, 11, 20.5

type Pt = [number, number];

/** 양 끝이 45도로 뾰족한 가로획 */
const across = (y: number, x1: number, x2: number): Pt[] => [
  [x1, y],
  [x1 + h, y - h],
  [x2 - h, y - h],
  [x2, y],
  [x2 - h, y + h],
  [x1 + h, y + h],
];

/** 위아래가 45도로 뾰족한 세로획 */
const down = (x: number, y1: number, y2: number): Pt[] => [
  [x, y1],
  [x + h, y1 + h],
  [x + h, y2 - h],
  [x, y2],
  [x - h, y2 - h],
  [x - h, y1 + h],
];

const X1 = CX[0] + GAP;
const X2 = CX[1] - GAP;

const SEG: Record<string, Pt[]> = {
  a: across(CY[0], X1, X2),
  g: across(CY[1], X1, X2),
  d: across(CY[2], X1, X2),
  f: down(CX[0], CY[0] + GAP, CY[1] - GAP),
  b: down(CX[1], CY[0] + GAP, CY[1] - GAP),
  e: down(CX[0], CY[1] + GAP, CY[2] - GAP),
  c: down(CX[1], CY[1] + GAP, CY[2] - GAP),
};

/** 숫자마다 켜지는 획 */
const LIT: Record<string, string> = {
  "0": "abcdef",
  "1": "bc",
  "2": "abdeg",
  "3": "abcdg",
  "4": "bcfg",
  "5": "acdfg",
  "6": "acdefg",
  "7": "abc",
  "8": "abcdefg",
  "9": "abcdfg",
};

const glyphW = (ch: string) => (ch === ":" ? COLON_W : DW);

/** 글자열을 그렸을 때 몇 칸이 되는지. 시계 크기를 잡을 때 쓴다 */
export function faceWidth(text: string) {
  return [...text].reduce((w, ch) => w + glyphW(ch) + SPACE, 0) - SPACE;
}

export const FACE_H = DH;

export default function ClockFace({ text, fill }: { text: string; fill: string }) {
  const parts: React.ReactNode[] = [];
  let dx = 0;

  [...text].forEach((ch, i) => {
    if (ch === ":") {
      // 가운뎃줄(11) 위아래로 4씩. 각져야 획이랑 결이 맞는다
      for (const y of [5.5, 13.5]) {
        parts.push(
          <rect key={`${i}-${y}`} x={dx} y={y} width={3} height={3} fill={fill} />
        );
      }
    } else {
      for (const k of LIT[ch] ?? "") {
        parts.push(
          <polygon
            key={`${i}-${k}`}
            points={SEG[k].map(([x, y]) => `${x + dx},${y}`).join(" ")}
            fill={fill}
          />
        );
      }
    }
    dx += glyphW(ch) + SPACE;
  });

  return (
    <svg
      viewBox={`0 0 ${faceWidth(text)} ${DH}`}
      width="100%"
      role="img"
      aria-label={text}
    >
      {parts}
    </svg>
  );
}
