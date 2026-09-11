"use client";

/** 가운데 뜨는 픽셀 팝업. 딤 영역을 누르면 닫힌다. */
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
  return (
    <div
      className="dim"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="pop">
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
