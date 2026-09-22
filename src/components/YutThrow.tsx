"use client";

import { useEffect, useRef, useState } from "react";
import {
  isExtra,
  judge,
  rollFaces,
  THROW_NAME,
  THROW_STEP,
  type Faces,
  type Throw,
} from "@/lib/yut";

/**
 * 윷 던지기. 멍석 위에서 가락 넷이 **솟았다 떨어지고 튄다.**
 * 키프레임이 아니라 매 판마다 속도 · 중력을 셈해서 옮기므로 던질 때마다 다르게 구른다.
 *
 * - 자리(y) 는 늘 **정수 px** 로만 옮긴다. 반 픽셀이 나오면 도트가 어긋나 깨져 보인다
 *   (판다 걸음 · `steps()` 와 같은 이유 — history.md "넘어졌던 곳" 참고)
 * - 도트 그림이라 **진짜로 회전시키지 않고 면을 갈아끼운다.** 배 · 모로 선 면 · 등 네 장
 * - 줄이기 설정(reduced motion) 이면 굴리지 않고 결과만 보여준다
 *
 * 이벤트가 끝나면 이 파일째 지운다.
 */

type Stick = {
  y: number;
  v: number;
  /** 좌우로 흩어진 거리 (px). 멍석 밖으로 못 나가게 SPREAD 안에 가둔다 */
  x: number;
  vx: number;
  spin: number;
  face: number;
  rest: boolean;
  bounce: number;
};

const G = 1.7;
const TICK = 60;
/** 좌우로 흩어질 수 있는 최대 거리 — 슬롯 사이 틈만큼만 (9/23) */
const SPREAD = 9;

const make = (): Stick[] =>
  [0, 1, 2, 3].map((i) => ({
    y: 5 + i * 4,
    v: 7 + Math.random() * 3, // 솟는 힘 — 멍석 안에 갇히도록 잡은 값
    x: 0,
    // 던진 손에서 갈라지듯 좌우로 — 가운데 둘은 조금, 바깥 둘은 바깥쪽으로 더
    vx: (i - 1.5) * 0.55 + (Math.random() - 0.5) * 1.6,
    spin: Math.floor(Math.random() * 4),
    face: 0,
    rest: false,
    bounce: 0,
  }));

/** 면 — 0 배(평평한 면) · 1,3 모로 선 면 · 2 등(둥근 면) */
function Stick({ face, back }: { face: number; back: boolean }) {
  return (
    <svg width="26" height="88" viewBox="0 0 13 44" shapeRendering="crispEdges">
      {face === 1 || face === 3 ? (
        <>
          <rect x="5" y="1" width="3" height="42" fill="#b08554" />
          <rect x="5" y="1" width="1" height="42" fill="#cfa477" />
          <rect x="7" y="1" width="1" height="42" fill="#7d5730" />
          <rect x="5" y="0" width="3" height="1" fill="#47301b" />
          <rect x="5" y="43" width="3" height="1" fill="#47301b" />
        </>
      ) : face === 0 ? (
        <>
          {/* 배 — 깎아낸 면. 한지빛에 나뭇결 */}
          <rect x="2" y="1" width="9" height="42" fill="#f3e3ca" />
          <rect x="2" y="0" width="9" height="1" fill="#47301b" />
          <rect x="2" y="43" width="9" height="1" fill="#47301b" />
          <rect x="1" y="2" width="1" height="40" fill="#7d5730" />
          <rect x="11" y="2" width="1" height="40" fill="#7d5730" />
          <rect x="4" y="5" width="1" height="34" fill="#e3d0b0" />
          <rect x="8" y="8" width="1" height="28" fill="#e3d0b0" />
          {/* 백도 가락 — 배에 단청 적색 점을 새겨둔다 */}
          {back && (
            <>
              <rect x="5" y="19" width="3" height="3" fill="#a6362b" />
              <rect x="5" y="24" width="3" height="3" fill="#a6362b" />
            </>
          )}
        </>
      ) : (
        <>
          {/* 등 — 둥글게 남긴 면 */}
          <rect x="2" y="1" width="9" height="42" fill="#a87a4e" />
          <rect x="2" y="0" width="9" height="1" fill="#47301b" />
          <rect x="2" y="43" width="9" height="1" fill="#47301b" />
          <rect x="1" y="3" width="1" height="38" fill="#7d5730" />
          <rect x="11" y="3" width="1" height="38" fill="#7d5730" />
          <rect x="4" y="4" width="2" height="36" fill="#c69a6c" />
          <rect x="8" y="10" width="1" height="24" fill="#7d5730" />
        </>
      )}
    </svg>
  );
}

