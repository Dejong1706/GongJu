"use client";

import { useEffect, useRef, useState } from "react";
import YutBoard from "./YutBoard";
import YutThrow from "./YutThrow";
import {
  applyMove,
  ART,
  FRUIT,
  FRUIT_PAL,
  GOAL,
  isExtra,
  movesFor,
  other,
  pathOf,
  PER_WIN,
  rank,
  stuck,
  THROW_NAME,
  WAIT,
  type Horses,
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
const NAME: Record<YutSide, string> = { a: "병근", b: "정연" };

/**
 * 골인 표시 — **먹빛 패에 금색 체크** (9/23 사용자 요청).
 * 전에는 과일의 윤곽만 남겼는데 **아직 안 나간 말인지 다 난 말인지 구분이 안 됐다.**
 * 업은 말 숫자패(`YutBoard` 의 `count`) 와 같은 먹·금이라 "다 됐다" 는 표시로 읽힌다
 */
const CHECK = [
  [1, 4], [2, 5], [3, 6],
  [1, 5], [2, 6], [3, 7],
  [4, 5], [5, 4], [6, 3], [7, 2],
  [4, 6], [5, 5], [6, 4], [7, 3],
];

function Fruit({ side, kind }: { side: YutSide; kind: "wait" | "on" | "goal" }) {
  const rows = ART[side];
  return (
    <svg width="13" height="13" viewBox="0 0 9 9" shapeRendering="crispEdges" aria-hidden="true">
      {kind === "wait" ? (
        /* 아직 안 나간 말 — 빈 칸. 9/21 부터 이 모양 그대로다 */
        <>
          <rect x="1" y="1" width="7" height="7" fill="#efe0c8" stroke="#a87a4e" strokeWidth="1" />
          <rect x="4" y="4" width="1" height="1" fill="#a87a4e" />
        </>
      ) : kind === "goal" ? (
        <>
          <rect x="0" y="0" width="9" height="9" fill="#47301b" />
          <rect x="1" y="1" width="7" height="7" fill="#2b2622" />
          {CHECK.map(([x, y]) => (
            <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill="#d2a84f" />
          ))}
        </>
      ) : (
        rows.map((row, r) =>
          row.split("").map((ch, c) =>
            ch === "." ? null : (
              <rect key={`${r}-${c}`} x={c} y={r} width="1" height="1" fill={FRUIT_PAL[ch]} />
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
  onReset,
}: {
  game: YutGame;
  onWrite: (next: YutGame) => Promise<void> | void;
  onFinish: (next: YutGame, winner: YutSide) => Promise<void>;
  onStart: (cur: YutGame, turn: YutSide) => Promise<void> | void;
  onDraw: (cur: YutGame, next: { a: Throw | null; b: Throw | null }) => Promise<void> | void;
  onClose: (cur: YutGame) => Promise<void> | void;
  onReset: (cur: YutGame) => Promise<void> | void;
}) {
  const [throwing, setThrowing] = useState(false);
  /** 선 뽑기로 던지는 중이면 그 편 */
  const [drawing, setDrawing] = useState<YutSide | null>(null);
  /** 던진 값이 여러 개일 때 지금 쓸 것 */
  const [sel, setSel] = useState(0);
  const [msg, setMsg] = useState("");
  /** 갈림길에 선 말을 눌렀다 — 갈 곳을 고르는 중 */
  const [fork, setFork] = useState<number | null>(null);
  /** 판을 접을까 묻는 창 */
  const [asking, setAsking] = useState(false);
  /** 한 칸씩 걸어가는 중 — 옮긴 뒤에야 판을 고쳐 쓴다 */
  const [walk, setWalk] = useState<{
    side: YutSide;
    ids: number[];
    path: number[];
    step: number;
  } | null>(null);
  const pending = useRef<Move | null>(null);

  const turn = game.turn;
  const done = !!game.winner;
  /** 판이 돌고 있는 동안 — 기록 칸에 지금 던지는 쪽 이름을 붙인다 */
  const live = game.playing && !done;
  const mine = game.horses[turn];
  /** 남은 던질 횟수. 옛 문서는 `pending` 참/거짓으로 들어 있다 */
  const owe = game.owe ?? (game.pending ? 1 : 0);

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
  /** 누를 수 있는 밭. 갈림길에 선 말은 수가 둘이라 같은 밭이 두 번 나오므로 한 번으로 줄인다 */
  const boardPicks = [...new Set(moves.filter((m) => m.from !== WAIT).map((m) => m.from))];
  const outMove = moves.find((m) => m.from === WAIT);
  /** 갈림길을 누른 뒤 — 갈 수 있는 두 곳 */
  const forkMoves = fork === null ? [] : moves.filter((m) => m.from === fork);

  /** 걸어가는 동안에는 말을 잠깐 다른 밭에 그려둔다 — 판 문서는 도착해서야 고친다 */
  const shown: Horses = walk
    ? {
        ...game.horses,
        [walk.side]: game.horses[walk.side].map((p, i) =>
          walk.ids.includes(i) ? walk.path[walk.step] : p
        ),
      }
    : game.horses;

  const save = (next: YutGame) => {
    setSel(0);
    setMsg("");
    return Promise.resolve(onWrite(next)).catch(() => setMsg("보내지 못했어요"));
  };

  /**
   * 던진 값 하나를 썼다 — 남은 값이 없고 **빚진 던지기도 없으면** 차례가 넘어간다.
   * 잡았으면 던질 빚이 하나 는다 (윷 · 모와 따로 쌓인다)
   */
  const spend = (index: number, extra: { horses?: YutGame["horses"]; caught?: boolean }) => {
    const rolls = game.rolls.filter((_, i) => i !== index);
    const next = owe + (extra.caught ? 1 : 0);
    const horses = extra.horses ?? game.horses;
    if (rolls.length === 0 && next === 0) {
      // 차례를 넘기면서 **기록도 비운다** — 다음 사람은 자기가 던진 것만 본다
      return save({ ...game, horses, rolls: [], log: [], owe: 1, turn: other(turn) });
    }
    return save({ ...game, horses, rolls, owe: next });
  };

  /** 걸음이 끝났다 — 이제야 판을 고쳐 쓴다 */
  const commit = (move: Move) => {
    const res = applyMove(game.horses, turn, move);
    const index = use === null ? -1 : game.rolls.indexOf(use);
    if (res.won) {
      onFinish({ ...game, horses: res.horses, rolls: [], owe: 0 }, turn).catch(() =>
        setMsg("끝내지 못했어요")
      );
      return;
    }
    if (res.caught) setMsg(`${FRUIT[turn]}가 ${FRUIT[other(turn)]}를 잡았어요 — 한 번 더 던져요`);
    spend(index, { horses: res.horses, caught: res.caught });
  };

  /**
   * 말을 옮긴다. **순간이동하지 않고 한 칸씩 걸어간다** (9/23 사용자 요청) —
   * 지름길을 탔는지 바깥으로 돌았는지가 눈에 보인다.
   * 줄이기 설정이면 걷지 않고 바로 옮긴다.
   */
  const play = (move: Move) => {
    if (use === null || walk) return;
    setFork(null);
    const path = pathOf(move.from, use, move.branch);
    const still =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (path.length === 0 || still) {
      commit(move);
      return;
    }
    pending.current = move;
    setWalk({ side: turn, ids: move.horses, path, step: 0 });
  };

  // 한 칸에 0.13초. 마지막 칸을 밟으면 잠깐 두었다가 판을 고친다
  useEffect(() => {
    if (!walk) return;
    const last = walk.step >= walk.path.length - 1;
    const timer = setTimeout(
      () => {
        if (!last) {
          setWalk((w) => (w ? { ...w, step: w.step + 1 } : w));
          return;
        }
        const move = pending.current;
        pending.current = null;
        setWalk(null);
        if (move) commit(move);
      },
      last ? 90 : 130
    );
    return () => clearTimeout(timer);
    // commit 은 매 렌더 새로 만들어진다 — walk 이 바뀔 때마다 이 효과가 다시 돌아 최신 것을 쥔다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walk]);

  const skip = () => {
    if (use === null) return;
    spend(game.rolls.indexOf(use), {});
  };

  const finishThrow = (t: Throw) => {
    setThrowing(false);
    save({
      ...game,
      rolls: [...game.rolls, t],
      log: [...game.log, t],
      // 한 번 던져 빚을 갚고, 윷 · 모면 다시 진다
      owe: Math.max(0, owe - 1) + (isExtra(t) ? 1 : 0),
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
        {/* 기간 · D-day 는 뺐다 (9/23 사용자 요청) — 언제까지인지 말로 하지 않기로 했다 */}
        <span className="ev-ttl">윷 한 판</span>
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
          horses={shown}
          /* 걸어가는 동안에는 아무것도 못 누른다 — 두 번 눌리면 한 수가 두 번 간다 */
          pick={game.playing && !done && !walk && fork === null ? boardPicks : []}
          onPick={(pos) => {
            const opts = moves.filter((m) => m.from === pos);
            // 갈림길이면 바로 안 가고 갈 곳을 묻는다
            if (opts.length > 1) setFork(pos);
            else if (opts[0]) play(opts[0]);
          }}
          go={forkMoves.map((m) => m.to)}
          onGo={(pos) => {
            const move = forkMoves.find((m) => m.to === pos);
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
          {/* 이 칸은 **지금 던지는 쪽** 것만 담는다 — 이름과 색으로 못박아 둔다 */}
          <span className={live ? `ev-key ev-key-${turn}` : ""}>
            {live ? `${NAME[turn]}이 던진 윷` : "던진 윷"}
          </span>
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
                  className={`ev-chip ev-chip-${turn} ${isNow ? "ev-chip-on" : ""}`}
                  onClick={() => {
                    if (!usable) return;
                    setFork(null); // 값을 바꾸면 고르던 갈림길은 무효다
                    setSel(i - unusedFrom);
                  }}
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
      ) : (
        <>
          {/*
           * 윷 · 모가 나와도 **옮기고 나서 던질 필요가 없다** — 먼저 다 던져 값을 모아 두고
           * 어느 것부터 쓸지 보고 정한다 (9/22 사용자 요청). 그래서 두 버튼이 나란히 선다.
           * 옮길 말을 고르는 건 판을 눌러서 하니, 던질 수 있을 때는 그 안내를 아랫줄로 내린다
           */}
          <div className="ev-acts">
            {fork !== null && (
              <button className="btn ev-btn ev-btn-ghost" onClick={() => setFork(null)}>
                다시 고르기
              </button>
            )}
            {fork === null &&
              game.rolls.length > 0 &&
              (outMove ? (
                <button className="btn ev-btn" onClick={() => play(outMove)} disabled={!!walk}>
                  새 {FRUIT[turn]} 내보내기
                </button>
              ) : moves.length === 0 ? (
                <button className="btn ev-btn" onClick={skip} disabled={!!walk}>
                  {use !== null && stuck(mine, use)
                    ? "백도는 못 써요 · 건너뛰기"
                    : "옮길 말이 없어요 · 건너뛰기"}
                </button>
              ) : owe > 0 ? null : (
                <button className="btn ev-btn ev-btn-ghost" disabled>
                  옮길 {FRUIT[turn]}를 고르세요
                </button>
              ))}
            {fork === null && owe > 0 && (
              <button
                className="btn ev-btn"
                onClick={() => setThrowing(true)}
                disabled={!!walk}
              >
                {game.log.length > 0 ? "한 번 더 던지기" : "윷 던지기"}
              </button>
            )}
          </div>
          <div className="ev-hint">
            {msg ||
              (fork !== null
                ? "갈림길이에요 — 갈 곳을 눌러요"
                : walk
                ? "가는 중…"
                : use === null
                ? `${NAME[turn]}이 던질 차례예요 · 정연이 이기면 ${PER_WIN} 포인트`
                : /* 판에 말이 없는데 백도면 쓸 데가 없다 — 왜 못 쓰는지 밝혀준다 */
                  stuck(mine, use)
                ? "백도 — 판에 나간 말이 없어서 쓸 수 없어요"
                : moves.length === 0
                ? `${THROW_NAME[use]} — 옮길 ${FRUIT[turn]}가 없어요`
                : owe > 0
                ? `${THROW_NAME[use]} — 지금 옮겨도 되고, 더 던지고 골라도 돼요`
                : `${THROW_NAME[use]} — 판에서 점선이 그려진 ${FRUIT[turn]}를 눌러요`)}
          </div>
        </>
      )}

      {/*
       * 판 접기 (9/23 사용자 요청). 잘못 시작했거나 그만두고 싶어도 끝까지 두는 수밖에 없었다.
       * **눈에 안 띄게 조용한 글씨**로 둔다 — 실수로 눌러 두던 판이 날아가면 안 된다.
       * 전적은 그대로 두고 시작 화면으로만 돌아간다
       */}
      {(game.playing || !!game.first) && !done && (
        <button type="button" className="ev-reset" onClick={() => setAsking(true)}>
          판 초기화
        </button>
      )}

      {/* 앱의 분홍 Popup 을 쓰지 않는다 — 이긴 창과 같은 먹빛 창을 손으로 짠다 */}
      {asking && (
        <div className="dim" onClick={(e) => e.target === e.currentTarget && setAsking(false)}>
          <div className="pop ev-pop" role="dialog" aria-modal="true" aria-label="판 초기화">
            <div className="pop-head">
              <span>판 초기화</span>
            </div>
            <div className="pop-body">
              <p className="ev-ask">
                두던 판을 접고 게임 시작 화면으로 돌아가요
                <br />
                지금 놓인 말은 전부 없어져요
              </p>
            </div>
            <div className="pop-foot">
              <button
                className="btn ev-btn"
                onClick={() => {
                  setAsking(false);
                  setFork(null);
                  setWalk(null);
                  pending.current = null;
                  onReset(game);
                }}
              >
                초기화
              </button>
              <button className="btn ev-btn ev-btn-ghost" onClick={() => setAsking(false)}>
                그만두기
              </button>
            </div>
          </div>
        </div>
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
