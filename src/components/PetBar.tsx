"use client";

import PixelSprite from "./PixelSprite";
import { PANDA } from "@/lib/sprites";

/*
 * 키우기 화면 맨 위 조작줄 — 스티커 · 상점 · 옮기기.
 *
 * 예전에는 상점 · 옮기기가 **방 위에 떠 있었다.** 방 앞바닥 두 모서리를 가려서
 * 그 자리에 가구를 둘 수 없었다 (9/21 사용자 지적). 방 위에는 아무것도 얹지 않는다 —
 * 가구 돌리기 화살표만 예외다 (집은 가구 옆에 붙어야 해서).
 *
 * 스티커 · 상점은 **여는 것**, 옮기기는 **켜는 것**이라 성격이 다르다.
 * 셋을 글자만으로 늘어놓으면 탭처럼 보여서, 앞에 작은 그림을 붙이고
 * 옮기기만 켜졌을 때 분홍으로 남는다 (`aria-pressed`).
 */
export default function PetBar({
  onSticker,
  onShop,
  editing = false,
  onEdit,
}: {
  onSticker: () => void;
  /** 방을 아직 못 불러왔으면 없다 — 그동안에도 스티커는 붙일 수 있어야 한다 */
  onShop?: () => void;
  editing?: boolean;
  onEdit?: () => void;
}) {
  return (
    <div className="pet-bar">
      <button type="button" onClick={onSticker}>
        <span className="pet-bar-ic">
          <PixelSprite sprite={PANDA} />
        </span>
        스티커
      </button>

      <button type="button" onClick={onShop} disabled={!onShop || editing}>
        <span className="pet-bar-ic">
          <Cart />
        </span>
        상점
      </button>

      <button
        type="button"
        className={editing ? "pet-bar-on" : ""}
        aria-pressed={editing}
        onClick={onEdit}
        disabled={!onEdit}
      >
        <span className="pet-bar-ic">
          <Move />
        </span>
        {editing ? "끝내기" : "옮기기"}
      </button>
    </div>
  );
}

const Cart = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="9" cy="20" r="1.4" />
    <circle cx="19" cy="20" r="1.4" />
    <path d="M2 3h3l2.4 12a1.8 1.8 0 0 0 1.8 1.4h9a1.8 1.8 0 0 0 1.8-1.4L22 7H6" />
  </svg>
);

/** 사방 화살표 — 끌어서 옮긴다는 뜻 */
const Move = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 3v18M3 12h18M12 3 9 6M12 3l3 3M12 21l-3-3M12 21l3-3M3 12l3-3M3 12l3 3M21 12l-3-3M21 12l-3 3" />
  </svg>
);
