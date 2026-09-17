/**
 * 판다 방 시안실 — 키우기 전용 시안 페이지 하나.
 *
 * 앱의 방(PetRoom) · 상점 칸(Good) · 미리보기(swatch) 를 그대로 가져다 쓴다.
 * 그래서 앱에서 그림을 고치면 여기서도 똑같이 바뀐다. 아직 상점에 안 넣은 것은 drafts.ts.
 * 만드는 법 · 올리는 법은 history.md "시안실" 참고.
 */
import { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import PetRoom, { fit } from "@/components/PetRoom";
import PixelSprite from "@/components/PixelSprite";
import { Good, swatch, withItem } from "@/components/PetView";
import {
  CAT_ROWS,
  FACINGS,
  FACING_NAME,
  FLOORS,
  ITEMS,
  WALLS,
  byPrice,
  canTurn,
  gradeOf,
  isWorn,
  turn,
  viewsOf,
  type Cat,
  type Facing,
  type Item,
  type Surface,
} from "@/shop";
import type { Pet } from "@/lib/types";
import { ROOM, SNAP } from "@/lib/pet";
import { DRAFT_FLOORS, DRAFT_ITEMS, DRAFT_NOTES, DRAFT_WALLS } from "./drafts";

ITEMS.push(...DRAFT_ITEMS);
WALLS.push(...DRAFT_WALLS);
FLOORS.push(...DRAFT_FLOORS);
const DRAFTS = new Set([...DRAFT_ITEMS, ...DRAFT_WALLS, ...DRAFT_FLOORS].map((d) => d.id));

/*
 * 방향 돌리기 — 앱의 PetRoom 은 아직 방향을 모른다 (다음 단계).
 * 그래서 방향마다 `bed~front` 같은 가짜 아이템을 만들어 두고, 방에 넘길 때 id 만 갈아 끼운다.
 * 그림은 상점 파일의 `views` 를 그대로 쓴다. 상점 칸에는 안 보이게 걸러낸다 (`~` 가 붙은 것)
 */
const faceOf = (it: Item) => it.face ?? "front";
ITEMS.filter(canTurn).forEach((base) => {
  FACINGS.forEach((f) => {
    const sprite = viewsOf(base)[f];
    if (sprite && f !== faceOf(base))
      ITEMS.push({ ...base, id: `${base.id}~${f}`, sprite, face: undefined, views: undefined, anim: undefined });
  });
});
const byId = (id: string) => ITEMS.find((i) => i.id === id);
const viewId = (id: string, f?: Facing) => {
  const it = byId(id);
  return it && f && f !== faceOf(it) && viewsOf(it)[f] ? `${id}~${f}` : id;
};
const baseId = (id: string) => id.split("~")[0];

// 처음 열면 빈 방 — 민무늬 벽 · 맨바닥 · 아무것도 안 놓고 안 입은 상태에서 하나씩 놓아본다
const START: Pet = { earned: 0, spent: 0, owned: [], worn: {}, spots: [], wall: "w0", floor: "f0" };

// 시안이 바뀌면 저장해둔 방을 버리고 빈 방으로 연다. 지난 시안이 방에 남아 새 것이 안 보이는 걸 막는다
const KEY = `pet-preview:7:${[...DRAFTS].join(",")}`;
function load(): { pet: Pet; cat: Cat; facing: Record<string, Facing> } {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? "null");
    if (raw?.pet?.spots) return { pet: { ...START, ...raw.pet }, cat: raw.cat ?? "벽지", facing: raw.facing ?? {} };
  } catch {}
  return { pet: START, cat: "벽지", facing: {} };
}

type Picked = { name: string; price: number; cat: Cat; tags: string[]; note?: string; size?: string };

