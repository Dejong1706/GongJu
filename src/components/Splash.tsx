import PixelSprite, { spriteCells } from "@/components/PixelSprite";
import { BUNNY, CARROT_EMPTY, CARROT_FILL } from "@/lib/sprites";

/**
 * 불러오는 동안 보이는 화면. 토끼 · "잠깐만" · 당근 게이지.
 *
 * 앱이 뜨기 전(page.tsx 의 dynamic loading) 과 로그인을 확인하는 동안(AppRoot) 둘 다 이걸 쓴다.
 * 그래서 **Firebase 를 건드리는 것은 하나도 import 하지 않는다.**
 */
export default function Splash() {
  return (
    <div className="device">
      <div className="island" />
      <div className="flex-1 flex flex-col items-center justify-center gap-3">
        <div className="bunny w-[100px]">
          <PixelSprite sprite={BUNNY} />
        </div>
        <p className="loading-wait" aria-label="잠깐만">
          <span>잠</span>
          <span>깐</span>
          <span>만</span>
        </p>
        <CarrotGauge />
      </div>
    </div>
  );
}

const CARROT_W = CARROT_EMPTY.rows[0].length;
const CARROT_H = CARROT_EMPTY.rows.length;

/**
 * 당근 게이지. 테두리와 꼭지는 처음부터 다 보이고 속만 왼쪽부터 찬다.
 *
 * **차오르는 속도는 연출이다.** 얼마나 남았는지는 알 수 없어서, 다 차면 도로 비우고 다시 찬다.
 * 대개는 다 차기 전에 앱이 떠서 이 화면이 사라진다.
 * 자르는 폭은 globals.css 의 `carrot-fill` 이 옮긴다 (칸 수는 sprites.ts 의 CARROT_ROWS 참고).
 */
function CarrotGauge() {
  return (
    <svg
      viewBox={`0 0 ${CARROT_W} ${CARROT_H}`}
      width="100%"
      shapeRendering="crispEdges"
      className="carrot-gauge"
      role="img"
      aria-label="불러오는 중"
    >
      <defs>
        <clipPath id="carrot-clip">
          <rect className="carrot-clip" x={0} y={0} width={6} height={CARROT_H} />
        </clipPath>
      </defs>
      {spriteCells(CARROT_EMPTY)}
      <g clipPath="url(#carrot-clip)">{spriteCells(CARROT_FILL)}</g>
    </svg>
  );
}
