"use client";

import { useMemo, useState } from "react";
import Popup from "./Popup";
import PixelSprite from "./PixelSprite";
import PetRoom from "./PetRoom";
import { COIN } from "@/lib/sprites";
import {
  CAT_ROWS,
  FLOORS,
  ITEMS,
  WALLS,
  byPrice,
  gradeOf,
  isWorn,
  itemById,
  type Cat,
  type Grade,
  type Item,
  type Surface,
} from "@/shop";
import type { Pet } from "@/lib/types";

/** 벽지·바닥 미리보기. 도트가 아니라 면이라 CSS 로 흉내 낸다. */
export function swatch(s: Surface) {
  const style: React.CSSProperties = { background: s.base };
  if (s.kind === "dot") {
    style.backgroundImage = `radial-gradient(${s.accent} 1.6px, transparent 1.7px)`;
    style.backgroundSize = "8px 8px";
  } else if (s.kind === "stripe") {
    style.backgroundImage = `repeating-linear-gradient(90deg,${s.accent} 0 2px,transparent 2px 8px)`;
  } else if (s.kind === "plank") {
    style.backgroundImage = `repeating-linear-gradient(180deg,${s.accent} 0 1px,transparent 1px 6px)`;
  } else if (s.kind === "check") {
    style.backgroundImage = `conic-gradient(${s.accent} 25%,transparent 0 50%,${s.accent} 0 75%,transparent 0)`;
    style.backgroundSize = "12px 12px";
  } else if (s.kind === "grid") {
    style.backgroundImage =
      `repeating-linear-gradient(90deg,${s.accent} 0 1px,transparent 1px 8px),` +
      `repeating-linear-gradient(180deg,${s.accent} 0 1px,transparent 1px 8px)`;
  } else if (s.kind === "panel") {
    style.backgroundImage =
      `linear-gradient(180deg,transparent 0 55%,${s.accent} 55% 100%),` +
      `repeating-linear-gradient(90deg,transparent 0 6px,${s.accent} 6px 7px)`;
  } else if (s.kind === "flower") {
    style.backgroundImage =
      `radial-gradient(${s.accent2 ?? s.accent} 1px,transparent 1.2px),` +
      `radial-gradient(${s.accent} 2.4px,transparent 2.6px)`;
    style.backgroundSize = "10px 10px";
  } else if (s.kind === "parquet") {
    style.backgroundImage =
      `repeating-linear-gradient(90deg,${s.accent} 0 1px,transparent 1px 7px),` +
      `repeating-linear-gradient(180deg,${s.accent} 0 1px,transparent 1px 7px)`;
    style.backgroundSize = "14px 14px";
  } else if (s.kind === "goldstripe") {
    // 넓은 띠 + 가장자리 금실, 아래 금줄 몰딩
    style.backgroundImage =
      `linear-gradient(180deg,transparent 0 66%,${s.accent} 66% 69%,transparent 69%),` +
      `repeating-linear-gradient(90deg,${s.accent} 0 1px,${s.accent2} 1px 6px,${s.accent} 6px 7px,transparent 7px 12px)`;
  } else if (s.kind === "flowertile") {
    // 금 줄눈 타일 + 칸 가운데 분홍 꽃
    style.backgroundImage =
      `linear-gradient(${s.accent} 0 1px,transparent 1px),` +
      `linear-gradient(90deg,${s.accent} 0 1px,transparent 1px),` +
      `radial-gradient(${s.accent2} 1.6px,transparent 2px)`;
    style.backgroundSize = "10px 10px";
    style.backgroundPosition = "0 0, 0 0, 5px 5px";
  } else if (s.kind === "palace") {
    // 위 진홍 띠 · 크림 바탕 금 마름모 · 아래 금줄 진홍 벽널 — 왕실 카펫과 한 벌
    style.backgroundImage =
      `linear-gradient(180deg,${s.accent2} 0 10%,${s.accent} 10% 14%,transparent 14% 62%,` +
      `${s.accent} 62% 66%,${s.accent2} 66% 100%),` +
      `radial-gradient(${s.accent} 1.2px,transparent 1.6px)`;
    style.backgroundSize = "100% 100%, 10px 10px";
    style.backgroundPosition = "0 0, 0 2px";
  } else if (s.kind === "royal") {
    // 크림 바닥 가운데 금테 빨간 카펫
    style.backgroundImage =
      `linear-gradient(90deg,transparent 0 22%,${s.accent2} 22% 28%,${s.accent} 28% 72%,` +
      `${s.accent2} 72% 78%,transparent 78%)`;
  }
  return <span className="shop-swatch" style={style} />;
}

