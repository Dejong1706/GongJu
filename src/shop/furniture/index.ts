import { inCat } from "../list";
import desk from "./desk";
import bed from "./bed";
import desk2 from "./desk2";
import table from "./table";
import shelf from "./shelf";
import lamp from "./lamp";
import canopy from "./canopy";
import vanity from "./vanity";
import throne from "./throne";
import royalBed from "./royal_bed";
import irworobongdo from "./irworobongdo";
import jagae from "./jagae";
import bandaji from "./bandaji";
import soban from "./soban";

/*
  같은 책상이라도 모양이 달라야 고르는 재미가 있다. 전부 흰색이고,
  상판 아래 한 줄을 테두리색으로 깔아 두께를 낸다 — 이게 없으면 판자 한 장으로 보인다.
*/
export default inCat("가구", [
  desk, bed, desk2, table, shelf, lamp, canopy, vanity, throne, royalBed,
  // 조선 세트
  irworobongdo, jagae, bandaji, soban,
]);