function App() {
  const first = useMemo(load, []);
  const [pet, setPet] = useState<Pet>(first.pet);
  const [cat, setCat] = useState<Cat>(first.cat);
  const [editing, setEditing] = useState(false);
  const [locked, setLocked] = useState(false);
  const [onlyDrafts, setOnlyDrafts] = useState(false);
  const [picked, setPicked] = useState<Picked | null>(null);
  const [facing, setFacing] = useState<Record<string, Facing>>(first.facing);
  /** 옮기기 중 마지막으로 누른 가구. 방향 그림이 있으면 화살표가 뜬다 */
  const [sel, setSel] = useState<string | null>(null);
  const [arrowAt, setArrowAt] = useState<"side" | "tip">("side");

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify({ pet, cat, facing }));
    } catch {}
  }, [pet, cat, facing]);

  useEffect(() => {
    if (!editing) setSel(null);
  }, [editing]);

  const roomPet = useMemo(
    () => ({ ...pet, spots: pet.spots.map((sp) => ({ ...sp, id: viewId(sp.id, facing[sp.id]) })) }),
    [pet, facing]
  );

  /*
   * 90도씩 돌리기. dir 1 = 시계방향(위에서 봤을 때). 그림이 없는 방향은 건너뛴다.
   * 그림 크기가 바뀌므로 **발끝 가운데를 그대로 두고** 새 그림을 세운 뒤 fit() 으로 방 안에 가둔다
   */
  const rotate = (id: string, dir: 1 | -1) => {
    const base = byId(id);
    const sp = pet.spots.find((s) => s.id === id);
    if (!base || !sp) return;
    const next = turn(base, facing[id], dir);
    const from = byId(viewId(id, facing[id]))!;
    const to = byId(viewId(id, next))!;
    const at = fit(from, sp.x, sp.y);
    const [w0, h0] = [from.sprite.rows[0].length, from.sprite.rows.length];
    const [w1, h1] = [to.sprite.rows[0].length, to.sprite.rows.length];
    const snap = (v: number) => Math.round(v / SNAP) * SNAP;
    const f = fit(to, snap(at.x + (w0 - w1) / 2), snap(at.y + h0 - h1));
    setFacing((m) => ({ ...m, [id]: next }));
    setPet((p) => ({ ...p, spots: p.spots.map((s) => (s.id === id ? { id, x: f.x, y: f.y } : s)) }));
  };

  // 화살표를 띄울 가구 — 방향 그림이 있고 방에 나와 있을 때만
  // 누른 게 없으면 방에 있는 돌릴 수 있는 가구에 바로 띄운다 — 눌러야 뜨면 어디를 눌러야 하는지 모른다
  const turnable = (id: string) => !!byId(id) && canTurn(byId(id)!);
  const turnId = sel && turnable(sel) ? sel : pet.spots.find((s) => turnable(s.id))?.id ?? null;
  const selItem = turnId ? roomPet.spots.find((s) => baseId(s.id) === turnId) : undefined;
  const selBox = (() => {
    if (!selItem) return null;
    const it = ITEMS.find((i) => i.id === selItem.id);
    if (!it) return null;
    const at = fit(it, selItem.x, selItem.y);
    return { ...at, w: it.sprite.rows[0].length, h: it.sprite.rows.length, name: it.name };
  })();
  const arrows = (id: string) => (
    <>
      <button type="button" className="pv-turn" aria-label="왼쪽으로 돌리기" onClick={() => rotate(id, -1)}>
        ↺
      </button>
      <button type="button" className="pv-turn" aria-label="오른쪽으로 돌리기" onClick={() => rotate(id, 1)}>
        ↻
      </button>
    </>
  );

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

  return (
    <div className="pv">
      <header className="pv-head">
        <h1>판다 방 시안실</h1>
        <p>
          상점의 모든 것과 아직 안 넣은 <b>시안</b>을 눌러서 방에 놓아볼 수 있어요. 방 그림은 앱과 같은 코드예요.
        </p>
      </header>

      <div className="pv-body">
        <div className="pv-room">
          <div className="pet-stage">
            <PetRoom
              pet={roomPet}
              editing={editing}
              onMove={(vid, x, y) => {
                const id = baseId(vid);
                setSel(id);
                setPet((p) => ({ ...p, spots: p.spots.map((s) => (s.id === id ? { id, x, y } : s)) }));
              }}
            />
            {editing &&
              (arrowAt === "tip" && selBox && turnId ? (
                <p className="pet-tip pv-tip-turn">
                  <span>
                    {selBox.name} · {FACING_NAME[facing[turnId] ?? faceOf(byId(turnId)!)]}
                  </span>
                  {arrows(turnId)}
                </p>
              ) : (
                <p className="pet-tip">
                  {selBox
                    ? "가구를 눌러 고르고 ↺ ↻ 로 돌려보세요"
                    : "가구를 끌어서 옮겨보세요 · 가구나 인형을 꺼내면 돌릴 수 있어요"}
                </p>
              ))}
            {editing && arrowAt === "side" && selBox && turnId && (
              <div className="pv-turn-layer">
                <div
                  className="pv-turn-side"
                  style={{
                    left: `max(0px, calc(${(selBox.x / ROOM.w) * 100}% - 34px))`,
                    right: `max(0px, calc(${100 - ((selBox.x + selBox.w) / ROOM.w) * 100}% - 34px))`,
                    top: `${((selBox.y + selBox.h / 2) / ROOM.h) * 100}%`,
                  }}
                >
                  {arrows(turnId)}
                </div>
              </div>
            )}
            <button className={`pet-fix ${editing ? "pet-fix-on" : ""}`} type="button" onClick={() => setEditing((v) => !v)}>
              {editing ? "끝내기" : "옮기기"}
            </button>
          </div>
          <div className="pv-tools">
            <button
              type="button"
              onClick={() => {
                setPet(START);
                setFacing({});
              }}
            >
              방 비우기
            </button>
            <button type="button" className={arrowAt === "side" ? "on" : ""} onClick={() => setArrowAt("side")}>
              화살표 · 가구 옆
            </button>
            <button type="button" className={arrowAt === "tip" ? "on" : ""} onClick={() => setArrowAt("tip")}>
              화살표 · 안내 띠
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
              byPrice(ITEMS.filter((i) => i.cat === cat && keep(i.id) && !i.id.includes("~"))).map((it) =>
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
