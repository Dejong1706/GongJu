"use client";

import { useState } from "react";
import YutBoard from "./YutBoard";
import YutThrow from "./YutThrow";
import { EVENT } from "@/lib/config";
import { parseYmd, shortDate, ymd } from "@/lib/date";
import {
  applyMove,
  ART,
  FRUIT,
  FRUIT_PAL,
  GOAL,
  isExtra,
  movesFor,
  other,
  PER_WIN,
  rank,
  realThrow,
  THROW_NAME,
  WAIT,
  type Move,
  type Throw,
  type YutSide,
} from "@/lib/yut";
import type { YutGame } from "@/lib/types";

/**
 * 윷놀이 이벤트 탭. **한 계정으로 둘이 번갈아** 던진다 —
 * 누구 차례인지도 판과 같이 Firestore 문서에 들어 있어서, 각자 폰에서 봐도 같은 판이 보인다.
 *
 * 앱의 분홍을 쓰지 않는다. 먹 · 고동 · 한지 · 단청으로만 칠하고,
 * 그 색은 globals.css 의 `.ev` 아래에만 걸어둬서 다른 탭에는 안 번진다.
 *
 * **이벤트가 끝나면** 이 파일 · YutBoard · YutThrow · lib/yut.ts 를 지우고
 * TabBar 의 이벤트 줄과 AppRoot 의 event 칸만 걷어내면 된다 (history.md 참고).
 */

/** 편 이름. 정연이 쓰는 앱이지만 둘이 같이 보는 화면이라 이름을 그대로 적는다 */
const NAME: Record<YutSide, string> = { a: "오빠", b: "정연" };

function Fruit({ side, kind }: { side: YutSide; kind: "wait" | "on" | "goal" }) {
  const rows = ART[side];
  return (
    <svg width="13" height="13" viewBox="0 0 9 9" shapeRendering="crispEdges" aria-hidden="true">
      {kind === "wait" ? (
        <>
          <rect x="1" y="1" width="7" height="7" fill="#efe0c8" stroke="#a87a4e" strokeWidth="1" />
          <rect x="4" y="4" width="1" height="1" fill="#a87a4e" />
        </>
      ) : (
        rows.map((row, r) =>
          row.split("").map((ch, c) =>
            ch === "." ? null : (
              <rect
                key={`${r}-${c}`}
                x={c}
                y={r}
                width="1"
                height="1"
                /* 골인한 말은 색을 빼고 윤곽만 — 다 들어갔다는 표시 */
                fill={kind === "goal" ? (ch === "o" ? "#a87a4e" : "#f7ecd9") : FRUIT_PAL[ch]}
              />
            )
          )
        )
      )}
    </svg>
  );
}

