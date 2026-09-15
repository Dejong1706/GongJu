"use client";

import { useMemo, useState } from "react";
import Popup from "./Popup";
import PixelSprite from "./PixelSprite";
import PetRoom from "./PetRoom";
import { COIN } from "@/lib/sprites";
import {
  CATS,
  FLOORS,
  ITEMS,
  WALLS,
  type Cat,
  type Item,
  type Surface,
} from "@/lib/pet";
import type { Pet } from "@/lib/types";

/** 벽지·타일 미리보기. 도트가 아니라 면이라 CSS 로 흉내 낸다. */
function swatch(s: Surface) {
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
  earned,
  onChange,
  onError,
}: {
  pet: Pet;
  earned: number;
  onChange: (next: Pet) => Promise<void>;
  onError: (msg: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [cat, setCat] = useState<Cat>("옷");
  const [msg, setMsg] = useState("");

  const left = Math.max(0, earned - pet.spent);
  const owns = useMemo(() => new Set(pet.owned), [pet.owned]);

  const save = (next: Pet, failed: string) => {
    onChange(next).catch(() => {
      setMsg(failed);
      onError(failed);
    });
  };

  /** 안 샀으면 사고, 샀으면 입었다 벗었다 한다 */
  const tapItem = (it: Item) => {
    setMsg("");
    if (!owns.has(it.id)) {
      if (left < it.price) {
        setMsg(`${it.price - left}점 더 모으면 살 수 있어요`);
        return;
      }
      save(
        {
          ...pet,
          spent: pet.spent + it.price,
          owned: [...pet.owned, it.id],
          ...equip(pet, it, true),
        },
        "사지 못했어요"
      );
      return;
    }
    const wearing =
      it.slot === "head" || it.slot === "body"
        ? pet.worn[it.slot] === it.id
        : pet.placed[it.slot] === it.id;
    save({ ...pet, ...equip(pet, it, !wearing) }, "바꾸지 못했어요");
  };

  const tapSurface = (s: Surface, kind: "wall" | "floor") => {
    setMsg("");
    const free = s.price === 0;
    if (!free && !owns.has(s.id)) {
      if (left < s.price) {
        setMsg(`${s.price - left}점 더 모으면 살 수 있어요`);
        return;
      }
      save(
        { ...pet, spent: pet.spent + s.price, owned: [...pet.owned, s.id], [kind]: s.id },
        "사지 못했어요"
      );
      return;
    }
    save({ ...pet, [kind]: s.id }, "바꾸지 못했어요");
  };

  return (
    <>
      <div className="pet-stage">
        <PetRoom pet={pet} />
        <button
          className="pet-shop"
          type="button"
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
          <div className="shop-cat">
            {CATS.map((c) => (
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

          <div className="shop-goods">
            {cat === "벽지" &&
              WALLS.map((w) => (
                <Good
                  key={w.id}
                  name={w.name}
                  price={w.price}
                  owned={w.price === 0 || owns.has(w.id)}
                  active={pet.wall === w.id}
                  onTap={() => tapSurface(w, "wall")}
                >
                  {swatch(w)}
                </Good>
              ))}

            {cat === "타일" &&
              FLOORS.map((f) => (
                <Good
                  key={f.id}
                  name={f.name}
                  price={f.price}
                  owned={f.price === 0 || owns.has(f.id)}
                  active={pet.floor === f.id}
                  onTap={() => tapSurface(f, "floor")}
                >
                  {swatch(f)}
                </Good>
              ))}

            {(cat === "옷" || cat === "기타") &&
              ITEMS.filter((i) => i.cat === cat).map((it) => (
                <Good
                  key={it.id}
                  name={it.name}
                  price={it.price}
                  owned={owns.has(it.id)}
                  active={
                    it.slot === "head" || it.slot === "body"
                      ? pet.worn[it.slot] === it.id
                      : pet.placed[it.slot] === it.id
                  }
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
    </>
  );
}

function Good({
  name,
  price,
  owned,
  active,
  onTap,
  children,
}: {
  name: string;
  price: number;
  owned: boolean;
  active: boolean;
  onTap: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      className={`good ${active ? "good-on" : ""} ${owned ? "" : "good-buy"}`}
      aria-pressed={active}
      onClick={onTap}
    >
      <span className="good-thumb">{children}</span>
      <span className="good-name">{name}</span>
      <span className="good-price">
        {owned ? (active ? "쓰는 중" : "가진 것") : price === 0 ? "기본" : `${price}점`}
      </span>
    </button>
  );
}

/** 같은 자리는 하나만 걸친다 */
function equip(pet: Pet, it: Item, on: boolean): Partial<Pet> {
  if (it.slot === "head" || it.slot === "body") {
    return { worn: { ...pet.worn, [it.slot]: on ? it.id : null } };
  }
  return { placed: { ...pet.placed, [it.slot]: on ? it.id : null } };
}
