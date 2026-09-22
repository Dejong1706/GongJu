/**
 * 판다 방 시안실 — 키우기 전용 시안 페이지 하나.
 *
 * 앱의 방(PetRoom) · 상점 칸(Good) · 미리보기(swatch) 를 그대로 가져다 쓴다.
 * 그래서 앱에서 그림을 고치면 여기서도 똑같이 바뀐다. 아직 상점에 안 넣은 것은 drafts.ts.
 * 만드는 법 · 올리는 법은 history.md "시안실" 참고.
 */
import { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import PetRoom, { turnSpot } from "@/components/PetRoom";
import TurnArrows, { turnLabel, turnTarget } from "@/components/TurnArrows";
import PixelSprite from "@/components/PixelSprite";
import PandaView from "@/components/PandaView";
import PetBar from "@/components/PetBar";
import TabBar from "@/components/TabBar";
import { Good, swatch, withItem } from "@/components/PetView";
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
  type Item,
  type Surface,
} from "@/shop";
import type { Pet } from "@/lib/types";
import { DRAFT_FLOORS, DRAFT_ITEMS, DRAFT_NOTES, DRAFT_WALLS } from "./drafts";

ITEMS.push(...DRAFT_ITEMS);
WALLS.push(...DRAFT_WALLS);
FLOORS.push(...DRAFT_FLOORS);
const DRAFTS = new Set([...DRAFT_ITEMS, ...DRAFT_WALLS, ...DRAFT_FLOORS].map((d) => d.id));

// 처음 열면 빈 방 — 민무늬 벽 · 맨바닥 · 아무것도 안 놓고 안 입은 상태에서 하나씩 놓아본다
const START: Pet = { earned: 0, spent: 0, owned: [], worn: {}, spots: [], wall: "w0", floor: "f0" };

// 시안이 바뀌면 저장해둔 방을 버리고 빈 방으로 연다. 지난 시안이 방에 남아 새 것이 안 보이는 걸 막는다
const KEY = `pet-preview:8:${[...DRAFTS].join(",")}`;
function load(): { pet: Pet; cat: Cat } {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? "null");
    if (raw?.pet?.spots) return { pet: { ...START, ...raw.pet }, cat: raw.cat ?? "벽지" };
  } catch {}
  return { pet: START, cat: "벽지" };
}

type Picked = { name: string; price: number; cat: Cat; tags: string[]; note?: string; size?: string };

