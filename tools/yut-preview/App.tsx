/**
 * 윷놀이 시안 페이지.
 *
 * **앱의 EventView · YutBoard · YutThrow · lib/yut 를 그대로 가져다 쓴다.**
 * 9/23 까지는 시안용으로 따로 쓴 HTML 한 장이었는데, 앱을 고칠 때마다 손으로 옮겨 심다가
 * 결국 뒤처졌다. 판다 시안실과 같은 방식(esbuild 로 앱 코드를 묶기) 으로 바꿔서
 * **이제 앱을 고치면 여기도 따라온다.**
 *
 * Firestore 대신 판을 이 화면의 state 에 들고 있고, 손을 거드는 칸이 아래에 붙는다.
 * 만드는 법 · 올리는 법은 history.md "시안" 참고.
 */
import { useState } from "react";
import { createRoot } from "react-dom/client";
import EventView from "@/components/EventView";
import TabBar from "@/components/TabBar";
import { EMPTY_GAME, GOAL, HORSES, PER_WIN, WAIT, type Throw, type YutSide } from "@/lib/yut";
import type { YutGame } from "@/lib/types";

/** 앱의 useYut 가 하는 일을 화면 안에서 흉내 낸다 — 규칙은 EventView 가 그대로 쥐고 있다 */
function useLocalYut() {
  const [game, setGame] = useState<YutGame>(EMPTY_GAME);

  return {
    game,
    write: (next: YutGame) => setGame(next),
    finish: async (next: YutGame, winner: YutSide) => {
      setGame({
        ...next,
        winner,
        wins: { ...next.wins, [winner]: next.wins[winner] + 1 },
        paid: next.paid + (winner === "b" ? PER_WIN : 0),
        paidRound: next.round,
      });
    },
    start: (cur: YutGame, turn: YutSide) =>
      setGame({
        ...EMPTY_GAME,
        playing: true,
        turn,
        wins: cur.wins,
        paid: cur.paid,
        round: cur.round + 1,
      }),
    draw: (cur: YutGame, next: { a: Throw | null; b: Throw | null }) =>
      setGame({ ...cur, playing: false, first: next }),
    close: (cur: YutGame) =>
      setGame({
        ...EMPTY_GAME,
        playing: false,
        turn: cur.winner ?? cur.turn,
        wins: cur.wins,
        paid: cur.paid,
        round: cur.round,
      }),
    reset: (cur: YutGame) =>
      setGame({
        ...EMPTY_GAME,
        playing: false,
        first: null,
        turn: cur.turn,
        wins: cur.wins,
        paid: cur.paid,
        round: cur.round,
        paidRound: cur.paidRound,
      }),
    setGame,
  };
}

/** 확인하기 어려운 자리를 바로 만들어 주는 칸. 시안에만 있고 앱에는 없다 */
function Rig({
  game,
  onSet,
}: {
  game: YutGame;
  onSet: (next: YutGame) => void;
}) {
  const put = (side: YutSide, horses: number[]) =>
    onSet({ ...game, horses: { ...game.horses, [side]: horses }, playing: true, first: null });

  const rows: [string, () => void][] = [
    ["갈림길 (우상 모서리)", () => put("b", [5, WAIT, WAIT])],
    ["갈림길 (방)", () => put("b", [34, WAIT, WAIT])],
    ["잡기 직전 (한 칸 앞)", () => onSet({
      ...game,
      playing: true,
      first: null,
      horses: { a: [4, WAIT, WAIT], b: [3, WAIT, WAIT] },
      turn: "b",
      rolls: [1],
      owe: 0,
      log: [1],
    })],
    ["업은 말 잡기", () => onSet({
      ...game,
      playing: true,
      first: null,
      horses: { a: [4, 4, WAIT], b: [3, WAIT, WAIT] },
      turn: "b",
      rolls: [1],
      owe: 0,
      log: [1],
    })],
    ["나기 직전", () => put("b", [19, GOAL, GOAL])],
    ["백도인데 판에 말 없음", () => onSet({
      ...game,
      playing: true,
      first: null,
      horses: { a: Array(HORSES).fill(WAIT), b: Array(HORSES).fill(WAIT) },
      turn: "b",
      rolls: [-1],
      owe: 0,
      log: [-1],
    })],
    ["던진 값 여럿 (모 · 걸 · 도)", () => onSet({
      ...game,
      playing: true,
      first: null,
      turn: "b",
      rolls: [5, 3, 1],
      owe: 0,
      log: [5, 3, 1],
    })],
    ["처음으로", () => onSet(EMPTY_GAME)],
  ];

  return (
    <div className="rig">
      <b>자리 만들기</b>
      <div className="rig-btns">
        {rows.map(([label, run]) => (
          <button key={label} type="button" onClick={run}>
            {label}
          </button>
        ))}
      </div>
      <p>
        판은 이 화면의 state 에만 있어요 — 새로 고치면 처음으로 돌아가요.
        <br />
        규칙 · 그림은 전부 앱 코드 그대로입니다.
      </p>
    </div>
  );
}

function App() {
  const yut = useLocalYut();

  return (
    <div className="sheet">
      <div className="device">
        <div className="island" />

        <header className="appbar">
          <div className="sprinkle" />
          <div className="flex flex-col">
            <button type="button" className="guide-btn">
              가이드
            </button>
            <h1 className="font-pixel text-[17px] leading-[1.4] text-white relative [text-shadow:2px_2px_0_var(--pink-deep)]">
              정연공듀
            </h1>
          </div>
          <div className="relative text-right leading-[1.5]">
            <div className="text-[11px]">
              9월 23일 수
              <br />
              4주차
            </div>
          </div>
        </header>
        <div className="edge edge-down" />

        <div className="scroll ev">
          <EventView
            game={yut.game}
            onWrite={yut.write}
            onFinish={yut.finish}
            onStart={yut.start}
            onDraw={yut.draw}
            onClose={yut.close}
            onReset={yut.reset}
          />
        </div>

        <div className="edge edge-up" />
        <TabBar tab="event" onChange={() => {}} onLocked={() => {}} eventLocked={false} />
      </div>

      <Rig game={yut.game} onSet={yut.setGame} />
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