function Purse({ n }: { n: number }) {
  return (
    <span className="purse">
      <span className="purse-coin">
        <PixelSprite sprite={COIN} />
      </span>
      {n}
    </span>
  );
}

export default function PetView({
  pet,
  onChange,
  onError,
}: {
  pet: Pet;
  onChange: (next: Pet) => Promise<void>;
  onError: (msg: string) => void;
}) {
  const [open, setOpen] = useState(false);
  // 가구를 옮기는 동안에는 상점을 닫아두고 판다도 세워둔다
  const [editing, setEditing] = useState(false);
  const [cat, setCat] = useState<Cat>("옷");
  const [msg, setMsg] = useState("");
  /* 살 때는 반드시 한 번 묻는다. 제일 비싼 게 1,000점이라 잘못 눌러 날리면 아프다 */
  const [ask, setAsk] = useState<Ask | null>(null);
  const [short, setShort] = useState<Short | null>(null);

  /*
   * 사고 나서 스티커를 떼거나 체크를 풀면 음수가 된다. 0 으로 가리지 않고 그대로 보여준다 —
   * 가리면 "풀어도 안 깎이고, 다시 붙여도 안 늘어난다" 로 보여서 새는 것처럼 보인다.
   * 빚은 실제로 남아 있어서, 다시 벌어 0 을 넘겨야 살 수 있다
   */
  const left = pet.earned - pet.spent;
  const owns = useMemo(() => new Set(pet.owned), [pet.owned]);

  const save = (next: Pet, failed: string) => {
    onChange(next).catch(() => {
      setMsg(failed);
      onError(failed);
    });
  };

  /** 지금 입고 있거나 방에 나와 있는지 */
  const isOut = (it: Item) =>
    isWorn(it) ? pet.worn[it.slot] === it.id : pet.spots.some((s) => s.id === it.id);

  /** 안 샀으면 사고(묻고 나서), 샀으면 입었다 벗었다 · 꺼냈다 치웠다 한다 */
  const tapItem = (it: Item) => {
    setMsg("");
    if (!owns.has(it.id)) {
      if (left < it.price) {
        setShort({ price: it.price });
        return;
      }
      setAsk({
        name: it.name,
        price: it.price,
        buy: () =>
          save(
            {
              ...pet,
              spent: pet.spent + it.price,
              owned: [...pet.owned, it.id],
              ...withItem(pet, it, true),
            },
            "사지 못했어요"
          ),
      });
      return;
    }
    save({ ...pet, ...withItem(pet, it, !isOut(it)) }, "바꾸지 못했어요");
  };

  /** 끌어다 놓은 자리를 저장한다. 끌고 있는 동안이 아니라 손을 뗐을 때 한 번만 쓴다 */
  const moveItem = (id: string, x: number, y: number) =>
    save(
      { ...pet, spots: pet.spots.map((s) => (s.id === id ? { id, x, y } : s)) },
      "자리를 옮기지 못했어요"
    );

  const tapSurface = (s: Surface, kind: "wall" | "floor") => {
    setMsg("");
    const free = s.price === 0;
    if (!free && !owns.has(s.id)) {
      if (left < s.price) {
        setShort({ price: s.price });
        return;
      }
      setAsk({
        name: s.name,
        price: s.price,
        buy: () =>
          save(
            { ...pet, spent: pet.spent + s.price, owned: [...pet.owned, s.id], [kind]: s.id },
            "사지 못했어요"
          ),
      });
      return;
    }
    save({ ...pet, [kind]: s.id }, "바꾸지 못했어요");
  };

  return (
    <>
      <div className="pet-stage">
        <PetRoom pet={pet} editing={editing} onMove={moveItem} />

        {editing && <p className="pet-tip">가구를 끌어서 옮겨보세요</p>}

        <button
          className={`pet-fix ${editing ? "pet-fix-on" : ""}`}
          type="button"
          aria-pressed={editing}
          onClick={() => {
            setEditing((v) => !v);
            setMsg("");
          }}
        >
          {editing ? "끝내기" : "옮기기"}
        </button>

        <button
          className="pet-shop"
          type="button"
          hidden={editing}
          onClick={() => {
            setOpen(true);
            setMsg("");
          }}
          aria-label="상점 열기"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#3A2230"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="9" cy="20" r="1.4" />
            <circle cx="19" cy="20" r="1.4" />
            <path d="M2 3h3l2.4 12a1.8 1.8 0 0 0 1.8 1.4h9a1.8 1.8 0 0 0 1.8-1.4L22 7H6" />
          </svg>
        </button>
      </div>

      {open && (
        <Popup title="상점" onClose={() => setOpen(false)} headLeft={<Purse n={left} />}>
          <div className="shop-cats">
            {CAT_ROWS.map((row) => (
              <div key={row[0]} className="shop-cat" style={{ gridTemplateColumns: `repeat(${row.length}, 1fr)` }}>
                {row.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={cat === c ? "on" : ""}
                    aria-pressed={cat === c}
                    onClick={() => {
                      setCat(c);
                      setMsg("");
                    }}
                  >
                    {c}
                  </button>
                ))}
              </div>
            ))}
          </div>

          <div className="shop-goods">
            {cat === "벽지" &&
              byPrice(WALLS).map((w) => (
                <Good
                  key={w.id}
                  name={w.name}
                  price={w.price}
                  owned={w.price === 0 || owns.has(w.id)}
                  active={pet.wall === w.id}
                  grade={gradeOf(w.price)}
                  onTap={() => tapSurface(w, "wall")}
                >
                  {swatch(w)}
                </Good>
              ))}

            {cat === "바닥" &&
              byPrice(FLOORS).map((f) => (
                <Good
                  key={f.id}
                  name={f.name}
                  price={f.price}
                  owned={f.price === 0 || owns.has(f.id)}
                  active={pet.floor === f.id}
                  grade={gradeOf(f.price)}
                  onTap={() => tapSurface(f, "floor")}
                >
                  {swatch(f)}
                </Good>
              ))}

            {cat !== "벽지" && cat !== "바닥" &&
              byPrice(ITEMS.filter((i) => i.cat === cat)).map((it) => (
                <Good
                  key={it.id}
                  name={it.name}
                  price={it.price}
                  owned={owns.has(it.id)}
                  active={isOut(it)}
                  activeLabel={isWorn(it) ? "장착 중" : "꺼내놓음"}
                  grade={gradeOf(it.price)}
                  onTap={() => tapItem(it)}
                >
                  <span className="shop-dot">
                    <PixelSprite sprite={it.sprite} />
                  </span>
                </Good>
              ))}
          </div>

          <div className="empty text-center min-h-[26px]">{msg}</div>
        </Popup>
      )}

      {ask && (
        <Popup
          title="구매"
          onClose={() => setAsk(null)}
          footer={
            <div className="buy-keys">
              <button
                className="btn"
                onClick={() => {
                  ask.buy();
                  setAsk(null);
                }}
              >
                확인
              </button>
              <button className="btn btn-ghost" onClick={() => setAsk(null)}>
                취소
              </button>
            </div>
          }
        >
          <p className="buy-ask">
            <b>{ask.name}</b>
            {particle(ask.name)} 구매하시겠습니까?
          </p>
        </Popup>
      )}

      {short && (
        <Popup
          title="포인트 부족"
          onClose={() => setShort(null)}
          footer={
            <button className="btn" onClick={() => setShort(null)}>
              확인
            </button>
          }
        >
          <p className="buy-ask">
            <b>{short.price - left}포인트</b>가 모자랍니다
          </p>
        </Popup>
      )}
    </>
  );
}

