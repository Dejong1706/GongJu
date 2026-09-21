import type { Facing } from "@/shop";
import type { Throw, YutSide } from "./yut";

export type TabKey = "cal" | "lec" | "tt" | "toeic" | "panda" | "event";

export type Course = {
  id: string;
  name: string;
  short: string;
  color: string;
  days: number[]; // 0=일 ~ 6=토
  start: string; // "HH:MM"
  end: string; // "HH:MM"
  building: string; // 건물 이름
  room: string; // 강의실 번호
};

export type SchoolEvent = {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  color: string;
};

export type TaskKind = "강의" | "과제" | "할일";

export type Task = {
  id: string;
  kind: TaskKind;
  /** 과목. **할일은 비어 있다** — 수업과 상관없는 일이라 과목을 안 고른다 */
  courseId: string;
  title: string;
  date: string; // YYYY-MM-DD
  done: boolean;
  /**
   * 체크할 때 실제로 준 점수와 그 날. 풀거나 지울 때 이만큼만 되돌려받는다.
   * 하루 한도를 넘겨 체크한 것은 0 이다. 이 규칙 전에 체크한 것에는 없다
   */
  paid?: number;
  paidDay?: string;
};

export type Word = {
  id: string;
  en: string;
  ko: string;
  createdAt: number; // ms
};

/** 저장할 때는 id 가 없다 (Firestore 가 만들어준다) */
export type NewEvent = Omit<SchoolEvent, "id">;
export type NewTask = Omit<Task, "id">;

/** 판다 방의 상태. users/{uid}/pet/state 문서 하나에 통째로 들어간다. */
/**
 * 방에 꺼내놓은 소품 하나.
 * face 는 바라보는 쪽 — **없으면 그 아이템의 기본 방향**(지금 그림). 방향이 생기기 전에 놓은 가구에는 없다.
 * Firestore 는 undefined 를 못 쓰므로 face 는 **돌렸을 때만 붙이고** 옮길 때는 `...spot` 으로 들고 간다
 */
export type Spot = { id: string; x: number; y: number; face?: Facing };

export type Pet = {
  /** 지금까지 번 포인트. 스티커를 붙이고 뗄 때 그만큼 더하고 뺀다 */
  earned: number;
  /** 지금까지 쓴 포인트 */
  spent: number;
  /** 산 것들의 id */
  owned: string[];
  /** 몸에 걸친 것 — 자리마다 하나씩 */
  worn: { head?: string | null; body?: string | null; back?: string | null };
  /**
   * 방에 꺼내놓은 소품과 그 자리. 목록에 있으면 방에 있는 것이고, 빼면 치운 것이다.
   * 맵이 아니라 배열인 건 Firestore 때문이다 — merge 로 쓰면 맵은 키가 안 지워진다.
   */
  spots: Spot[];
  wall: string;
  floor: string;
  /*
   * 하루에 몇 번까지만 주는 것들의 기록.
   * 다른 값과 달리 **날짜가 바뀌면 처음부터**라서, 언제 줬는지를 같이 들고 있어야 한다.
   */
  /** 강의·과제 체크로 점수를 준 날과 그 날 준 횟수 */
  taskDay?: string;
  taskCount?: number;
  /** 토익 퀴즈 점수를 준 날 (YYYY-MM-DD) */
  quizDay?: string;
  /** 타이머 점수를 준 날과 그 날 준 횟수 */
  focusDay?: string;
  focusCount?: number;
};
/**
 * 윷놀이 이벤트. **문서 하나**에 판이 통째로 들어간다 — users/{uid}/event/yut
 * 한 계정으로 둘이 번갈아 하므로 "누구 차례인지" 도 여기 들어 있다.
 * 이벤트가 끝나면 이 타입과 화면을 통째로 지운다 (문서는 남겨둬도 그만이다).
 */
export type YutGame = {
  /**
   * 판이 열려 있는지. **꺼져 있으면 판이 어둡게 덮이고 가운데 "게임 시작" 만 뜬다.**
   * 이긴 창을 닫으면 다시 여기로 돌아온다
   */
  playing: boolean;
  /**
   * 선 뽑기. **시작을 누르면 여기가 열리고**, 둘이 한 번씩 던져 높은 쪽이 선이 된다.
   * 같으면 둘 다 비우고 다시 던진다. 판이 열리면 null 로 돌아간다
   */
  first?: { a: Throw | null; b: Throw | null } | null;
  /** 지금 던질 쪽 */
  turn: YutSide;
  /** 편마다 말 셋. -1 대기 · 20 골(다 났다) · 30~32 참먹이 · 그 밖은 밭 번호 */
  horses: { a: number[]; b: number[] };
  /** 던져놓고 아직 안 쓴 값 */
  rolls: Throw[];
  /** 던질 기회가 남았는지. 윷 · 모가 나오거나 잡으면 다시 선다 */
  pending: boolean;
  /**
   * **이번 차례에** 던진 값 — 화면의 "던진 윷" 칸에 쌓이고, 차례가 넘어가면 비운다.
   * 한 폰으로 둘이 번갈아 던지다 보니 둘의 기록이 섞여 보여서 지금 던지는 쪽 것만 남긴다
   * (9/22 사용자 요청 — 지난 차례 기록은 볼 일이 없다)
   */
  log: Throw[];
  wins: { a: number; b: number };
  /** 판이 끝났으면 이긴 쪽 */
  winner?: YutSide | null;
  /** 몇 판째인지. 포인트를 두 번 주지 않으려고 같이 본다 */
  round: number;
  /** 정연(b) 이 이 이벤트에서 받은 포인트 합 */
  paid: number;
  /** 포인트를 이미 준 판 번호 — 같은 판에 두 번 주지 않는다 */
  paidRound?: number;
};
