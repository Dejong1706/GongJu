"use client";

import { useEffect, useRef } from "react";

const FOCUSABLE =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

/** 가운데 뜨는 픽셀 팝업. 딤 영역을 누르거나 Esc 를 누르면 닫힌다. */
export default function Popup({
  title,
  onClose,
  children,
  footer,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const before = document.activeElement as HTMLElement | null;
    // 팝업 자체에 초점을 준다. 입력칸에 주면 폰에서 자판이 바로 올라온다.
    box.current?.focus({ preventScroll: true });

    return () => before?.focus?.();
  }, []);

  const keys = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      onClose();
      return;
    }
    if (e.key !== "Tab") return;

    // 초점이 팝업 밖으로 새지 않게 앞뒤로 돌린다
    const items = [...(box.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [])];
    if (items.length === 0) return;
    const edge = e.shiftKey ? items[0] : items[items.length - 1];
    if (document.activeElement === edge) {
      e.preventDefault();
      (e.shiftKey ? items[items.length - 1] : items[0]).focus();
    }
  };

  return (
    <div
      className="dim"
      onKeyDown={keys}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="pop"
        ref={box}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
      >
        <div className="pop-head">
          <b className="text-[13px]">{title}</b>
          <button className="pop-x" onClick={onClose} aria-label="닫기">
            ✕
          </button>
        </div>
        <div className="pop-body">{children}</div>
        {footer && <div className="pop-foot">{footer}</div>}
      </div>
    </div>
  );
}
