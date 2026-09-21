/*
 * 윷 규칙 검사. `node --experimental-strip-types tools/yut-check.mts`
 * 화면 없이 길 · 잡기 · 업기 · 윷가락 판정만 확인한다.
 * 이벤트가 끝나면 이 파일도 같이 지운다.
 */
import { advance, applyMove, field, judge, movesFor, realThrow, CHAM, GOAL, WAIT } from "../src/lib/yut.ts";

let bad = 0;
const eq = (got: unknown, want: unknown, what: string) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) { bad++; console.log("✗", what, "→", got, "(바란 값", want + ")"); }
  else console.log("✓", what);
};

// 길
eq(advance(WAIT, 1), 1, "대기에서 도 → 1번 밭");
eq(advance(WAIT, 5), 5, "대기에서 모 → 5번(우상 모서리)");
eq(advance(4, 2), 6, "4에서 개 → 6 (모서리를 지나가면 바깥길)");
eq(advance(5, 1), 21, "우상 모서리에서 도 → 지름길");
eq(advance(5, 3), 34, "우상에서 걸 → 가운데 방 (첫 지름길로 멈췄으니 34)");
eq(advance(5, 4), 24, "우상에서 윷 → 방을 지나 좌하 쪽");
eq(advance(5, 5), 25, "우상에서 모 → 방 지나 두 칸");
eq(advance(25, 1), 35, "지름길 끝 → 좌하 모서리(찌모)로 합류");
eq(field(advance(25, 1)!), 15, "그 자리는 좌하 모서리");
eq(advance(35, 1), 16, "찌모에서는 바깥길로 이어간다");
eq(advance(10, 1), 26, "좌상 모서리에서 도 → 두 번째 지름길");
eq(advance(27, 1), 33, "두 번째 지름길로 방에 멈춤");
eq(advance(33, 2), 29, "방에서 개");

// 나기 — **참먹이를 지나야** 난다. 참먹이에 서기만 하면 아직 안 난 것이고 잡히기도 한다
eq(advance(19, 1), CHAM, "마지막 밭에서 도 → 참먹이에 선다 (아직 안 났다)");
eq(field(advance(19, 1)!), CHAM, "참먹이는 출발점과 같은 자리");
eq(advance(19, 2), GOAL, "참먹이를 지나치면 난다");
eq(advance(CHAM, 1), GOAL, "참먹이에 선 말은 한 칸만 더 가면 난다");
eq(advance(33, 3), 31, "방에서 걸 → 28 · 29 지나 참먹이 (바로 골인이 아니다)");
eq(field(advance(33, 3)!), CHAM, "그 자리도 참먹이");
eq(advance(31, 1), GOAL, "거기서 한 칸 더 가면 난다");
eq(advance(33, 4), GOAL, "방에서 윷이면 참먹이를 지나 난다");
eq(advance(18, 5), GOAL, "지나쳐도 난다");
eq(advance(GOAL, 1), null, "난 말은 못 움직인다");

// 백도
eq(advance(21, -1), 5, "지름길 첫 칸에서 백도 → 모서리");
eq(advance(24, -1), 34, "방으로 물러서면 골 쪽 길로 바뀐다");
eq(advance(3, -1), 2, "바깥길 백도");
eq(advance(WAIT, -1), null, "대기 말은 백도를 못 쓴다");

// 도 자리에서의 백도 — 참먹이에 도달한 것으로 친다 (대회규정)
eq(advance(1, -1), 32, "도에서 백도 → 참먹이");
eq(field(advance(1, -1)!), CHAM, "그 자리는 참먹이");
eq(advance(32, 1), GOAL, "거기서는 도만 나와도 난다");
eq(advance(32, 5), GOAL, "모가 나와도 그냥 난다");
eq(advance(32, -1), 1, "백도가 연달아 나오면 도로 '도' 자리 (못 난다)");

