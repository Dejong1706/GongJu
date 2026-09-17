import { inCat } from "../list";
import bear from "./bear";
import bunny from "./bunny";
import unicorn from "./unicorn";

/* 인형은 판다와 같은 한 칸짜리 눈을 쓴다. 두 칸으로 키우면 주인공이 둘로 보인다 */
export default inCat("인형", [bear, bunny, unicorn]);