export default function EventView({
  game,
  onWrite,
  onFinish,
  onStart,
  onDraw,
  onClose,
  today,
}: {
  game: YutGame;
  onWrite: (next: YutGame) => Promise<void> | void;
  onFinish: (next: YutGame, winner: YutSide) => Promise<void>;
  onStart: (cur: YutGame, turn: YutSide) => Promise<void> | void;
  onDraw: (cur: YutGame, next: { a: Throw | null; b: Throw | null }) => Promise<void> | void;
  onClose: (cur: YutGame) => Promise<void> | void;
  today: Date;
}) {
  const [throwing, setThrowing] = useState(false);
  /** 선 뽑기로 던지는 중이면 그 편 */
  const [drawing, setDrawing] = useState<YutSide | null>(null);
  /** 던진 값이 여러 개일 때 지금 쓸 것 */
  const [sel, setSel] = useState(0);
  const [msg, setMsg] = useState("");

  const turn = game.turn;
  const done = !!game.winner;
  const mine = game.horses[turn];

  const left = Math.max(
    0,
    Math.round(
      (parseYmd(EVENT.end).getTime() - parseYmd(ymd(today)).getTime()) / 86_400_000
    )
  );

  /*
   * 선 뽑기. 정연이 먼저 던지고, 둘 다 나오면 높은 쪽이 선이 된다.
   * 같으면 둘 다 비우고 다시 (전통 방식 — 사용자가 고른 것)
   */
  const f = game.first;
  const bothIn = !!f && f.a != null && f.b != null;
  const tie = bothIn && rank(f!.a!) === rank(f!.b!);
  const lead: YutSide | null = bothIn && !tie ? (rank(f!.a!) > rank(f!.b!) ? "a" : "b") : null;
  const toDraw: YutSide | null = !f ? null : f.b == null ? "b" : f.a == null ? "a" : null;

  // 지금 쓸 값과 그 값으로 갈 수 있는 수
  const use: Throw | null = game.rolls.length > 0 ? game.rolls[Math.min(sel, game.rolls.length - 1)] : null;
  const moves = use === null ? [] : movesFor(mine, use);
  const boardPicks = moves.filter((m) => m.from !== WAIT).map((m) => m.from);
  const outMove = moves.find((m) => m.from === WAIT);

  const save = (next: YutGame) => {
    setSel(0);
    setMsg("");
    return Promise.resolve(onWrite(next)).catch(() => setMsg("보내지 못했어요"));
  };

  /** 던진 값 하나를 썼다 — 남은 값이 없고 더 던질 것도 없으면 차례가 넘어간다 */
  const spend = (index: number, extra: { horses?: YutGame["horses"]; caught?: boolean }) => {
    const rolls = game.rolls.filter((_, i) => i !== index);
    const pending = game.pending || !!extra.caught;
    const horses = extra.horses ?? game.horses;
    if (rolls.length === 0 && !pending) {
      return save({ ...game, horses, rolls: [], pending: true, turn: other(turn) });
    }
    return save({ ...game, horses, rolls, pending });
  };

  const play = (move: Move) => {
    if (use === null) return;
    const res = applyMove(game.horses, turn, move);
    const index = game.rolls.indexOf(use);
    if (res.won) {
      const next: YutGame = {
        ...game,
        horses: res.horses,
        rolls: [],
        pending: false,
      };
      onFinish(next, turn).catch(() => setMsg("끝내지 못했어요"));
      return;
    }
    if (res.caught) setMsg(`${FRUIT[turn]}가 ${FRUIT[other(turn)]}를 잡았어요 — 한 번 더 던져요`);
    spend(index, { horses: res.horses, caught: res.caught });
  };

  const skip = () => {
    if (use === null) return;
    spend(game.rolls.indexOf(use), {});
  };

  const finishThrow = (t: Throw) => {
    setThrowing(false);
    // 판에 말이 하나도 없을 때의 백도는 도로 친다 — 안 그러면 아무것도 못 하고 넘어간다
    const real = realThrow(mine, t);
    save({
      ...game,
      rolls: [...game.rolls, real],
      log: [...game.log, real],
      pending: isExtra(t),
    });
  };

  /*
   * 이름 · 차례 · 말 셋만 보여준다. 판마다 100점 고정이라
   * 승수나 딴 포인트를 세어 보여줄 이유가 없다 (사용자 요청).
   * wins · paid 는 문서에 계속 쌓이므로 다시 보여주고 싶으면 여기만 되살리면 된다
   */
  const card = (side: YutSide) => (
    <div className={`ev-side ev-side-${side} ${turn === side && !done ? "ev-side-on" : ""}`}>
      <span className="ev-side-top">
        <span className="ev-badge">
          <Fruit side={side} kind="on" />
        </span>
        <span className="ev-name">{NAME[side]}</span>
        {turn === side && !done && <span className="ev-turn">차례</span>}
      </span>
      <span className="ev-horses">
        {game.horses[side].map((p, i) => (
          <Fruit key={i} side={side} kind={p === GOAL ? "goal" : p === WAIT ? "wait" : "on"} />
        ))}
      </span>
    </div>
  );

  return (
    <>
      <div className="ev-board-head">
        <span className="ev-knob" />
        <span className="ev-ttl">
          윷 한 판
          <span className="ev-when">
            {" · "}
            {shortDate(EVENT.start)} ~ {shortDate(EVENT.end)}
          </span>
        </span>
        <span className="ev-dday">{left > 0 ? `D-${left}` : "오늘까지"}</span>
        <span className="ev-knob" />
      </div>
      <div className="ev-saekdong" />

      <div className="ev-score">
        {card("a")}
        <span className="ev-vs" />
        {card("b")}
      </div>

      <div className="ev-board-wrap">
        <YutBoard
          horses={game.horses}
          pick={game.playing && !done ? boardPicks : []}
          onPick={(pos) => {
            const move = moves.find((m) => m.from === pos);
            if (move) play(move);
          }}
        />
        {/* 판을 안 열었으면 어둡게 덮는다 — 시작 버튼, 그다음 선 뽑기 */}
        {!game.playing &&
          (game.first ? (
            <div className="ev-cover">
              <span className="ev-draw-ttl">선 뽑기</span>
              <span className="ev-draw">
                {(["b", "a"] as YutSide[]).map((side) => (
                  <span
                    key={side}
                    className={`ev-draw-row ${lead === side ? "ev-draw-win" : ""}`}
                  >
                    <b>{NAME[side]}</b>
                    <i>{game.first?.[side] != null ? THROW_NAME[game.first[side]!] : "아직"}</i>
                  </span>
                ))}
              </span>
              {lead ? (
                <>
                  <button className="btn ev-btn ev-start" onClick={() => onStart(game, lead)}>
                    {NAME[lead]}부터 · 판 시작
                  </button>
                  <span className="ev-cover-sub">높이 나온 쪽이 먼저 던져요</span>
                </>
              ) : tie ? (
                <>
                  <button
                    className="btn ev-btn ev-start"
                    onClick={() => onDraw(game, { a: null, b: null })}
                  >
                    다시 뽑기
                  </button>
                  <span className="ev-cover-sub">같은 값이 나왔어요</span>
                </>
              ) : (
                <button
                  className="btn ev-btn ev-start"
                  onClick={() => setDrawing(toDraw)}
                  disabled={!toDraw}
                >
                  {toDraw ? `${NAME[toDraw]} 던지기` : "…"}
                </button>
              )}
            </div>
          ) : (
            <div className="ev-cover">
              <button
                className="btn ev-btn ev-start"
                onClick={() => onDraw(game, { a: null, b: null })}
              >
                게임 시작
              </button>
              <span className="ev-cover-sub">한 번씩 던져서 선을 정해요</span>
            </div>
          ))}
      </div>

      <div className="ev-log">
        <div className="ev-log-head">
          <span>던진 윷</span>
          <span>{game.log.length > 0 ? `${game.log.length}번` : "아직 없음"}</span>
        </div>
        <div className="ev-log-body">
          {game.log.length === 0 ? (
            <span className="ev-log-empty">던지면 여기에 쌓여요</span>
          ) : (
            game.log.map((t, i) => {
              // 아직 안 쓴 값은 기록 맨 뒤에 남아 있다 — 그 중 지금 쓸 것만 진하게
              const unusedFrom = game.log.length - game.rolls.length;
              const isNow =
                !done &&
                game.rolls.length > 0 &&
                i === unusedFrom + Math.min(sel, game.rolls.length - 1);
              const usable = !done && i >= unusedFrom;
              return (
                <button
                  key={i}
                  type="button"
                  className={`ev-chip ${isNow ? "ev-chip-on" : ""}`}
                  onClick={() => usable && setSel(i - unusedFrom)}
                >
                  {THROW_NAME[t]}
                </button>
              );
            })
          )}
        </div>
      </div>

      {!game.playing ? (
        <div className="ev-hint">
          말 셋을 먼저 다 내보내면 이겨요 · 정연이 이기면 {PER_WIN} 포인트
        </div>
      ) : done ? (
        <div className="ev-hint">판이 끝났어요</div>
      ) : game.rolls.length > 0 ? (
        <>
          {outMove ? (
            <button className="btn ev-btn" onClick={() => play(outMove)}>
              새 {FRUIT[turn]} 내보내기
            </button>
          ) : moves.length === 0 ? (
            <button className="btn ev-btn" onClick={skip}>
              옮길 말이 없어요 · 건너뛰기
            </button>
          ) : (
            <button className="btn ev-btn ev-btn-ghost" disabled>
              옮길 {FRUIT[turn]}를 고르세요
            </button>
          )}
          <div className="ev-hint">
            {msg ||
              (use !== null
                ? `${THROW_NAME[use]} — 판에서 점선이 그려진 ${FRUIT[turn]}를 눌러요`
                : "")}
          </div>
        </>
      ) : (
        <>
          <button className="btn ev-btn" onClick={() => setThrowing(true)}>
            윷 던지기
          </button>
          <div className="ev-hint">
            {msg || `${NAME[turn]}이 던질 차례예요 · 정연이 이기면 ${PER_WIN} 포인트`}
          </div>
        </>
      )}

      {throwing && <YutThrow who={NAME[turn]} onDone={finishThrow} />}

      {drawing && (
        <YutThrow
          who={NAME[drawing]}
          draw
          onDone={(t) => {
            const side = drawing;
            setDrawing(null);
            onDraw(game, { a: f?.a ?? null, b: f?.b ?? null, [side]: t });
          }}
        />
      )}

      {/* 이긴 창 — 확인을 누르면 판을 접고 시작 화면으로 돌아간다 */}
      {done && (
        <div className="dim">
          <div className="pop ev-pop">
            <div className="pop-head">
              <span>한 판 끝!</span>
            </div>
            <div className="pop-body">
              <div className="ev-win">
                <span className="ev-win-fruit">
                  <Fruit side={game.winner as YutSide} kind="on" />
                </span>
                <b>{NAME[game.winner as YutSide]}</b>의{" "}
                {FRUIT[game.winner as YutSide]}가 다 들어왔어요
                {game.winner === "b" && (
                  <>
                    <br />
                    <span className="ev-win-pt">＋{PER_WIN} 포인트</span>
                  </>
                )}
              </div>
            </div>
            <div className="pop-foot">
              <button className="btn ev-btn" onClick={() => onClose(game)}>
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
