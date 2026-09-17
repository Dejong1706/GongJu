import { inCat } from "../list";
import hat from "./hat";
import bowPink from "./bow_pink";
import bowSky from "./bow_sky";
import overall from "./overall";
import crown from "./crown";
import wings from "./wings";
import hwagwan from "./hwagwan";
import gat from "./gat";

/**
 * 드레스는 판다 몸이 네 줄뿐이라 느낌이 안 살아서 뺐다 — 입는 건 몸 밖으로 뻗어야 산다.
 * 값은 세 가지를 봤다 — 방이 얼마나 달라지는지, 도트를 얼마나 그렸는지,
 * 그리고 처음 살 것이 있는지. 리본이 제일 싼 건 사흘이면 첫 구매가 되게 하려는 것.
 */
export default inCat("옷", [hat, bowPink, bowSky, overall, crown, wings, hwagwan, gat]);