// 되물리는 방향은 **온 길의 반대** (대회규정)
eq(advance(34, -1), 22, "첫 지름길로 방에 섰으면 그 길로 물러난다");
eq(advance(33, -1), 27, "둘째 지름길로 왔으면 그쪽으로");
eq(advance(35, -1), 25, "지름길로 온 찌모는 지름길로 물러난다");
eq(advance(15, -1), 14, "바깥길로 온 찌모는 바깥길로");
eq(advance(CHAM, -1), 19, "바깥길로 온 참먹이도 마찬가지");
eq(advance(31, -1), 29, "지름길로 온 참먹이는 지름길로");
eq(realThrow([WAIT, WAIT, WAIT], -1), 1, "판에 말이 없으면 백도는 도로 친다");
eq(realThrow([3, WAIT, WAIT], -1), -1, "판에 말이 있으면 백도 그대로");

// 도만 던지면? 우상 모서리에 멈추므로 지름길을 탄다 — 열한 번에 난다
let pos = WAIT, n = 0;
while (pos !== GOAL && n < 50) { pos = advance(pos, 1)!; n++; }
eq(n, 12, "도만 던지면 지름길을 타고 열두 번에 난다 (참먹이를 한 번 밟는다)");

// 모서리마다 걸(3)로 지나쳐 바깥길만 타면 스무 칸
pos = WAIT; n = 0;
const outer: number[] = [];
while (pos !== GOAL && n < 40) { outer.push(pos); pos = advance(pos, 2)!; n++; }
eq(outer.includes(5), false, "개로만 가면 우상 모서리는 지나친다");
eq(outer.includes(10), true, "대신 좌상 모서리에는 선다");
eq(n, 9, "거기서 두 번째 지름길을 타고 아홉 번에 난다");

// 업기 · 잡기
const moves = movesFor([7, 7, WAIT], 2);
eq(moves.length, 2, "같은 밭의 두 말은 수 하나로 묶인다 (업기)");
eq(moves[0].horses, [0, 1], "업은 말은 같이 움직인다");

const caught = applyMove({ a: [7, WAIT, WAIT], b: [5, WAIT, WAIT] }, "b", {
  from: 5, to: 7, horses: [0],
});
eq(caught.horses.a, [WAIT, WAIT, WAIT], "잡힌 말은 대기로 돌아간다");
eq(caught.caught, true, "잡았다고 알려준다");

const atCham = applyMove({ a: [CHAM, WAIT, WAIT], b: [29, WAIT, WAIT] }, "b", {
  from: 29, to: 31, horses: [0],
});
eq(atCham.caught, true, "참먹이에 선 말은 잡힌다 — 들어온 길이 달라도 같은 자리");

const stack = movesFor([33, 34, WAIT], 2);
eq(stack.length, 2, "같은 방에 선 두 말은 들어온 길이 달라도 업힌다");
eq(stack[0].horses, [0, 1], "업은 말은 같이 움직인다");

const same = applyMove({ a: [WAIT, WAIT, WAIT], b: [33, 22, WAIT] }, "b", {
  from: 22, to: 34, horses: [1],
});
eq(same.horses.b, [34, 34, WAIT], "업히면 되물릴 길도 방금 들어온 말을 따라간다");

const safe = applyMove({ a: [GOAL, WAIT, WAIT], b: [5, WAIT, WAIT] }, "b", {
  from: 5, to: GOAL, horses: [0],
});
eq(safe.caught, false, "골에서는 잡지 않는다");

const win = applyMove({ a: [WAIT, WAIT, WAIT], b: [GOAL, GOAL, 19] }, "b", {
  from: 19, to: GOAL, horses: [2],
});
eq(win.won, true, "셋이 다 나면 이긴다");

// 윷가락
eq(judge([0, 0, 0, 0]), 4, "배 넷 → 윷");
eq(judge([2, 2, 2, 2]), 5, "다 엎어지면 모");
eq(judge([0, 2, 2, 2]), 1, "배 하나 → 도");
eq(judge([2, 2, 2, 0]), -1, "백도 가락만 배를 보이면 백도");
eq(judge([0, 0, 2, 0]), 3, "백도 가락이 섞여도 셋이면 걸");

console.log(bad === 0 ? "\n전부 맞았습니다" : `\n${bad}개 틀렸습니다`);
process.exit(bad === 0 ? 0 : 1);