/** 높이 뜰수록 작고 옅어지는 그림자 — 이게 있어야 공중에 뜬 게 보인다 */
function Shadow({ h }: { h: number }) {
  const w = Math.max(9, 24 - Math.round(h / 2.5));
  const x = Math.round((26 - w) / 2);
  const tone = h > 30 ? "#b99a72" : h > 10 ? "#a98861" : "#8e6d47";
  return (
    <svg width="26" height="6" viewBox="0 0 26 6" shapeRendering="crispEdges">
      <rect x={x + 2} y="1" width={w - 4} height="2" fill={tone} />
      <rect x={x} y="3" width={w} height="1" fill={tone} />
    </svg>
  );
}

/** 멍석 — 짚을 엮은 무늬 */
function Mat() {
  const rows = [];
  for (let y = 0; y < 42; y += 3) {
    rows.push(<rect key={`l${y}`} x="0" y={y} width="76" height="1" fill="#b8955f" />);
    for (let x = (y / 3) % 2 === 0 ? 0 : 3; x < 76; x += 6)
      rows.push(<rect key={`s${y}-${x}`} x={x} y={y + 1} width="3" height="2" fill="#c2a271" />);
  }
  return (
    <svg className="yut-mat-bg" viewBox="0 0 76 42" preserveAspectRatio="none" shapeRendering="crispEdges">
      <rect x="0" y="0" width="76" height="42" fill="#cdae80" />
      {rows}
      <rect x="0" y="0" width="76" height="2" fill="#8e6d47" />
      <rect x="0" y="40" width="76" height="2" fill="#8e6d47" />
    </svg>
  );
}

