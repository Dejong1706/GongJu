import { inCat } from "../list";
import clock from "./clock";
import frame from "./frame";
import winMorn from "./win_morn";
import winDay from "./win_day";
import winEve from "./win_eve";
import winSnow from "./win_snow";
import winSakura from "./win_sakura";
import winTree from "./win_tree";
import winFlower from "./win_flower";
import winNight from "./win_night";
import winPalace from "./win_palace";
import winBalcony from "./win_balcony";
import banner from "./banner";

/* 창문은 전부 `only: "win"` — 창문 자리가 하나라 한 번에 하나만 걸린다 */
export default inCat("벽 장식", [
  clock, frame,
  winMorn, winDay, winEve, winSnow, winSakura, winTree, winFlower, winNight, winPalace, winBalcony,
  banner,
]);
