// esbuild --inject 로 넣는다. React 가 production 으로 돌게 하는 것뿐 —
// --define 으로 넘기면 윈도 셸이 따옴표를 먹어서 문자열이 아니라 이름이 돼버렸다
export const process = { env: { NODE_ENV: "production" } };
