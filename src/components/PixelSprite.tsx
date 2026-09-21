import type { Sprite } from "@/lib/sprites";

/**
 * 도트 배열을 <rect> 로 찍어준다.
 * 한 장을 여러 겹으로 겹쳐 쓰는 곳(Splash 의 당근 게이지) 때문에 svg 와 따로 뒀다.
 */
export function spriteCells(sprite: Sprite) {
  return sprite.rows.map((row, y) =>
    [...row].map((ch, x) => {
      const fill = sprite.palette[ch];
      if (!fill) return null;
      return <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={fill} />;
    })
  );
}

/** 도트 배열을 SVG <rect> 로 찍어준다. 확대해도 흐려지지 않는다. */
export default function PixelSprite({
  sprite,
  className,
}: {
  sprite: Sprite;
  className?: string;
}) {
  const w = sprite.rows[0].length;
  const h = sprite.rows.length;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" shapeRendering="crispEdges" className={className}>
      {spriteCells(sprite)}
    </svg>
  );
}