export default function YutThrow({
  who,
  draw,
  onDone,
}: {
  /** 지금 던지는 사람 이름 */
  who: string;
  /** 선 뽑기 — 한 번만 던지고 "몇 칸" 대신 높낮이를 알려준다 */
  draw?: boolean;
  onDone: (t: Throw) => void;
}) {
  const faces = useRef<Faces>(rollFaces());
  const [sticks, setSticks] = useState<Stick[]>(make);
  const [result, setResult] = useState<Throw | null>(null);
  const [shake, setShake] = useState(0);

  useEffect(() => {
    const still =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (still) {
      setSticks(sticks.map((s, i) => ({ ...s, y: 0, rest: true, face: faces.current[i] })));
      setResult(judge(faces.current));
      return;
    }

    /*
     * **셈은 setState 밖에서 한다.** 전에는 `setSticks(list => …)` 안에서 `moving` 을 켜고
     * 그 값을 밖에서 봤는데, React 는 그 함수를 **이 자리에서 돌려주지 않을 때가 있다.**
     * 그러면 `moving` 이 거짓인 채로 첫 틱에 타이머가 멈춰서,
     * **가락이 구르다 만 면(모로 선 면까지)에 멈춰 있는데 값은 나와 버렸다** —
     * "개인데 한 짝만 뒤집혀 있다" 가 이것이다 (9/23 사용자가 잡아준 것).
     * 이제 다음 상태를 먼저 만들고, 그걸 그대로 넣는다.
     */
    let cur = sticks; // 효과는 한 번만 돈다 — make() 가 만든 첫 값이다
    let tick = 0;
    const timer = setInterval(() => {
      tick++;
      let moving = false;
      let landed = false;
      cur = cur.map((s, i) => {
        if (s.rest) return s;
        moving = true;
        const next = { ...s };
        next.v -= G;
        next.y += next.v;
        // 옆으로도 미끄러진다. 멍석을 벗어나면 벽에 맞은 듯 되튄다
        next.x += next.vx;
        if (next.x < -SPREAD || next.x > SPREAD) {
          next.x = next.x < 0 ? -SPREAD : SPREAD;
          next.vx = -next.vx * 0.5;
        }
        if (next.y <= 0) {
          next.y = 0;
          next.bounce++;
          next.vx *= 0.5; // 바닥에 닿을 때마다 옆으로 가는 힘이 죽는다
          if (next.bounce >= 3 || Math.abs(next.v) < 4) {
            next.rest = true;
            next.face = faces.current[i]; // 여기서 면이 정해진다
            landed = true;
          } else {
            next.v = -next.v * 0.44; // 튕긴다
          }
        }
        // 공중에서는 빨리, 떨어질수록 천천히 돈다
        if (!next.rest && tick % (next.bounce >= 2 ? 3 : 1) === 0) next.spin++;
        return next;
      });
      setSticks(cur);
      if (landed) setShake((n) => n + 1);
      // 넷이 다 누웠다 — 이제야 값을 읽는다. 그림과 값이 어긋날 수 없다
      if (!moving) {
        clearInterval(timer);
        setResult(judge(faces.current));
      }
    }, TICK);
    return () => clearInterval(timer);
    // sticks 는 처음 값만 쓴다 (효과가 한 번만 돌아서 늘 make() 의 결과다)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 선 뽑기에서는 윷 · 모가 나와도 한 번 더 던지지 않는다
  const again = !draw && result !== null && isExtra(result);

  return (
    <div className="dim">
      <div className="pop ev-pop">
        <div className="pop-head">
          <span>{draw ? "선 뽑기" : "윷 던지기"}</span>
          <span className="ev-who">{who} 차례</span>
        </div>
        <div className="pop-body ev-pop-body">
          <div className={`yut-mat ${shake ? "yut-shake" : ""}`} key={shake}>
            <Mat />
            <div className="yut-sticks">
              {sticks.map((s, i) => (
                <span className="yut-slot" key={i}>
                  {/* 자리는 늘 정수 px — 반 픽셀이 나오면 도트가 어긋나 깨져 보인다 */}
                  <span
                    className="yut-stick"
                    style={{
                      transform: `translate(${Math.round(s.x)}px, ${-Math.round(s.y)}px)`,
                    }}
                  >
                    <Stick face={s.rest ? s.face : (s.spin + i) % 4} back={i === 3} />
                  </span>
                  <span
                    className="yut-shadow"
                    style={{ transform: `translateX(${Math.round(s.x)}px)` }}
                  >
                    <Shadow h={s.y} />
                  </span>
                </span>
              ))}
            </div>
          </div>

          <div className="yut-out">
            {result === null ? (
              <div className="yut-wait">윷가락이 구르는 중…</div>
            ) : (
              <>
                <div
                  className={`yut-name ${again ? "yut-name-gold" : ""} ${
                    result === -1 ? "yut-name-back" : ""
                  }`}
                >
                  {THROW_NAME[result]}!
                </div>
                <div className="yut-sub">
                  {draw ? "높이 나온 쪽이 먼저 던져요" : `${THROW_STEP[result]} 옮겨요`}
                  {again && (
                    <>
                      <br />
                      <span className="yut-again">
                        {THROW_NAME[result]}이 나왔으니 한 번 더 던져요
                      </span>
                    </>
                  )}
                  {result === -1 && (
                    <>
                      <br />
                      {draw ? "백도는 선 뽑기에서 제일 낮아요" : "백도 가락만 배를 보였어요"}
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
        <div className="pop-foot">
          <button
            className="btn ev-btn"
            disabled={result === null}
            onClick={() => result !== null && onDone(result)}
          >
            {again ? "한 번 더 던지기" : "확인"}
          </button>
        </div>
      </div>
    </div>
  );
}
