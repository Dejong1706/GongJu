/**
 * 윷놀이 시안 페이지 한 장 만들기 → tools/yut-preview/out/index.html
 *
 *   node tools/yut-preview/build.mjs
 *
 * 앱 코드(EventView · YutBoard · YutThrow · lib/yut) 를 esbuild 로 묶어 HTML 한 장에 넣는다.
 * CSS 는 앱의 globals.css 에서 @tailwind 줄만 빼고 그대로 쓰고, preview.css 를 덧붙인다.
 * 올리는 건 Artifact 도구로 — 주소는 history.md "시안" 에 있다. **새 주소로 올리지 말 것**
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..", "..");
const out = join(here, "out");
mkdirSync(out, { recursive: true });

const js = join(out, "app.js");
execFileSync(
  process.platform === "win32" ? "npx.cmd" : "npx",
  [
    "--yes", "esbuild@0.28.2",
    join(here, "App.tsx"),
    "--bundle", "--minify", "--format=iife", "--jsx=automatic",
    `--inject:${join(here, "..", "pet-preview", "env-shim.js")}`,
    `--tsconfig=${join(root, "tsconfig.json")}`,
    `--outfile=${js}`,
  ],
  { cwd: root, stdio: "inherit", shell: process.platform === "win32" }
);

/*
 * CSS 는 **앱과 똑같이 Tailwind 를 태워서** 만든다.
 * 예전에는 globals.css 에서 @tailwind 줄만 빼고 썼는데, 그러면 Tailwind 유틸(스티커 격자 같은) 이 빠져서
 * 앱 화면을 통째로 넣는 폰 화면 시안이 무너졌다. 무엇을 쓸지는 tailwind.config.ts 의 content 가 정한다
 */
const twCss = join(out, "app.css");
execFileSync(
  join(root, "node_modules", ".bin", process.platform === "win32" ? "tailwindcss.cmd" : "tailwindcss"),
  ["-c", join(root, "tailwind.config.ts"), "-i", join(root, "src", "app", "globals.css"), "-o", twCss, "--minify"],
  { cwd: root, stdio: "inherit", shell: process.platform === "win32" }
);

const appCss = readFileSync(twCss, "utf8")
  // 아티팩트는 Google Fonts 말고는 스타일시트를 못 불러온다 (막히면 조용히 빈다). 아래에서 박아 넣는다
  .replace(/@font-face\s*{[^}]*}/g, "");

/*
 * 앱 글꼴(갈무리) 을 **base64 로 박아 넣는다** (0.5MB · 한도는 16MB).
 * 이게 없으면 시안이 기본 글꼴로 나와서 폰에서 본 앱과 달라 보인다.
 * 한 번 받으면 out/ 에 두고 다시 쓴다
 */
const woff = join(out, "Galmuri11.woff2");
if (!existsSync(woff)) {
  const res = await fetch("https://cdn.jsdelivr.net/npm/galmuri/dist/Galmuri11.woff2");
  if (!res.ok) throw new Error("글꼴을 못 받았습니다 — " + res.status);
  writeFileSync(woff, Buffer.from(await res.arrayBuffer()));
}
const face =
  '@font-face{font-family:"Galmuri11";font-display:swap;src:url(data:font/woff2;base64,' +
  readFileSync(woff).toString("base64") +
  ') format("woff2")}';

const css = face + appCss + "\n" + readFileSync(join(here, "preview.css"), "utf8");
// </script> 가 묶음 안에 있으면 HTML 이 거기서 끊긴다
const code = readFileSync(js, "utf8").replace(/<\/script/gi, "<\\/script");

const html = `<title>윷놀이 이벤트 탭</title>
<style>${css}</style>
<div id="root"></div>
<script>${code}</script>
`;
writeFileSync(join(out, "index.html"), html);
console.log(`ok · ${(html.length / 1024).toFixed(0)}KB → ${join(out, "index.html")}`);
