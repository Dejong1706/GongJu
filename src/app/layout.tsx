import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "정연공듀",
  description: "학교 일정 · 강의 · 토익을 한 곳에서",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // 확대는 막지 않는다. 입력칸 글씨가 16px 라서 폰에서 저절로 커지지도 않는다.
  viewportFit: "cover",
  themeColor: "#FFD9E8",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap"
          rel="stylesheet"
        />
        <link href="https://cdn.jsdelivr.net/npm/galmuri/dist/galmuri.css" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
