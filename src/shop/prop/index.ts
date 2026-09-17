import { inCat } from "../list";
import plant from "./plant";
import rug from "./rug";
import pot from "./pot";
import cactus from "./cactus";
import books from "./books";
import tank from "./tank";
import vase from "./vase";

/*
  slot 이 top 인 것(작은 화분 · 선인장 · 책 더미 · 꽃병) 은 바닥이 아니라 책상·탁자·책장 위에 올린다.
  바닥 가구보다 **나중에 그려야** 책상 위에 올려도 책상 뒤로 숨지 않는다 (PetRoom 의 그리는 차례 참고).
*/
export default inCat("소품", [plant, rug, pot, cactus, books, tank, vase]);