function App() {
  const first = useMemo(load, []);
  const [pet, setPet] = useState<Pet>(first.pet);
  const [cat, setCat] = useState<Cat>(first.cat);
  const [editing, setEditing] = useState(false);
  const [locked, setLocked] = useState(false);
  const [onlyDrafts, setOnlyDrafts] = useState(false);
  /** 폰 화면 시안 — 앱 껍데기 안에 키우기 화면을 통째로 넣어 본다 (조작줄 자리 보기) */
  const [phone, setPhone] = useState(false);
  const [stickers, setStickers] = useState<number[]>([]);
  const today = useMemo(() => new Date(), []);
  const [cursor, setCursor] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [picked, setPicked] = useState<Picked | null>(null);
  /** 옮기기 중 마지막으로 누른 가구. 방향 그림이 있으면 화살표가 뜬다 */
  const [sel, setSel] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify({ pet, cat }));
    } catch {}
  }, [pet, cat]);

  useEffect(() => {
    if (!editing) setSel(null);
  }, [editing]);

  /* 돌리기 — 앱과 같은 방식. 방향은 자리(spot) 의 face 에 저장하고, 방은 그 방향 그림으로 그린다 */
  const rotate = (id: string, dir: 1 | -1) => {
    const it = itemById(id);
    if (!it) return;
    setPet((p) => ({ ...p, spots: p.spots.map((s) => (s.id === id ? turnSpot(it, s, dir) : s)) }));
  };

  const turning = editing ? turnTarget(pet.spots, sel) : undefined;

  const tagsOf = (x: { id: string; price: number }, it?: Item) =>
    [
      DRAFTS.has(x.id) ? "시안" : "상점에 있음",
      { normal: "", gold: "골드", premium: "프리미엄" }[gradeOf(x.price)],
      it?.anim ? "움직여요" : "",
      it?.slot === "back" ? "등 자리" : "",
      it?.slot === "head" ? "머리" : it?.slot === "body" ? "몸" : "",
    ].filter(Boolean);

  const isOut = (it: Item) =>
    isWorn(it) ? pet.worn[it.slot] === it.id : pet.spots.some((s) => s.id === it.id);

  const tapItem = (it: Item) => {
    setPet((p) => ({ ...p, ...withItem(p, it, !isOut(it)) }));
    setPicked({
      name: it.name,
      price: it.price,
      cat: it.cat,
      tags: tagsOf(it, it),
      note: DRAFT_NOTES[it.id],
      size: `${it.sprite.rows[0].length} x ${it.sprite.rows.length}칸`,
    });
  };
  const tapSurface = (s: Surface, kind: "wall" | "floor") => {
    setPet((p) => ({ ...p, [kind]: s.id }));
    setPicked({ name: s.name, price: s.price, cat: kind === "wall" ? "벽지" : "바닥", tags: tagsOf(s), note: DRAFT_NOTES[s.id] });
  };

  const keep = (id: string) => !onlyDrafts || DRAFTS.has(id);
  const draftCount = (c: Cat) =>
    c === "벽지" ? DRAFT_WALLS.length : c === "바닥" ? DRAFT_FLOORS.length : DRAFT_ITEMS.filter((d) => d.cat === c).length;

  const cell = (id: string, node: React.ReactNode) => (
    <div key={id} className={`pv-cell ${DRAFTS.has(id) ? "pv-draft" : ""}`}>
      {node}
      {DRAFTS.has(id) && <span className="pv-draft-tag">시안</span>}
    </div>
  );

  /*
   * 폰 화면 시안 — **앱 껍데기(.device) 안에 진짜 PandaView 를 넣는다.**
   * 조작줄(스티커 · 상점 · 옮기기) 자리와 "스크롤 없이 한 화면에 들어가나" 를 폰에서 바로 본다.
   * 방은 위 시안실과 같은 `pet` 을 쓰므로, 칸을 눌러 꾸민 방이 그대로 폰 화면에도 나온다.
   * 포인트는 값을 크게 줘서 상점을 다 열어본다 (시안실에는 점수가 없다)
   */
  const phoneView = (
    <div className="pv-phone">
      <div className="device">
        <div className="island" />
        <header className="appbar">
          <div className="sprinkle" />
          <div className="flex flex-col">
            <button type="button" className="guide-btn">가이드</button>
            <h1 className="font-pixel text-[17px] leading-[1.4] text-white relative [text-shadow:2px_2px_0_var(--pink-deep)]">
              정연공듀
            </h1>
          </div>
          <div className="relative text-right leading-[1.5]">
            <div className="text-[11px]">
              {today.getMonth() + 1}월 {today.getDate()}일
              <br />
              시안
            </div>
          </div>
        </header>
        <div className="edge edge-down" />
        <div className="scroll">
          <PandaView
            stickers={stickers}
            onToggleSticker={async (d) =>
              setStickers((v) => (v.includes(d) ? v.filter((x) => x !== d) : [...v, d]))
            }
            today={today}
            cursor={cursor}
            onMoveMonth={(diff) => setCursor((c) => new Date(c.getFullYear(), c.getMonth() + diff, 1))}
            pet={{ ...pet, earned: 999999 }}
            petError={false}
            onChangePet={async (next) => setPet({ ...next, earned: 0 })}
          />
        </div>
        <div className="edge edge-up" />
        <TabBar tab="panda" onChange={() => {}} onLocked={() => {}} eventLocked />
      </div>
    </div>
  );

  return (
    <div className="pv">
      <header className="pv-head">
        <h1>판다 방 시안실</h1>
        <p>
          상점의 모든 것과 아직 안 넣은 <b>시안</b>을 눌러서 방에 놓아볼 수 있어요. 방 그림은 앱과 같은 코드예요.
        </p>
      </header>

      {phone && phoneView}

      <div className="pv-body">
        <div className="pv-room">
          {/* 앱과 같은 조작줄. 시안실에는 스티커 · 상점이 따로 있어서 옮기기만 켠다 */}
          <PetBar onSticker={() => setPhone(true)} editing={editing} onEdit={() => setEditing((v) => !v)} />
          <div className="pet-stage">
            <PetRoom
              pet={pet}
              editing={editing}
              onMove={(id, x, y) => {
                setSel(id);
                setPet((p) => ({ ...p, spots: p.spots.map((s) => (s.id === id ? { ...s, x, y } : s)) }));
              }}
            />
            {turning && <TurnArrows spot={turning} onTurn={(dir) => rotate(turning.id, dir)} />}
          </div>
          {editing && (
            <p className="pet-tip">
              {turning ? `끌어서 옮기고 ↺ ↻ 로 돌려요 · ${turnLabel(turning)}` : "가구를 끌어서 옮겨보세요"}
            </p>
          )}
          <div className="pv-tools">
            <button type="button" onClick={() => setPet(START)}>
              방 비우기
            </button>
          </div>
          <div className="pv-picked" aria-live="polite">
            {picked ? (
              <>
                <div className="pv-picked-top">
                  <b>{picked.name}</b>
                  <span className="pv-price">{picked.price === 0 ? "기본" : `${picked.price.toLocaleString()}점`}</span>
                </div>
                <div className="pv-tags">
                  <span>{picked.cat}</span>
                  {picked.size && <span>{picked.size}</span>}
                  {picked.tags.map((t) => (
                    <span key={t} className={t === "시안" ? "on-draft" : t === "프리미엄" ? "on-premium" : t === "골드" ? "on-gold" : ""}>
                      {t}
                    </span>
                  ))}
                </div>
                {picked.note && <p>{picked.note}</p>}
              </>
            ) : (
              <p>아래 칸을 누르면 방에 놓이고, 여기에 설명이 떠요.</p>
            )}
          </div>
        </div>

        <div className="pv-shop">
          <div className="pv-switches">
            <label>
              <input id="only-drafts" type="checkbox" checked={onlyDrafts} onChange={(e) => setOnlyDrafts(e.target.checked)} />
              시안만 보기
            </label>
            <label>
              <input id="locked" type="checkbox" checked={locked} onChange={(e) => setLocked(e.target.checked)} />
              안 산 모양으로 보기
            </label>
            <label>
              <input id="phone" type="checkbox" checked={phone} onChange={(e) => setPhone(e.target.checked)} />
              폰 화면으로 보기
            </label>
          </div>

          <div className="shop-cats">
            {CAT_ROWS.map((row) => (
              <div key={row[0]} className="shop-cat" style={{ gridTemplateColumns: `repeat(${row.length}, 1fr)` }}>
                {row.map((c) => (
                  <button key={c} type="button" className={cat === c ? "on" : ""} aria-pressed={cat === c} onClick={() => setCat(c)}>
                    {c}
                    {draftCount(c) > 0 && <i className="pv-dot" aria-label={`시안 ${draftCount(c)}개`} />}
                  </button>
                ))}
              </div>
            ))}
          </div>

          <div className="pv-goods">
            {cat === "벽지" &&
              byPrice(WALLS.filter((w) => keep(w.id))).map((w) =>
                cell(
                  w.id,
                  <Good name={w.name} price={w.price} owned={!locked || w.price === 0} active={pet.wall === w.id} grade={gradeOf(w.price)} onTap={() => tapSurface(w, "wall")}>
                    {swatch(w)}
                  </Good>
                )
              )}
            {cat === "바닥" &&
              byPrice(FLOORS.filter((f) => keep(f.id))).map((f) =>
                cell(
                  f.id,
                  <Good name={f.name} price={f.price} owned={!locked || f.price === 0} active={pet.floor === f.id} grade={gradeOf(f.price)} onTap={() => tapSurface(f, "floor")}>
                    {swatch(f)}
                  </Good>
                )
              )}
            {cat !== "벽지" &&
              cat !== "바닥" &&
              byPrice(ITEMS.filter((i) => i.cat === cat && keep(i.id))).map((it) =>
                cell(
                  it.id,
                  <Good
                    name={it.name}
                    price={it.price}
                    owned={!locked}
                    active={isOut(it)}
                    activeLabel={isWorn(it) ? "장착 중" : "꺼내놓음"}
                    grade={gradeOf(it.price)}
                    onTap={() => tapItem(it)}
                  >
                    <span className="shop-dot">
                      <PixelSprite sprite={it.sprite} />
                    </span>
                  </Good>
                )
              )}
          </div>
          {onlyDrafts && draftCount(cat) === 0 && <p className="pv-empty">이 칸에는 시안이 없어요.</p>}
        </div>
      </div>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
