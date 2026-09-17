/*
  침대 30 x 12. 캐노피 침대가 이 그림 위에 기둥 · 지붕 · 커튼을 올려 쓰므로 따로 뺐다.
  프레임도 베개도 흰색이라 붙어 보인다. 베개 둘레를 테두리로 끊어 떼어놨다.
  22폭이던 걸 30폭으로 늘렸다 — 판다(16) 옆에 두면 아기 침대처럼 짧다는 말을 들었다.
  베개는 그대로 두고 이불만 길어졌다
*/
export const BED = [
  "hhh...........................",
  "hHh...........................",
  "hHhhhhhhhhhhhhhhhhhhhhhhhhhhhh",
  "hHhWWWWWWWQQQQQQQQQQQQQQQQQQQh",
  "hHhWWWWWWWQQQQQQQQQQQQQQQQQQQh",
  "hHhWWWWWWWQqqqqqqqqqqqqqqqqqQh",
  "hHhWWWWWWWQQQQQQQQQQQQQQQQQQQh",
  "hHhhhhhhhhQQQQQQQQQQQQQQQQQQQh",
  "hHhQQQQQQQQQQQQQQQQQQQQQQQQQQh",
  "hhhhhhhhhhhhhhhhhhhhhhhhhhhhhh",
  "hHh........................hHh",
  "hhh........................hhh",
];

/*
  방향 돌리기 (9/17). 위 BED 는 긴 쪽이 보이는 **오른쪽** 모습이다 — 머리판이 왼쪽, 발이 오른쪽.
  앞 = 머리판을 뒷벽에 붙이고 발이 보는 사람 쪽. 뒤 = 머리판 뒷면이 앞을 막는다. 둘 다 20 x 21
*/
/* 앞 — 위에 머리판, 베개, 앞으로 길게 이불, 맨 아래 이불 앞자락 · 다리 */
export const BED_FRONT = [
  "..hhhhhhhhhhhhhhhh..",
  ".hHHHHHHHHHHHHHHHHh.",
  "hHHHHHHHHHHHHHHHHHHh",
  "hHHHHHHHHHHHHHHHHHHh",
  "hHhhhhhhhhhhhhhhhhHh",
  "hHhQhhhhhhhhhhhhQhHh",
  "hHhQhWWWWWWWWWWhQhHh",
  "hHhQhWWWWWWWWWWhQhHh",
  "hHhQhhhhhhhhhhhhQhHh",
  "hHhqqqqqqqqqqqqqqhHh",
  "hHhQQQQQQQQQQQQQQhHh",
  "hHhQQQQQQQQQQQQQQhHh",
  "hHhQQQQQQQQQQQQQQhHh",
  "hHhQQQQQQQQQQQQQQhHh",
  "hHhQQQQQQQQQQQQQQhHh",
  "hHhQQQQQQQQQQQQQQhHh",
  "hHhqqqqqqqqqqqqqqhHh",
  "hHhhhhhhhhhhhhhhhhHh",
  "hhhhhhhhhhhhhhhhhhhh",
  "hHh..............hHh",
  "hhh..............hhh",
];

/* 뒤 — 위에 낮은 발판, 이불, 베개 윗부분만, 앞을 막는 머리판 뒷면 */
export const BED_BACK = [
  "hhhhhhhhhhhhhhhhhhhh",
  "hHHHHHHHHHHHHHHHHHHh",
  "hHhhhhhhhhhhhhhhhhHh",
  "hHhqqqqqqqqqqqqqqhHh",
  "hHhQQQQQQQQQQQQQQhHh",
  "hHhQQQQQQQQQQQQQQhHh",
  "hHhQQQQQQQQQQQQQQhHh",
  "hHhQQQQQQQQQQQQQQhHh",
  "hHhqqqqqqqqqqqqqqhHh",
  "hHhQhhhhhhhhhhhhQhHh",
  "hHhQhWWWWWWWWWWhQhHh",
  "..hhhhhhhhhhhhhhhh..",
  ".hHHHHHHHHHHHHHHHHh.",
  "hHHHHHHHHHHHHHHHHHHh",
  "hHHhhhhhhhhhhhhhhHHh",
  "hHHhHHHHHHHHHHHHhHHh",
  "hHHhHHHHHHHHHHHHhHHh",
  "hHHhhhhhhhhhhhhhhHHh",
  "hhhhhhhhhhhhhhhhhhhh",
  "hHh..............hHh",
  "hhh..............hhh",
];
