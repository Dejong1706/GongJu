import type { ItemDef } from "../types";

const crown: ItemDef = {
  id: "crown",
  name: "왕관",
  slot: "head",
  price: 600,
  at: [3, -2],
  // 귀 사이 정수리에 얹는다. 가운데 분홍 보석, 양옆 하늘 보석
  sprite: {
    rows: ["Y...YY...Y", "YY.YYYY.YY", "YYYYYYYYYY", "YJYYPPYYJY", "yyyyyyyyyy"],
    palette: { Y: "#FFD34D", y: "#E5A93A", P: "#FF6FA8", J: "#7FC8F0" },
  },
};
export default crown;