/** 이름 끝에 받침이 있으면 "을", 없으면 "를" */
function particle(name: string) {
  const code = name.charCodeAt(name.length - 1);
  if (code < 0xac00 || code > 0xd7a3) return "을(를)";
  return (code - 0xac00) % 28 === 0 ? "를" : "을";
}

/** 살지 물어볼 것 — 누를 때 값을 붙잡아 둔다 */
type Ask = { name: string; price: number; buy: () => void };
/** 못 사는 이유를 보여줄 것 — 얼마가 모자란지만 센다 */
type Short = { price: number };

/** 아직 안 산 칸에 붙는 자물쇠 */
function Lock() {
  return (
    <svg className="good-lock" width="13" height="13" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8 11V7a4 4 0 0 1 8 0v4" fill="none" stroke="#6E3D57" strokeWidth="2.5" />
      <rect x="4" y="10" width="16" height="11" rx="1.5" fill="#6E3D57" />
    </svg>
  );
}

export function Good({
  name,
  price,
  owned,
  active,
  activeLabel = "장착 중",
  grade = "normal",
  onTap,
  children,
}: {
  name: string;
  price: number;
  owned: boolean;
  active: boolean;
  activeLabel?: string;
  /**
   * 골드 — 금테 · 왕관 표 · 스치는 빛. 프리미엄 — 보라 바탕 · 보석 표 · 반짝이는 별.
   * 둘 다 안 산 칸도 회색으로 죽이지 않는다
   */
  grade?: Grade;
  onTap: () => void;
  children: React.ReactNode;
}) {
  const label = !owned
    ? `${price.toLocaleString()}점`
    : active
    ? activeLabel
    : price === 0
    ? "기본"
    : "가진 것";

  return (
    <button
      type="button"
      className={`good ${active ? "good-on" : ""} ${owned ? "" : "good-buy"} ${grade !== "normal" ? `good-${grade}` : ""}`}
      aria-pressed={active}
      aria-label={`${grade === "premium" ? "프리미엄 " : grade === "gold" ? "골드 " : ""}${name} · ${owned ? label : `${price}점, 아직 없음`}`}
      onClick={onTap}
    >
      {grade === "premium" ? (
        <span className="good-crown" aria-hidden="true">
          {/* 보석 — 보라 다이아에 흰 빛 한 점 */}
          <svg width="11" height="10" viewBox="0 0 11 10" shapeRendering="crispEdges">
            <path d="M3 0h5l3 3-5.5 7L0 3z" fill="#F4D77A" />
            <path d="M3 1h5l2 2-4.5 5.5L1 3z" fill="#A45CE0" />
            <rect x="3" y="2" width="2" height="1" fill="#FFFFFF" />
          </svg>
        </span>
      ) : grade === "gold" && (
        <span className="good-crown" aria-hidden="true">
          <svg width="13" height="9" viewBox="0 0 13 9" shapeRendering="crispEdges">
            <path d="M0 2h2v2h2V1h2v-1h1v1h2v3h2V2h2v7H0z" fill="#E3B85C" />
            <rect x="6" y="5" width="1" height="2" fill="#FF6FA8" />
          </svg>
        </span>
      )}
      {!owned && <Lock />}
      <span className="good-thumb">{children}</span>
      <span className="good-name">{name}</span>
      <span className="good-price">{label}</span>
    </button>
  );
}

/** 같은 자리는 하나만 걸친다 */
/**
 * 입는 것은 자리마다 하나, 방에 두는 것은 목록에 넣고 빼는 것으로 끝난다.
 * 창문처럼 `only` 표를 단 것끼리는 하나만 걸린다 — 일곱 종이 다 같은 창문 자리라서다.
 */
export function withItem(pet: Pet, it: Item, on: boolean): Partial<Pet> {
  if (isWorn(it)) return { worn: { ...pet.worn, [it.slot]: on ? it.id : null } };
  const rest = pet.spots.filter(
    (s) => s.id !== it.id && !(on && it.only && itemById(s.id)?.only === it.only)
  );
  return { spots: on ? [...rest, { id: it.id, x: it.at[0], y: it.at[1] }] : rest };
}
