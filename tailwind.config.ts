import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: "#FFF6FA",
        band: "#FFD9E8",
        "band-dark": "#F7B8D2",
        pink: "#FF8FBC",
        "pink-deep": "#E2648F",
        mint: "#9EDCC4",
        ink: "#6E3D57",
        "ink-soft": "#A9789A",
        line: "#F0C4DA",
      },
      fontFamily: {
        pixel: ["Galmuri11", "DungGeunMo", "monospace"],
        display: ["'Press Start 2P'", "monospace"],
      },
    },
  },
  plugins: [],
} satisfies Config;
