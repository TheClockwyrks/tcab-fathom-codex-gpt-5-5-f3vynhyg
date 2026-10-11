import type {
  Game,
  InitApi,
  RenderApi,
  UpdateApi,
} from "@clockwyrks/simple-2d";
import type { DeepReadonly } from "ts-essentials";
import {
  ACTIONS,
  ALERT_TIME,
  BINDINGS,
  BRIGHT_HALFLIFE,
  BRIGHT_HOLD,
  BRIGHT_PER_EAT,
  CUES,
  DEN_ORDER,
  DEN_RELEASE_GAP,
  DIVE_LABEL,
  DRIFTER_INTERVAL,
  DRIFTER_MAX,
  DRIFTER_SPEED,
  FLARE_BLOOM,
  FLARE_CHARGE,
  FLARE_INTERVAL,
  FLARE_RADIUS,
  FORAGER_SPEED,
  FATHOM_DEBUG_VERSION,
  GAMEOVER_ITEMS,
  GLOAMFIN_CHASE_SPEED,
  GLOAMFIN_CORNER_SPEED,
  GLOAMFIN_GIVEUP,
  GLOAMFIN_HEAR,
  GLOAMFIN_PING_INTERVAL,
  GLOAMFIN_PING_MIN_GAP,
  GLOAMFIN_PING_RANGE,
  GLOAMFIN_RAMP_TIME,
  GLOAMFIN_SEARCH_DELAY,
  GLOAMFIN_SEARCH_ROAM,
  GRID_COLS,
  GRID_ORIGIN_X,
  GRID_ORIGIN_Y,
  GRID_ROWS,
  INK_COOLDOWN,
  INK_LIFE,
  INK_RADIUS,
  KINDLE_VISION_GAIN,
  KINDLE_VISION_MIN,
  LANTERN_RANGE_BASE,
  LANTERN_RANGE_GAIN,
  LINGER_TIME,
  PAUSE_ITEMS,
  PLANKTON_DOT,
  PREDATOR_SPEED,
  ROSTER_ADD_ORDER,
  ROSTER_CAP,
  ROSTER_CAP_DEPTH,
  SCORE_CLEAR,
  SCORE_DRIFTER,
  SCORE_PLANKTON,
  SONAR_COOLDOWN,
  SONAR_MARK_TIME,
  SONAR_RANGE_BASE,
  SONAR_RANGE_MIN,
  SONAR_WAVE_SPEED,
  STAGE_H,
  STAGE_W,
  START_LIVES,
  TAGLINE_TEXT,
  TILE,
  TICK_DT,
  TITLE_ITEMS,
  TITLE_TEXT,
  VISION_GAIN,
  VISION_MIN,
} from "./constants";
import type { ActionName, PredatorKind } from "./constants";

export const BACKGROUND = "#031018";

type Direction = "up" | "down" | "left" | "right";
type Screen =
  | "title"
  | "howto"
  | "countdown"
  | "playing"
  | "paused"
  | "cleared"
  | "gameover";
type PredatorState = "den" | "wander" | "chase" | "search";
type TileChar = "#" | "." | "g" | "d";
type VisibilityChar = "u" | "r" | "l";
type PulseSource = "forager" | "gloamfin";
type PulseTint = "cyan" | "violet" | "orange";

interface Assets {
  readonly glimmerfin: readonly ImageBitmap[];
  readonly drifter: readonly ImageBitmap[];
  readonly lanternjaw: readonly ImageBitmap[];
  readonly gloamfin: readonly ImageBitmap[];
  readonly flarefish: readonly ImageBitmap[];
  readonly flareBloom: readonly ImageBitmap[];
  readonly trenchWalls: readonly ImageBitmap[];
}

export interface GridInfo {
  cols: number;
  rows: number;
  tile: number;
  originX: number;
  originY: number;
}

export interface ForagerState {
  x: number;
  y: number;
  tx: number;
  ty: number;
  dir: Direction;
  moving: boolean;
}

export interface DrifterState {
  x: number;
  y: number;
  tx: number;
  ty: number;
  dir: Direction;
  lit: boolean;
  mind: boolean;
  travel: boolean;
}

export interface PredatorSnapshot {
  kind: PredatorKind;
  x: number;
  y: number;
  tx: number;
  ty: number;
  dir: Direction;
  state: PredatorState;
  released: boolean;
  mind: boolean;
  travel: boolean;
  speed: number;
  alert: boolean;
  lit: boolean;
  detectRange: number | null;
  hearingRange: number | null;
  hearingLock: boolean | null;
  flareCharging: boolean | null;
  flaring: boolean | null;
  flareRadius: number | null;
}

interface PredatorStateData extends PredatorSnapshot {
  fix: { tx: number; ty: number } | null;
  releaseAt: number;
  alertTimer: number;
  linger: number;
  pingTimer: number;
  pingGap: number;
  chaseSpeed: number;
  searchTimer: number;
  searchPinged: boolean;
  flareTimer: number;
  flareCharge: number;
  flareBloom: number;
  sonarMark: number;
}

export interface PulseState {
  source: PulseSource;
  tint: PulseTint;
  ox: number;
  oy: number;
  front: number;
  range: number;
  caught: readonly string[];
}

export interface InkCloudState {
  x: number;
  y: number;
  radius: number;
  remaining: number;
}

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface FathomSnapshot {
  version: 1;
  screen: Screen;
  menuIndex: number | null;
  titleIndex: number;
  depth: number;
  score: number;
  lives: number;
  muted: boolean;
  planktonRemaining: number;
  drifterIn: number;
  brightness: number;
  brightHold: number;
  visionRadius: number;
  windowRadius: number;
  sonar: { ready: boolean; cooldown: number; range: number };
  ink: { ready: boolean; cooldown: number };
  grid: GridInfo;
  tiles: readonly string[];
  plankton: readonly string[];
  visibility: readonly string[];
  forager: ForagerState;
  drifters: readonly Omit<DrifterState, "dir">[];
  predators: readonly PredatorSnapshot[];
  pulses: readonly Omit<PulseState, "caught">[];
  inkClouds: readonly InkCloudState[];
  simTime: number;
}

export interface FathomState extends FathomSnapshot {
  assets: Assets;
  accumulator: number;
  desiredDir: Direction;
  countdown: number;
  clearedTimer: number;
  playTime: number;
  rng: number;
  start: { tx: number; ty: number };
  pointerDownItem: number | null;
  predators: readonly PredatorStateData[];
  drifters: readonly DrifterState[];
  pulses: readonly PulseState[];
}

export interface FathomDebugApi {
  version: number;
  reset(state: DeepReadonly<FathomState>): FathomState;
  snapshot(state: DeepReadonly<FathomState>): FathomSnapshot;
  reconcile(state: DeepReadonly<FathomState>): FathomState;
  setScreen(state: DeepReadonly<FathomState>, screen: Screen): FathomState;
  setMenuIndex(state: DeepReadonly<FathomState>, index: number): FathomState;
  setTitleIndex(state: DeepReadonly<FathomState>, index: number): FathomState;
  menuItemRect(state: DeepReadonly<FathomState>, index: number): Rect | null;
  setScore(state: DeepReadonly<FathomState>, points: number): FathomState;
  setLives(state: DeepReadonly<FathomState>, n: number): FathomState;
  setDepth(state: DeepReadonly<FathomState>, depth: number): FathomState;
  setMaze(
    state: DeepReadonly<FathomState>,
    rows: readonly string[],
  ): FathomState;
  setPlankton(
    state: DeepReadonly<FathomState>,
    tx: number,
    ty: number,
    present: boolean,
  ): FathomState;
  clearPlankton(state: DeepReadonly<FathomState>): FathomState;
  clearFog(state: DeepReadonly<FathomState>): FathomState;
  setForagerTile(
    state: DeepReadonly<FathomState>,
    tx: number,
    ty: number,
  ): FathomState;
  setForagerDir(state: DeepReadonly<FathomState>, dir: Direction): FathomState;
  setBrightness(state: DeepReadonly<FathomState>, g: number): FathomState;
  setBrightHold(state: DeepReadonly<FathomState>, seconds: number): FathomState;
  clearPredators(state: DeepReadonly<FathomState>): FathomState;
  addPredator(
    state: DeepReadonly<FathomState>,
    kind: PredatorKind,
    tx: number,
    ty: number,
  ): FathomState;
  setPredatorTile(
    state: DeepReadonly<FathomState>,
    index: number,
    tx: number,
    ty: number,
  ): FathomState;
  setPredatorDir(
    state: DeepReadonly<FathomState>,
    index: number,
    dir: Direction,
  ): FathomState;
  setPredatorState(
    state: DeepReadonly<FathomState>,
    index: number,
    value: "den" | "wander" | "chase",
  ): FathomState;
  setPredatorReleased(
    state: DeepReadonly<FathomState>,
    index: number,
    released: boolean,
  ): FathomState;
  setPredatorMind(
    state: DeepReadonly<FathomState>,
    index: number,
    enabled: boolean,
  ): FathomState;
  setPredatorTravel(
    state: DeepReadonly<FathomState>,
    index: number,
    enabled: boolean,
  ): FathomState;
  spawnDrifter(
    state: DeepReadonly<FathomState>,
    tx: number,
    ty: number,
  ): FathomState;
  clearDrifters(state: DeepReadonly<FathomState>): FathomState;
  setDrifterMind(
    state: DeepReadonly<FathomState>,
    index: number,
    enabled: boolean,
  ): FathomState;
  setDrifterTravel(
    state: DeepReadonly<FathomState>,
    index: number,
    enabled: boolean,
  ): FathomState;
  setDrifterIn(state: DeepReadonly<FathomState>, seconds: number): FathomState;
  setSonarCooldown(
    state: DeepReadonly<FathomState>,
    seconds: number,
  ): FathomState;
  setInkCooldown(
    state: DeepReadonly<FathomState>,
    seconds: number,
  ): FathomState;
}

const GRID: GridInfo = {
  cols: GRID_COLS,
  rows: GRID_ROWS,
  tile: TILE,
  originX: GRID_ORIGIN_X,
  originY: GRID_ORIGIN_Y,
};
const COUNTDOWN_TIME = 2;
const CLEARED_TIME = 2;
const DIRS: readonly Direction[] = ["up", "down", "left", "right"];
const DIR_VEC: Readonly<Record<Direction, { dx: number; dy: number }>> = {
  up: { dx: 0, dy: -1 },
  down: { dx: 0, dy: 1 },
  left: { dx: -1, dy: 0 },
  right: { dx: 1, dy: 0 },
};
const OPPOSITE: Readonly<Record<Direction, Direction>> = {
  up: "down",
  down: "up",
  left: "right",
  right: "left",
};

function center(tx: number, ty: number): { x: number; y: number } {
  return {
    x: GRID_ORIGIN_X + tx * TILE + TILE / 2,
    y: GRID_ORIGIN_Y + ty * TILE + TILE / 2,
  };
}

function tileOf(x: number, y: number): { tx: number; ty: number } {
  return {
    tx: Math.max(
      0,
      Math.min(GRID_COLS - 1, Math.floor((x - GRID_ORIGIN_X) / TILE)),
    ),
    ty: Math.max(
      0,
      Math.min(GRID_ROWS - 1, Math.floor((y - GRID_ORIGIN_Y) / TILE)),
    ),
  };
}

function rowSet(row: string, tx: number, ch: string): string {
  return `${row.slice(0, tx)}${ch}${row.slice(tx + 1)}`;
}

function get(rows: readonly string[], tx: number, ty: number): string {
  if (ty < 0 || ty >= GRID_ROWS) return "#";
  if (tx < 0) return rows[ty]?.[GRID_COLS - 1] === "." ? "." : "#";
  if (tx >= GRID_COLS) return rows[ty]?.[0] === "." ? "." : "#";
  return rows[ty]?.[tx] ?? "#";
}

function isCorridor(rows: readonly string[], tx: number, ty: number): boolean {
  return get(rows, tx, ty) === ".";
}

function isPredOpen(rows: readonly string[], tx: number, ty: number): boolean {
  const ch = get(rows, tx, ty);
  return ch === "." || ch === "g" || ch === "d";
}

function canMove(
  rows: readonly string[],
  tx: number,
  ty: number,
  dir: Direction,
  predator: boolean,
): boolean {
  const n = neighbor(rows, tx, ty, dir);
  return predator ? isPredOpen(rows, n.tx, n.ty) : isCorridor(rows, n.tx, n.ty);
}

function neighbor(
  rows: readonly string[],
  tx: number,
  ty: number,
  dir: Direction,
): { tx: number; ty: number } {
  const v = DIR_VEC[dir];
  let nx = tx + v.dx;
  const ny = ty + v.dy;
  if (
    nx < 0 &&
    get(rows, 0, ty) === "." &&
    get(rows, GRID_COLS - 1, ty) === "."
  )
    nx = GRID_COLS - 1;
  if (
    nx >= GRID_COLS &&
    get(rows, 0, ty) === "." &&
    get(rows, GRID_COLS - 1, ty) === "."
  )
    nx = 0;
  return { tx: nx, ty: ny };
}

function dist(
  a: { x: number; y: number },
  b: { x: number; y: number },
): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function rand(seed: number): [number, number] {
  const next = (seed * 1664525 + 1013904223) >>> 0;
  return [next / 0x100000000, next];
}

function choose<T>(seed: number, values: readonly T[]): [T, number] {
  const [r, next] = rand(seed);
  return [values[Math.floor(r * values.length)] ?? values[0], next];
}

function mapRows(
  rows: readonly string[],
  fn: (ch: string, tx: number, ty: number) => string,
): string[] {
  return rows.map((row, ty) =>
    [...row].map((ch, tx) => fn(ch, tx, ty)).join(""),
  );
}

function makeMaze(): string[] {
  const rows = Array.from({ length: GRID_ROWS }, () => "#".repeat(GRID_COLS));
  for (const y of [1, 3, 5, 11, 13, 15]) {
    for (let x = 1; x < GRID_COLS - 1; x += 1)
      rows[y] = rowSet(rows[y], x, ".");
  }
  for (const x of [1, 5, 9, 13, 17, 21, 25, 29, 34]) {
    for (let y = 1; y < GRID_ROWS - 1; y += 1)
      rows[y] = rowSet(rows[y], x, ".");
  }
  const wrapY = 15;
  rows[wrapY] = rowSet(rows[wrapY], 0, ".");
  rows[wrapY] = rowSet(rows[wrapY], GRID_COLS - 1, ".");
  for (let y = 6; y <= 10; y += 1) {
    for (let x = 15; x <= 20; x += 1) rows[y] = rowSet(rows[y], x, "#");
  }
  for (let y = 7; y <= 9; y += 1) {
    for (let x = 16; x <= 19; x += 1) rows[y] = rowSet(rows[y], x, "d");
  }
  rows[6] = rowSet(rows[6], 17, "g");
  rows[5] = rowSet(rows[5], 17, ".");
  rows[15] = rowSet(rows[15], 17, ".");
  return rows;
}

function makePlankton(tiles: readonly string[]): string[] {
  return mapRows(tiles, (ch) => (ch === "." ? "*" : "-"));
}

function countChar(rows: readonly string[], ch: string): number {
  return rows.reduce(
    (n, row) => n + [...row].filter((c) => c === ch).length,
    0,
  );
}

function sonarRange(depth: number): number {
  return Math.max(SONAR_RANGE_MIN, SONAR_RANGE_BASE - (depth - 1));
}

function visionRadius(g: number): number {
  return VISION_MIN + VISION_GAIN * g;
}

function windowRadius(g: number): number {
  return KINDLE_VISION_MIN + KINDLE_VISION_GAIN * g;
}

function detectRange(g: number): number {
  return LANTERN_RANGE_BASE + LANTERN_RANGE_GAIN * g;
}

function speedOf(predator: DeepReadonly<PredatorStateData>): number {
  if (predator.state === "den") return predator.travel ? PREDATOR_SPEED : 0;
  if (predator.kind === "lanternjaw")
    return predator.state === "chase" ? PREDATOR_SPEED : DRIFTER_SPEED;
  if (predator.kind === "gloamfin")
    return predator.state === "chase" ? predator.chaseSpeed : PREDATOR_SPEED;
  return PREDATOR_SPEED;
}

function rosterKinds(depth: number): PredatorKind[] {
  const kinds: PredatorKind[] = [...DEN_ORDER];
  const additions =
    depth >= ROSTER_CAP_DEPTH
      ? ROSTER_CAP * 3 - DEN_ORDER.length
      : Math.max(0, depth - 1);
  for (let i = 0; i < additions; i += 1) {
    kinds.push(ROSTER_ADD_ORDER[i % ROSTER_ADD_ORDER.length] ?? "gloamfin");
  }
  return kinds;
}

function makePredator(kind: PredatorKind, index: number): PredatorStateData {
  const denTiles = [
    { tx: 16, ty: 8 },
    { tx: 17, ty: 8 },
    { tx: 18, ty: 8 },
    { tx: 19, ty: 8 },
    { tx: 16, ty: 9 },
    { tx: 19, ty: 9 },
  ];
  const tile = denTiles[index % denTiles.length] ?? { tx: 17, ty: 8 };
  const p = center(tile.tx, tile.ty);
  return reconcilePredator({
    kind,
    x: p.x,
    y: p.y,
    tx: tile.tx,
    ty: tile.ty,
    dir: "up",
    state: "den",
    released: false,
    mind: true,
    travel: true,
    speed: 0,
    alert: false,
    lit: false,
    detectRange: kind === "gloamfin" ? null : LANTERN_RANGE_BASE,
    hearingRange: kind === "gloamfin" ? GLOAMFIN_HEAR : null,
    hearingLock: kind === "gloamfin" ? false : null,
    flareCharging: kind === "flarefish" ? false : null,
    flaring: kind === "flarefish" ? false : null,
    flareRadius: kind === "flarefish" ? 0 : null,
    fix: null,
    releaseAt: index * DEN_RELEASE_GAP,
    alertTimer: 0,
    linger: 0,
    pingTimer: GLOAMFIN_PING_INTERVAL,
    pingGap: 0,
    chaseSpeed: GLOAMFIN_CHASE_SPEED,
    searchTimer: 0,
    searchPinged: false,
    flareTimer: FLARE_INTERVAL,
    flareCharge: 0,
    flareBloom: 0,
    sonarMark: 0,
  });
}

function reconcilePredator(
  p: PredatorStateData,
  brightness = 0,
): PredatorStateData {
  const tile = tileOf(p.x, p.y);
  const charging = p.kind === "flarefish" ? p.flareCharge > 0 : null;
  const flaring = p.kind === "flarefish" ? p.flareBloom > 0 : null;
  return {
    ...p,
    tx: tile.tx,
    ty: tile.ty,
    speed: speedOf(p),
    alert: p.alertTimer > 0,
    detectRange: p.kind === "gloamfin" ? null : detectRange(brightness),
    hearingRange: p.kind === "gloamfin" ? GLOAMFIN_HEAR : null,
    hearingLock: p.kind === "gloamfin" ? p.hearingLock === true : null,
    flareCharging: charging,
    flaring,
    flareRadius: p.kind === "flarefish" ? (flaring ? FLARE_RADIUS : 0) : null,
  };
}

function baseState(
  assets: Assets,
  muted: boolean,
  titleIndex = 0,
): FathomState {
  const tiles = makeMaze();
  const plankton = makePlankton(tiles);
  const start = { tx: 17, ty: 15 };
  const p = center(start.tx, start.ty);
  const brightness = 0;
  return {
    version: 1,
    screen: "title",
    menuIndex: titleIndex,
    titleIndex,
    depth: 1,
    score: 0,
    lives: START_LIVES,
    muted,
    planktonRemaining: countChar(plankton, "*"),
    drifterIn: DRIFTER_INTERVAL,
    brightness,
    brightHold: 0,
    visionRadius: visionRadius(brightness),
    windowRadius: windowRadius(brightness),
    sonar: { ready: true, cooldown: 0, range: sonarRange(1) },
    ink: { ready: true, cooldown: 0 },
    grid: GRID,
    tiles,
    plankton,
    visibility: mapRows(tiles, () => "u"),
    forager: {
      x: p.x,
      y: p.y,
      tx: start.tx,
      ty: start.ty,
      dir: "left",
      moving: false,
    },
    drifters: [],
    predators: rosterKinds(1).map(makePredator),
    pulses: [],
    inkClouds: [],
    simTime: 0,
    assets,
    accumulator: 0,
    desiredDir: "left",
    countdown: COUNTDOWN_TIME,
    clearedTimer: CLEARED_TIME,
    playTime: 0,
    rng: 0xdecafbad,
    start,
    pointerDownItem: null,
  };
}

function withDerived(state: FathomState): FathomState {
  const foragerTile = tileOf(state.forager.x, state.forager.y);
  return {
    ...state,
    planktonRemaining: countChar(state.plankton, "*"),
    visionRadius: visionRadius(state.brightness),
    windowRadius: windowRadius(state.brightness),
    sonar: {
      cooldown: Math.max(0, state.sonar.cooldown),
      ready: state.sonar.cooldown <= 0,
      range: sonarRange(state.depth),
    },
    ink: {
      cooldown: Math.max(0, state.ink.cooldown),
      ready: state.ink.cooldown <= 0,
    },
    forager: { ...state.forager, tx: foragerTile.tx, ty: foragerTile.ty },
    predators: state.predators.map((p) =>
      reconcilePredator(p, state.brightness),
    ),
    drifters: state.drifters.map((d) => {
      const t = tileOf(d.x, d.y);
      return { ...d, tx: t.tx, ty: t.ty };
    }),
  };
}

function startDive(state: DeepReadonly<FathomState>): FathomState {
  return {
    ...baseState(state.assets, state.muted, state.titleIndex),
    screen: "countdown",
    menuIndex: null,
    titleIndex: state.titleIndex,
  };
}

function nextMaze(state: FathomState): FathomState {
  const base = baseState(state.assets, state.muted, state.titleIndex);
  return {
    ...base,
    screen: "countdown",
    menuIndex: null,
    score: state.score,
    lives: state.lives,
    depth: state.depth + 1,
    sonar: { ready: true, cooldown: 0, range: sonarRange(state.depth + 1) },
    predators: rosterKinds(state.depth + 1).map(makePredator),
    rng: state.rng,
    simTime: state.simTime,
  };
}

function resetAttempt(state: FathomState): FathomState {
  const c = center(state.start.tx, state.start.ty);
  return withDerived({
    ...state,
    screen: "countdown",
    menuIndex: null,
    countdown: COUNTDOWN_TIME,
    playTime: 0,
    brightness: 0,
    brightHold: 0,
    desiredDir: "left",
    forager: {
      x: c.x,
      y: c.y,
      tx: state.start.tx,
      ty: state.start.ty,
      dir: "left",
      moving: false,
    },
    predators: rosterKinds(state.depth).map(makePredator),
    drifters: [],
    drifterIn: DRIFTER_INTERVAL,
    sonar: { ready: true, cooldown: 0, range: sonarRange(state.depth) },
    ink: { ready: true, cooldown: 0 },
    pulses: [],
    inkClouds: [],
  });
}

function openDirs(
  rows: readonly string[],
  tx: number,
  ty: number,
  predator: boolean,
): Direction[] {
  return DIRS.filter((dir) => canMove(rows, tx, ty, dir, predator));
}

function atCenter(body: {
  x: number;
  y: number;
  tx: number;
  ty: number;
}): boolean {
  const c = center(body.tx, body.ty);
  return Math.abs(body.x - c.x) < 0.02 && Math.abs(body.y - c.y) < 0.02;
}

function lineClear(
  rows: readonly string[],
  a: { x: number; y: number },
  b: { x: number; y: number },
): boolean {
  const steps = Math.max(1, Math.ceil(dist(a, b) / 8));
  for (let i = 1; i < steps; i += 1) {
    const t = i / steps;
    const p = tileOf(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t);
    if (get(rows, p.tx, p.ty) === "#") return false;
  }
  return true;
}

function segmentHitsCloud(
  a: { x: number; y: number },
  b: { x: number; y: number },
  clouds: readonly InkCloudState[],
): boolean {
  return clouds.some((cloud) => {
    const vx = b.x - a.x;
    const vy = b.y - a.y;
    const len2 = vx * vx + vy * vy || 1;
    const t = Math.max(
      0,
      Math.min(1, ((cloud.x - a.x) * vx + (cloud.y - a.y) * vy) / len2),
    );
    const px = a.x + vx * t;
    const py = a.y + vy * t;
    return Math.hypot(px - cloud.x, py - cloud.y) <= cloud.radius;
  });
}

function blinded(state: FathomState, predator: PredatorStateData): boolean {
  return segmentHitsCloud(predator, state.forager, state.inkClouds);
}

function flowDistances(
  rows: readonly string[],
  origin: { tx: number; ty: number },
  range: number,
  predator = false,
): Map<string, number> {
  const distances = new Map<string, number>();
  const queue: { tx: number; ty: number; d: number }[] = [{ ...origin, d: 0 }];
  distances.set(`${origin.tx},${origin.ty}`, 0);
  for (let i = 0; i < queue.length; i += 1) {
    const node = queue[i];
    if (!node || node.d >= range) continue;
    for (const dir of openDirs(rows, node.tx, node.ty, predator)) {
      const n = neighbor(rows, node.tx, node.ty, dir);
      const key = `${n.tx},${n.ty}`;
      if (!distances.has(key)) {
        distances.set(key, node.d + 1);
        queue.push({ ...n, d: node.d + 1 });
      }
    }
  }
  return distances;
}

function firstStepTo(
  rows: readonly string[],
  from: { tx: number; ty: number },
  to: { tx: number; ty: number },
  predator = true,
): Direction | null {
  const queue: { tx: number; ty: number; first: Direction | null }[] = [
    { ...from, first: null },
  ];
  const seen = new Set([`${from.tx},${from.ty}`]);
  for (let i = 0; i < queue.length; i += 1) {
    const node = queue[i];
    if (!node) continue;
    if (node.tx === to.tx && node.ty === to.ty) return node.first;
    for (const dir of openDirs(rows, node.tx, node.ty, predator)) {
      const n = neighbor(rows, node.tx, node.ty, dir);
      const key = `${n.tx},${n.ty}`;
      if (!seen.has(key)) {
        seen.add(key);
        queue.push({ ...n, first: node.first ?? dir });
      }
    }
  }
  return null;
}

function moveBody<
  T extends { x: number; y: number; tx: number; ty: number; dir: Direction },
>(
  rows: readonly string[],
  body: T,
  speed: number,
  dt: number,
  predator: boolean,
): T {
  if (speed <= 0 || !canMove(rows, body.tx, body.ty, body.dir, predator))
    return body;
  const v = DIR_VEC[body.dir];
  let x = body.x + v.dx * speed * dt;
  let y = body.y + v.dy * speed * dt;
  let { tx } = tileOf(x, y);
  const { ty } = tileOf(x, y);
  if (x < GRID_ORIGIN_X) {
    x = GRID_ORIGIN_X + GRID_COLS * TILE - (GRID_ORIGIN_X - x);
    tx = GRID_COLS - 1;
  }
  if (x > GRID_ORIGIN_X + GRID_COLS * TILE) {
    x = GRID_ORIGIN_X + (x - (GRID_ORIGIN_X + GRID_COLS * TILE));
    tx = 0;
  }
  const c = center(tx, ty);
  if (v.dx === 0) x = c.x;
  if (v.dy === 0) y = c.y;
  return { ...body, x, y, tx, ty };
}

function updateForager(state: FathomState, api: UpdateApi): FathomState {
  let desired = state.desiredDir;
  for (const dir of DIRS) if (api.input.value(dir) > 0) desired = dir;
  let f = { ...state.forager };
  if (desired === OPPOSITE[f.dir]) f = { ...f, dir: desired, moving: true };
  if (atCenter(f)) {
    const c = center(f.tx, f.ty);
    f = { ...f, x: c.x, y: c.y };
    if (canMove(state.tiles, f.tx, f.ty, desired, false)) {
      f = { ...f, dir: desired, moving: true };
    } else if (!canMove(state.tiles, f.tx, f.ty, f.dir, false)) {
      f = { ...f, moving: false };
    }
  }
  f = f.moving ? moveBody(state.tiles, f, FORAGER_SPEED, TICK_DT, false) : f;
  return { ...state, desiredDir: desired, forager: f };
}

function revealByLight(state: FathomState): FathomState {
  const lit = new Set<string>();
  for (let ty = 0; ty < GRID_ROWS; ty += 1) {
    for (let tx = 0; tx < GRID_COLS; tx += 1) {
      const c = center(tx, ty);
      if (
        dist(c, state.forager) <= state.visionRadius &&
        lineClear(state.tiles, state.forager, c)
      )
        lit.add(`${tx},${ty}`);
    }
  }
  for (const predator of state.predators) {
    if (predator.kind === "flarefish" && predator.flareBloom > 0) {
      for (let ty = 0; ty < GRID_ROWS; ty += 1) {
        for (let tx = 0; tx < GRID_COLS; tx += 1) {
          if (dist(center(tx, ty), predator) <= FLARE_RADIUS)
            lit.add(`${tx},${ty}`);
        }
      }
    }
  }
  const visibility = mapRows(state.visibility, (ch, tx, ty) =>
    lit.has(`${tx},${ty}`) ? "l" : ch === "u" ? "u" : "r",
  ) as VisibilityChar[];
  return { ...state, visibility };
}

function revealPulseTiles(state: FathomState): FathomState {
  const visibility = [...state.visibility];
  for (const pulse of state.pulses.filter((p) => p.source === "forager")) {
    const dists = flowDistances(
      state.tiles,
      { tx: pulse.ox, ty: pulse.oy },
      pulse.range,
    );
    for (const [key, d] of dists) {
      if (d <= pulse.front) {
        const [txRaw, tyRaw] = key.split(",");
        const tx = Number(txRaw);
        const ty = Number(tyRaw);
        visibility[ty] = rowSet(visibility[ty] ?? "", tx, "l");
        for (const dir of DIRS) {
          const n = neighbor(state.tiles, tx, ty, dir);
          if (get(state.tiles, n.tx, n.ty) === "#")
            visibility[n.ty] = rowSet(visibility[n.ty] ?? "", n.tx, "l");
        }
      }
    }
  }
  return { ...state, visibility };
}

function updatePulses(state: FathomState): FathomState {
  let predators = state.predators;
  const pulses = state.pulses
    .map((p) => ({ ...p, front: p.front + SONAR_WAVE_SPEED * TICK_DT }))
    .filter((p) => p.front <= p.range + 0.7);
  for (const pulse of pulses) {
    const dists = flowDistances(
      state.tiles,
      { tx: pulse.ox, ty: pulse.oy },
      pulse.range,
    );
    const seenNow = new Set(
      [...dists]
        .filter(
          ([, d]) =>
            d <= pulse.front && d > pulse.front - SONAR_WAVE_SPEED * TICK_DT,
        )
        .map(([k]) => k),
    );
    if (pulse.source === "forager") {
      predators = predators.map((predator) => {
        if (predator.kind === "lanternjaw") return predator;
        if (!seenNow.has(`${predator.tx},${predator.ty}`)) return predator;
        const fix =
          predator.kind === "gloamfin"
            ? { tx: state.forager.tx, ty: state.forager.ty }
            : predator.fix;
        return reconcilePredator(
          {
            ...predator,
            fix,
            state: predator.kind === "gloamfin" ? "chase" : predator.state,
            alertTimer:
              predator.kind === "gloamfin" ? ALERT_TIME : predator.alertTimer,
            sonarMark: SONAR_MARK_TIME,
          },
          state.brightness,
        );
      });
    } else if (seenNow.has(`${state.forager.tx},${state.forager.ty}`)) {
      predators = predators.map((predator) =>
        predator.tx === pulse.ox &&
        predator.ty === pulse.oy &&
        predator.kind === "gloamfin"
          ? reconcilePredator(
              {
                ...predator,
                state: "chase",
                fix: { tx: state.forager.tx, ty: state.forager.ty },
                alertTimer: ALERT_TIME,
                chaseSpeed: GLOAMFIN_CHASE_SPEED,
                hearingLock: false,
              },
              state.brightness,
            )
          : predator,
      );
    }
  }
  return revealPulseTiles({ ...state, pulses, predators });
}

function predatorLit(state: FathomState, predator: PredatorStateData): boolean {
  if (predator.alertTimer > 0 || predator.sonarMark > 0) return true;
  if (
    dist(predator, state.forager) <= state.visionRadius &&
    lineClear(state.tiles, predator, state.forager)
  )
    return true;
  return state.predators.some(
    (p) =>
      p.kind === "flarefish" &&
      p.flareBloom > 0 &&
      dist(p, predator) <= FLARE_RADIUS,
  );
}

function drifterLit(state: FathomState, drifter: DrifterState): boolean {
  if (
    dist(drifter, state.forager) <= state.visionRadius &&
    lineClear(state.tiles, drifter, state.forager)
  )
    return true;
  return state.predators.some(
    (p) =>
      p.kind === "flarefish" &&
      p.flareBloom > 0 &&
      dist(p, drifter) <= FLARE_RADIUS,
  );
}

function wanderDir(
  rows: readonly string[],
  body: { tx: number; ty: number; dir: Direction },
  seed: number,
  predator: boolean,
): [Direction, number] {
  const options = openDirs(rows, body.tx, body.ty, predator).filter(
    (d) => d !== OPPOSITE[body.dir],
  );
  return choose(seed, options.length > 0 ? options : [OPPOSITE[body.dir]]);
}

function updateDrifters(state: FathomState): FathomState {
  let rng = state.rng;
  const drifters = state.drifters.map((drifter) => {
    let d = { ...drifter };
    if (d.mind && atCenter(d)) {
      const [dir, next] = wanderDir(state.tiles, d, rng, false);
      rng = next;
      d = { ...d, dir };
    }
    if (d.travel) d = moveBody(state.tiles, d, DRIFTER_SPEED, TICK_DT, false);
    return { ...d, lit: drifterLit(state, d) };
  });
  let drifterIn = state.drifterIn;
  let nextDrifters = drifters;
  if (state.planktonRemaining > 0) {
    drifterIn = Math.max(0, drifterIn - TICK_DT);
    if (drifterIn <= 0) {
      if (nextDrifters.length < DRIFTER_MAX && isCorridor(state.tiles, 17, 5)) {
        const c = center(17, 5);
        nextDrifters = [
          ...nextDrifters,
          {
            x: c.x,
            y: c.y,
            tx: 17,
            ty: 5,
            dir: "up",
            lit: false,
            mind: true,
            travel: true,
          },
        ];
      }
      drifterIn = DRIFTER_INTERVAL;
    }
  }
  return { ...state, rng, drifterIn, drifters: nextDrifters };
}

function updatePredators(state: FathomState, cues: Set<string>): FathomState {
  let rng = state.rng;
  const predators = state.predators.map((predator, index) => {
    let p = {
      ...predator,
      alertTimer: Math.max(0, predator.alertTimer - TICK_DT),
      sonarMark: Math.max(0, predator.sonarMark - TICK_DT),
      pingGap: Math.max(0, predator.pingGap - TICK_DT),
    };
    if (p.state === "den" && !p.released && state.playTime >= p.releaseAt) {
      p = { ...p, released: true, dir: "up" };
    }
    if (p.released && p.state === "den" && p.tx === 17 && p.ty <= 5) {
      p = { ...p, state: "wander", fix: null };
    }
    if (p.kind === "gloamfin") {
      const hearing = dist(p, state.forager) <= GLOAMFIN_HEAR;
      if (p.mind && hearing) {
        p = {
          ...p,
          state: "chase",
          fix: { tx: state.forager.tx, ty: state.forager.ty },
          hearingLock: true,
          alertTimer: p.state === "chase" ? p.alertTimer : ALERT_TIME,
        };
      } else {
        p = { ...p, hearingLock: false };
      }
      if (p.state === "chase")
        p = {
          ...p,
          chaseSpeed: Math.min(
            GLOAMFIN_CHASE_SPEED,
            p.chaseSpeed +
              ((GLOAMFIN_CHASE_SPEED - GLOAMFIN_CORNER_SPEED) /
                GLOAMFIN_RAMP_TIME) *
                TICK_DT,
          ),
        };
      if (p.mind && p.released && p.state !== "den" && !p.hearingLock) {
        p = { ...p, pingTimer: p.pingTimer - TICK_DT };
        const searchDue =
          p.state === "search" &&
          !p.searchPinged &&
          p.searchTimer <= GLOAMFIN_GIVEUP - GLOAMFIN_SEARCH_DELAY;
        if ((p.pingTimer <= 0 || searchDue) && p.pingGap <= 0) {
          cues.add(CUES.predatorPing);
          p = {
            ...p,
            pingTimer: GLOAMFIN_PING_INTERVAL,
            pingGap: GLOAMFIN_PING_MIN_GAP,
            searchPinged: p.searchPinged || searchDue,
          };
          state.pulses = [
            ...state.pulses,
            {
              source: "gloamfin",
              tint: searchDue ? "orange" : "violet",
              ox: p.tx,
              oy: p.ty,
              front: 0,
              range: GLOAMFIN_PING_RANGE,
              caught: [],
            },
          ];
        }
      }
      if (p.state === "search") {
        p = { ...p, searchTimer: p.searchTimer - TICK_DT };
        if (p.searchTimer <= 0) p = { ...p, state: "wander", fix: null };
      }
    } else if (p.mind) {
      const senses =
        dist(p, state.forager) <= detectRange(state.brightness) &&
        lineClear(state.tiles, p, state.forager) &&
        !blinded(state, p);
      if (senses) {
        p = {
          ...p,
          state: "chase",
          fix: { tx: state.forager.tx, ty: state.forager.ty },
          linger: LINGER_TIME,
        };
        if (p.kind === "flarefish" && predator.state !== "chase")
          p = { ...p, alertTimer: ALERT_TIME };
      } else if (blinded(state, p)) {
        p = {
          ...p,
          state: "wander",
          fix: null,
          linger: 0,
          flareTimer: FLARE_INTERVAL,
        };
      } else if (p.state === "chase") {
        p = { ...p, linger: p.linger - TICK_DT };
        if (p.linger <= 0)
          p = { ...p, state: "wander", fix: null, flareTimer: FLARE_INTERVAL };
      }
    }
    if (p.kind === "flarefish" && p.mind && p.state === "wander") {
      if (p.flareCharge > 0) {
        p = { ...p, flareCharge: Math.max(0, p.flareCharge - TICK_DT) };
        if (p.flareCharge <= 0) {
          p = { ...p, flareBloom: FLARE_BLOOM };
          cues.add(CUES.flare);
        }
      } else if (p.flareBloom > 0) {
        const locks =
          dist(p, state.forager) <= FLARE_RADIUS && !blinded(state, p);
        p = locks
          ? {
              ...p,
              state: "chase",
              fix: { tx: state.forager.tx, ty: state.forager.ty },
              alertTimer: ALERT_TIME,
              flareBloom: 0,
              flareTimer: FLARE_INTERVAL,
            }
          : { ...p, flareBloom: Math.max(0, p.flareBloom - TICK_DT) };
        if (p.flareBloom <= 0) p = { ...p, flareTimer: FLARE_INTERVAL };
      } else {
        p = { ...p, flareTimer: p.flareTimer - TICK_DT };
        if (p.flareTimer <= 0) p = { ...p, flareCharge: FLARE_CHARGE };
      }
    }
    if (p.mind && atCenter(p)) {
      const fix = p.fix;
      if ((p.state === "chase" || p.state === "den") && fix) {
        const nextDir = firstStepTo(state.tiles, p, fix) ?? p.dir;
        if (
          (p.dir === "up" || p.dir === "down") !==
            (nextDir === "up" || nextDir === "down") &&
          p.kind === "gloamfin"
        )
          p = { ...p, chaseSpeed: GLOAMFIN_CORNER_SPEED };
        p = { ...p, dir: nextDir };
        if (
          p.tx === fix.tx &&
          p.ty === fix.ty &&
          p.kind === "gloamfin" &&
          (state.forager.tx !== fix.tx || state.forager.ty !== fix.ty)
        )
          p = {
            ...p,
            state: "search",
            searchTimer: GLOAMFIN_GIVEUP,
            searchPinged: false,
          };
      } else if (p.state === "den") {
        p = {
          ...p,
          dir: firstStepTo(state.tiles, p, { tx: 17, ty: 5 }) ?? "up",
        };
      } else if (p.state === "search") {
        const away =
          Math.abs(p.tx - (p.fix?.tx ?? p.tx)) +
          Math.abs(p.ty - (p.fix?.ty ?? p.ty));
        if (away > GLOAMFIN_SEARCH_ROAM && p.fix)
          p = { ...p, dir: firstStepTo(state.tiles, p, p.fix) ?? p.dir };
        else {
          const [dir, next] = wanderDir(state.tiles, p, rng, true);
          rng = next;
          p = { ...p, dir };
        }
      } else {
        const [dir, next] = wanderDir(state.tiles, p, rng + index, true);
        rng = next;
        p = { ...p, dir };
      }
    }
    if (p.travel && p.released)
      p = moveBody(state.tiles, p, speedOf(p), TICK_DT, true);
    return reconcilePredator(
      { ...p, lit: predatorLit(state, p) },
      state.brightness,
    );
  });
  return { ...state, predators, rng };
}

function updateEating(state: FathomState, cues: Set<string>): FathomState {
  const plankton = [...state.plankton];
  let score = state.score;
  let brightness = state.brightness;
  let brightHold = state.brightHold;
  let screen: Screen = state.screen;
  let clearedTimer = state.clearedTimer;
  if (get(plankton, state.forager.tx, state.forager.ty) === "*") {
    plankton[state.forager.ty] = rowSet(
      plankton[state.forager.ty] ?? "",
      state.forager.tx,
      "-",
    );
    score += SCORE_PLANKTON;
    brightness = Math.min(1, brightness + BRIGHT_PER_EAT);
    brightHold = BRIGHT_HOLD;
    cues.add(CUES.eat);
    if (countChar(plankton, "*") === 0) {
      score += SCORE_CLEAR;
      screen = "cleared";
      clearedTimer = CLEARED_TIME;
      cues.add(CUES.descend);
    }
  }
  const drifters = state.drifters.filter((d) => {
    const eaten = d.tx === state.forager.tx && d.ty === state.forager.ty;
    if (eaten) score += SCORE_DRIFTER;
    return !eaten;
  });
  return withDerived({
    ...state,
    plankton,
    score,
    brightness,
    brightHold,
    screen,
    clearedTimer,
    drifters,
  });
}

function updateContact(state: FathomState, cues: Set<string>): FathomState {
  const caught = state.predators.some(
    (p) =>
      p.state !== "den" &&
      p.tx === state.forager.tx &&
      p.ty === state.forager.ty,
  );
  if (!caught) return state;
  cues.add(CUES.caught);
  if (state.lives <= 0) return { ...state, screen: "gameover", menuIndex: 0 };
  return resetAttempt({ ...state, lives: state.lives - 1 });
}

function tick(
  state: FathomState,
  api: UpdateApi,
  cues: Set<string>,
): FathomState {
  let next = withDerived({ ...state, simTime: state.simTime + TICK_DT });
  if (next.screen === "countdown") {
    next = revealByLight({ ...next, countdown: next.countdown - TICK_DT });
    if (next.countdown <= 0)
      next = {
        ...next,
        screen: "playing",
        playTime: 0,
        countdown: COUNTDOWN_TIME,
      };
    return withDerived(next);
  }
  if (next.screen === "cleared") {
    next = { ...next, clearedTimer: next.clearedTimer - TICK_DT };
    return next.clearedTimer <= 0 ? nextMaze(next) : next;
  }
  if (next.screen !== "playing") return next;
  next = { ...next, playTime: next.playTime + TICK_DT };
  next = updateForager(next, api);
  next = {
    ...next,
    brightHold: Math.max(0, next.brightHold - TICK_DT),
    brightness:
      next.brightHold > 0
        ? next.brightness
        : next.brightness * 0.5 ** (TICK_DT / BRIGHT_HALFLIFE),
    sonar: {
      ...next.sonar,
      cooldown: Math.max(0, next.sonar.cooldown - TICK_DT),
    },
    ink: { ...next.ink, cooldown: Math.max(0, next.ink.cooldown - TICK_DT) },
    inkClouds: next.inkClouds
      .map((c) => ({ ...c, remaining: c.remaining - TICK_DT }))
      .filter((c) => c.remaining > 0),
  };
  next = updatePulses(next);
  next = updateDrifters(next);
  next = updatePredators(next, cues);
  next = revealByLight(next);
  next = updateEating(next, cues);
  next = updateContact(next, cues);
  return withDerived(next);
}

function readInput(state: FathomState, api: UpdateApi): FathomState {
  let next = state;
  if (api.input.pressed("mute")) api.audio.setMuted(!api.audio.muted());
  const up = api.input.pressed("up");
  const down = api.input.pressed("down");
  const confirm = api.input.pressed("confirm");
  const back = api.input.pressed("back");
  const pause = api.input.pressed("pause");
  const pointer = api.input.pointer();
  const pointerPress = api.input.pointerPressed();
  const pointerRelease = api.input.pointerReleased();
  const hover = menuItemAt(next, pointer.x, pointer.y);
  if (hover !== null && next.menuIndex !== null)
    next = { ...next, menuIndex: hover };
  if (pointerPress) next = { ...next, pointerDownItem: hover };
  const pointerConfirm =
    pointerRelease && hover !== null && hover === next.pointerDownItem;
  if (pointerRelease) next = { ...next, pointerDownItem: null };
  if (next.screen === "playing" && pause)
    return { ...next, screen: "paused", menuIndex: 0 };
  if (next.screen === "paused" && (pause || back))
    return { ...next, screen: "playing", menuIndex: null };
  if (
    next.screen === "howto" &&
    (confirm || back || (pointerRelease && next.pointerDownItem === null))
  )
    return { ...next, screen: "title", menuIndex: next.titleIndex };
  if (next.menuIndex !== null) {
    const count = menuItems(next.screen).length;
    let selected = next.menuIndex;
    if (up) selected = (selected + count - 1) % count;
    if (down) selected = (selected + 1) % count;
    if (selected !== next.menuIndex) next = { ...next, menuIndex: selected };
    if (confirm || pointerConfirm) next = confirmMenu(next);
  }
  if (next.screen === "playing") {
    if (api.input.pressed("a") && next.sonar.cooldown <= 0) {
      next = {
        ...next,
        sonar: { ...next.sonar, cooldown: SONAR_COOLDOWN, ready: false },
        pulses: [
          ...next.pulses,
          {
            source: "forager",
            tint: "cyan",
            ox: next.forager.tx,
            oy: next.forager.ty,
            front: 0,
            range: next.sonar.range,
            caught: [],
          },
        ],
      };
      api.audio.play(CUES.sonar);
    }
    if (api.input.pressed("b") && next.ink.cooldown <= 0) {
      next = {
        ...next,
        ink: { cooldown: INK_COOLDOWN, ready: false },
        inkClouds: [
          ...next.inkClouds,
          {
            x: next.forager.x,
            y: next.forager.y,
            radius: INK_RADIUS,
            remaining: INK_LIFE,
          },
        ],
      };
      api.audio.play(CUES.ink);
    }
  }
  return next;
}

function menuItems(screen: Screen): readonly string[] {
  if (screen === "title") return TITLE_ITEMS;
  if (screen === "paused") return PAUSE_ITEMS;
  if (screen === "gameover") return GAMEOVER_ITEMS;
  return [];
}

function menuRect(screen: Screen, index: number): Rect | null {
  const items = menuItems(screen);
  if (index < 0 || index >= items.length) return null;
  const w = screen === "paused" ? 360 : 320;
  const h = 52;
  const gap = 12;
  const x = STAGE_W / 2 - w / 2;
  const y =
    screen === "title" ? 390 + index * (h + gap) : 370 + index * (h + gap);
  return { x, y, w, h };
}

function menuItemAt(state: FathomState, x: number, y: number): number | null {
  for (let i = 0; i < menuItems(state.screen).length; i += 1) {
    const r = menuRect(state.screen, i);
    if (r && x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) return i;
  }
  return null;
}

function confirmMenu(state: FathomState): FathomState {
  const index = state.menuIndex ?? 0;
  if (state.screen === "title") {
    const titleIndex = index;
    return index === 0
      ? { ...startDive({ ...state, titleIndex }), titleIndex }
      : { ...state, screen: "howto", menuIndex: null, titleIndex };
  }
  if (state.screen === "paused") {
    if (index === 0) return { ...state, screen: "playing", menuIndex: null };
    if (index === 1) return startDive(state);
    return {
      ...baseState(state.assets, state.muted, state.titleIndex),
      menuIndex: state.titleIndex,
    };
  }
  if (state.screen === "gameover") {
    if (index === 0) return startDive(state);
    return {
      ...baseState(state.assets, state.muted, state.titleIndex),
      menuIndex: state.titleIndex,
    };
  }
  return state;
}

function snapshot(state: DeepReadonly<FathomState>): FathomSnapshot {
  return {
    version: 1,
    screen: state.screen,
    menuIndex: state.menuIndex,
    titleIndex: state.titleIndex,
    depth: state.depth,
    score: state.score,
    lives: state.lives,
    muted: state.muted,
    planktonRemaining: state.planktonRemaining,
    drifterIn: state.drifterIn,
    brightness: state.brightness,
    brightHold: state.brightHold,
    visionRadius: state.visionRadius,
    windowRadius: state.windowRadius,
    sonar: { ...state.sonar },
    ink: { ...state.ink },
    grid: { ...state.grid },
    tiles: [...state.tiles],
    plankton: [...state.plankton],
    visibility: [...state.visibility],
    forager: { ...state.forager },
    drifters: state.drifters.map(({ x, y, tx, ty, lit, mind, travel }) => ({
      x,
      y,
      tx,
      ty,
      lit,
      mind,
      travel,
    })),
    predators: state.predators.map(
      ({
        kind,
        x,
        y,
        tx,
        ty,
        dir,
        state: predatorState,
        released,
        mind,
        travel,
        speed,
        alert,
        lit,
        detectRange: detect,
        hearingRange,
        hearingLock,
        flareCharging,
        flaring,
        flareRadius,
      }) => ({
        kind,
        x,
        y,
        tx,
        ty,
        dir,
        state: predatorState,
        released,
        mind,
        travel,
        speed,
        alert,
        lit,
        detectRange: detect,
        hearingRange,
        hearingLock,
        flareCharging,
        flaring,
        flareRadius,
      }),
    ),
    pulses: state.pulses.map(({ source, tint, ox, oy, front, range }) => ({
      source,
      tint,
      ox,
      oy,
      front,
      range,
    })),
    inkClouds: state.inkClouds.map((c) => ({ ...c })),
    simTime: state.simTime,
  };
}

function asState(state: DeepReadonly<FathomState>): FathomState {
  return state as FathomState;
}

function assertInt(name: string, value: number, min: number): void {
  if (!Number.isInteger(value) || value < min)
    throw new Error(`${name} is invalid`);
}

function assertTile(tx: number, ty: number): void {
  if (
    !Number.isInteger(tx) ||
    !Number.isInteger(ty) ||
    tx < 0 ||
    tx >= GRID_COLS ||
    ty < 0 ||
    ty >= GRID_ROWS
  )
    throw new Error("tile is invalid");
}

function assertDir(dir: string): asserts dir is Direction {
  if (!DIRS.includes(dir as Direction)) throw new Error("direction is invalid");
}

function debugApi(): FathomDebugApi {
  const predatorAt = (
    state: DeepReadonly<FathomState>,
    index: number,
  ): PredatorStateData => {
    const predator = state.predators[index] as PredatorStateData | undefined;
    if (!predator) throw new Error("predator index is invalid");
    return predator;
  };
  const drifterAt = (
    state: DeepReadonly<FathomState>,
    index: number,
  ): DrifterState => {
    const drifter = state.drifters[index] as DrifterState | undefined;
    if (!drifter) throw new Error("drifter index is invalid");
    return drifter;
  };
  return {
    version: FATHOM_DEBUG_VERSION,
    reset: (state) => baseState(state.assets, state.muted),
    snapshot,
    reconcile: (state) => withDerived(asState(state)),
    setScreen: (state, screen) => {
      const menuIndex =
        screen === "title"
          ? state.titleIndex
          : screen === "paused" || screen === "gameover"
            ? 0
            : null;
      return { ...asState(state), screen, menuIndex };
    },
    setMenuIndex: (state, index) => {
      const count = menuItems(state.screen).length;
      if (
        count === 0 ||
        !Number.isInteger(index) ||
        index < 0 ||
        index >= count
      )
        throw new Error("menu index is invalid");
      return { ...asState(state), menuIndex: index };
    },
    setTitleIndex: (state, index) => {
      assertInt("title index", index, 0);
      if (index >= TITLE_ITEMS.length)
        throw new Error("title index is invalid");
      return { ...asState(state), titleIndex: index };
    },
    menuItemRect: (state, index) => menuRect(state.screen, index),
    setScore: (state, points) => {
      assertInt("score", points, 0);
      return { ...asState(state), score: points };
    },
    setLives: (state, n) => {
      assertInt("lives", n, 0);
      return { ...asState(state), lives: n };
    },
    setDepth: (state, depth) => {
      assertInt("depth", depth, 1);
      return withDerived({
        ...asState(state),
        depth,
        predators: rosterKinds(depth).map(makePredator),
      });
    },
    setMaze: (state, rows) => {
      if (
        rows.length !== GRID_ROWS ||
        rows.some((r) => r.length !== GRID_COLS || /[^#.gd]/u.test(r))
      )
        throw new Error("maze is invalid");
      if (rows.some((r) => r.includes("d")) && countChar(rows, "g") !== 1)
        throw new Error("maze gate is invalid");
      return { ...asState(state), tiles: [...rows] };
    },
    setPlankton: (state, tx, ty, present) => {
      assertTile(tx, ty);
      if (!isCorridor(state.tiles, tx, ty))
        throw new Error("plankton tile is invalid");
      const plankton = [...state.plankton];
      plankton[ty] = rowSet(plankton[ty] ?? "", tx, present ? "*" : "-");
      return withDerived({ ...asState(state), plankton });
    },
    clearPlankton: (state) =>
      withDerived({
        ...asState(state),
        plankton: mapRows(state.plankton, () => "-"),
      }),
    clearFog: (state) => ({
      ...asState(state),
      visibility: mapRows(state.visibility, () => "u"),
    }),
    setForagerTile: (state, tx, ty) => {
      assertTile(tx, ty);
      if (!isCorridor(state.tiles, tx, ty))
        throw new Error("forager tile is invalid");
      const c = center(tx, ty);
      return withDerived({
        ...asState(state),
        forager: { ...state.forager, x: c.x, y: c.y, tx, ty, moving: false },
      });
    },
    setForagerDir: (state, dir) => {
      assertDir(dir);
      return {
        ...asState(state),
        forager: { ...state.forager, dir, moving: false },
        desiredDir: dir,
      };
    },
    setBrightness: (state, g) => {
      if (g < 0 || g > 1) throw new Error("brightness is invalid");
      return withDerived({ ...asState(state), brightness: g });
    },
    setBrightHold: (state, seconds) => {
      if (seconds < 0 || seconds > BRIGHT_HOLD)
        throw new Error("bright hold is invalid");
      return { ...asState(state), brightHold: seconds };
    },
    clearPredators: (state) => ({ ...asState(state), predators: [] }),
    addPredator: (state, kind, tx, ty) => {
      assertTile(tx, ty);
      if (
        !["lanternjaw", "gloamfin", "flarefish"].includes(kind) ||
        !isCorridor(state.tiles, tx, ty)
      )
        throw new Error("predator is invalid");
      const c = center(tx, ty);
      const predator = {
        ...makePredator(kind, state.predators.length),
        x: c.x,
        y: c.y,
        tx,
        ty,
        state: "wander" as const,
        released: true,
      };
      return withDerived({
        ...asState(state),
        predators: [...state.predators, predator],
      });
    },
    setPredatorTile: (state, index, tx, ty) => {
      assertTile(tx, ty);
      if (!isPredOpen(state.tiles, tx, ty))
        throw new Error("predator tile is invalid");
      const c = center(tx, ty);
      predatorAt(state, index);
      return withDerived({
        ...asState(state),
        predators: state.predators.map((p, i) =>
          i === index ? { ...p, x: c.x, y: c.y, tx, ty } : p,
        ),
      });
    },
    setPredatorDir: (state, index, dir) => {
      assertDir(dir);
      predatorAt(state, index);
      return withDerived({
        ...asState(state),
        predators: state.predators.map((p, i) =>
          i === index ? { ...p, dir } : p,
        ),
      });
    },
    setPredatorState: (state, index, value) => {
      predatorAt(state, index);
      return withDerived({
        ...asState(state),
        predators: state.predators.map((p, i) =>
          i === index
            ? {
                ...p,
                state: value,
                fix:
                  value === "chase"
                    ? { tx: state.forager.tx, ty: state.forager.ty }
                    : null,
              }
            : p,
        ),
      });
    },
    setPredatorReleased: (state, index, released) => {
      predatorAt(state, index);
      return withDerived({
        ...asState(state),
        predators: state.predators.map((p, i) =>
          i === index ? { ...p, released } : p,
        ),
      });
    },
    setPredatorMind: (state, index, enabled) => {
      predatorAt(state, index);
      return withDerived({
        ...asState(state),
        predators: state.predators.map((p, i) =>
          i === index ? { ...p, mind: enabled } : p,
        ),
      });
    },
    setPredatorTravel: (state, index, enabled) => {
      predatorAt(state, index);
      return withDerived({
        ...asState(state),
        predators: state.predators.map((p, i) =>
          i === index ? { ...p, travel: enabled } : p,
        ),
      });
    },
    spawnDrifter: (state, tx, ty) => {
      assertTile(tx, ty);
      if (!isCorridor(state.tiles, tx, ty))
        throw new Error("drifter tile is invalid");
      const c = center(tx, ty);
      return {
        ...asState(state),
        drifters: [
          ...state.drifters,
          {
            x: c.x,
            y: c.y,
            tx,
            ty,
            dir: "up",
            lit: false,
            mind: true,
            travel: true,
          },
        ],
      };
    },
    clearDrifters: (state) => ({ ...asState(state), drifters: [] }),
    setDrifterMind: (state, index, enabled) => {
      drifterAt(state, index);
      return {
        ...asState(state),
        drifters: state.drifters.map((d, i) =>
          i === index ? { ...d, mind: enabled } : d,
        ),
      };
    },
    setDrifterTravel: (state, index, enabled) => {
      drifterAt(state, index);
      return {
        ...asState(state),
        drifters: state.drifters.map((d, i) =>
          i === index ? { ...d, travel: enabled } : d,
        ),
      };
    },
    setDrifterIn: (state, seconds) => {
      if (seconds < 0 || seconds > DRIFTER_INTERVAL)
        throw new Error("drifter timer is invalid");
      return { ...asState(state), drifterIn: seconds };
    },
    setSonarCooldown: (state, seconds) => {
      if (seconds < 0) throw new Error("sonar cooldown is invalid");
      return withDerived({
        ...asState(state),
        sonar: { ...state.sonar, cooldown: seconds },
      });
    },
    setInkCooldown: (state, seconds) => {
      if (seconds < 0) throw new Error("ink cooldown is invalid");
      return withDerived({
        ...asState(state),
        ink: { ...state.ink, cooldown: seconds },
      });
    },
  };
}

function drawText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  size: number,
  align: CanvasTextAlign = "center",
  color = "#d7fbff",
): void {
  ctx.fillStyle = color;
  ctx.font = `700 ${size}px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`;
  ctx.textAlign = align;
  ctx.textBaseline = "middle";
  ctx.fillText(text, x, y);
}

function spriteFrame(dir: Direction, moving: boolean, t: number): number {
  const base = dir === "down" ? 0 : dir === "up" ? 2 : dir === "left" ? 4 : 6;
  return base + (moving && Math.floor(t * 9) % 2 === 1 ? 1 : 0);
}

function drawMaze(
  state: DeepReadonly<FathomState>,
  ctx: CanvasRenderingContext2D,
): void {
  ctx.fillStyle = BACKGROUND;
  ctx.fillRect(0, 0, STAGE_W, STAGE_H);
  ctx.save();
  ctx.beginPath();
  ctx.arc(state.forager.x, state.forager.y, state.windowRadius, 0, Math.PI * 2);
  ctx.clip();
  for (let ty = 0; ty < GRID_ROWS; ty += 1) {
    for (let tx = 0; tx < GRID_COLS; tx += 1) {
      const x = GRID_ORIGIN_X + tx * TILE;
      const y = GRID_ORIGIN_Y + ty * TILE;
      const v = state.visibility[ty]?.[tx] as VisibilityChar;
      const tile = state.tiles[ty]?.[tx] as TileChar;
      if (v === "u") {
        ctx.drawImage(state.assets.trenchWalls[17], x, y, TILE, TILE);
        continue;
      }
      ctx.globalAlpha = v === "l" ? 1 : 0.36;
      if (tile === "#") {
        let mask = 0;
        if (get(state.tiles, tx, ty - 1) === "#") mask += 1;
        if (get(state.tiles, tx + 1, ty) === "#") mask += 2;
        if (get(state.tiles, tx, ty + 1) === "#") mask += 4;
        if (get(state.tiles, tx - 1, ty) === "#") mask += 8;
        ctx.drawImage(state.assets.trenchWalls[mask], x, y, TILE, TILE);
      } else {
        ctx.drawImage(
          state.assets.trenchWalls[tile === "g" ? 18 : 16],
          x,
          y,
          TILE,
          TILE,
        );
      }
      ctx.globalAlpha = 1;
      if (state.plankton[ty]?.[tx] === "*") {
        ctx.fillStyle = v === "l" ? "#a9fff5" : "#4f9f9d";
        ctx.beginPath();
        ctx.arc(x + TILE / 2, y + TILE / 2, PLANKTON_DOT / 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
  ctx.restore();
  const glow = ctx.createRadialGradient(
    state.forager.x,
    state.forager.y,
    18,
    state.forager.x,
    state.forager.y,
    state.windowRadius,
  );
  glow.addColorStop(0, "rgba(66,236,255,0.18)");
  glow.addColorStop(1, "rgba(66,236,255,0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(state.forager.x, state.forager.y, state.windowRadius, 0, Math.PI * 2);
  ctx.fill();
}

function drawEffects(
  state: DeepReadonly<FathomState>,
  ctx: CanvasRenderingContext2D,
): void {
  for (const cloud of state.inkClouds) {
    ctx.fillStyle = `rgba(0, 3, 8, ${0.55 * (cloud.remaining / INK_LIFE)})`;
    ctx.beginPath();
    ctx.arc(cloud.x, cloud.y, cloud.radius, 0, Math.PI * 2);
    ctx.fill();
  }
  for (const pulse of state.pulses) {
    const color =
      pulse.tint === "cyan"
        ? "#52f4ff"
        : pulse.tint === "violet"
          ? "#a672ff"
          : "#ff9d42";
    const dists = flowDistances(
      state.tiles,
      { tx: pulse.ox, ty: pulse.oy },
      pulse.range,
    );
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.globalAlpha = 0.72;
    for (const [key, d] of dists) {
      if (Math.abs(d - pulse.front) < 0.7) {
        const [txRaw, tyRaw] = key.split(",");
        const c = center(Number(txRaw), Number(tyRaw));
        ctx.beginPath();
        ctx.arc(c.x, c.y, 12, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
  }
  for (const predator of state.predators) {
    if (
      predator.kind === "flarefish" &&
      (predator.flareCharge || predator.flareBloom)
    ) {
      const frame = predator.flareBloom
        ? 5
        : Math.min(
            2,
            Math.floor((1 - predator.flareCharge / FLARE_CHARGE) * 3),
          );
      const size = FLARE_RADIUS * 2;
      ctx.globalAlpha = predator.flareBloom ? 0.85 : 0.55;
      ctx.drawImage(
        state.assets.flareBloom[frame],
        predator.x - size / 2,
        predator.y - size / 2,
        size,
        size,
      );
      ctx.globalAlpha = 1;
    }
  }
}

function drawCreatures(
  state: DeepReadonly<FathomState>,
  ctx: CanvasRenderingContext2D,
): void {
  const t = state.simTime;
  for (const predator of state.predators) {
    if (predator.kind === "lanternjaw" && predator.released)
      drawAmber(ctx, predator.x, predator.y);
  }
  for (const drifter of state.drifters) drawAmber(ctx, drifter.x, drifter.y);
  for (const drifter of state.drifters) {
    if (drifter.lit) {
      const frame = Math.floor(t * 8) % state.assets.drifter.length;
      ctx.drawImage(
        state.assets.drifter[frame],
        drifter.x - 16,
        drifter.y - 16,
        32,
        32,
      );
    }
  }
  for (const predator of state.predators) {
    if (!predator.lit) continue;
    let image: ImageBitmap;
    if (predator.kind === "lanternjaw" && predator.state === "wander")
      image = state.assets.lanternjaw[8 + (Math.floor(t * 8) % 8)];
    else if (predator.kind === "lanternjaw")
      image = state.assets.lanternjaw[spriteFrame(predator.dir, true, t * 0.8)];
    else if (predator.kind === "gloamfin")
      image = state.assets.gloamfin[spriteFrame(predator.dir, true, t)];
    else image = state.assets.flarefish[spriteFrame(predator.dir, true, t)];
    ctx.drawImage(image, predator.x - 16, predator.y - 16, 32, 32);
    if (predator.alert) {
      ctx.strokeStyle = predator.kind === "gloamfin" ? "#a672ff" : "#ff714d";
      ctx.globalAlpha = Math.max(0.1, predator.alert ? 0.8 : 0);
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(predator.x, predator.y, 34, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  }
  const light = ctx.createRadialGradient(
    state.forager.x,
    state.forager.y,
    2,
    state.forager.x,
    state.forager.y,
    state.visionRadius,
  );
  light.addColorStop(0, "rgba(95,246,255,0.5)");
  light.addColorStop(1, "rgba(95,246,255,0)");
  ctx.fillStyle = light;
  ctx.beginPath();
  ctx.arc(state.forager.x, state.forager.y, state.visionRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.drawImage(
    state.assets.glimmerfin[
      spriteFrame(state.forager.dir, state.forager.moving, t)
    ],
    state.forager.x - 16,
    state.forager.y - 16,
    32,
    32,
  );
}

function drawAmber(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  const g = ctx.createRadialGradient(x, y, 2, x, y, 26);
  g.addColorStop(0, "#ffd48a");
  g.addColorStop(1, "rgba(255,126,44,0)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, 26, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffb24f";
  ctx.beginPath();
  ctx.arc(x, y, 4, 0, Math.PI * 2);
  ctx.fill();
}

function drawHud(
  state: DeepReadonly<FathomState>,
  ctx: CanvasRenderingContext2D,
): void {
  ctx.fillStyle = "rgba(2, 10, 16, 0.86)";
  ctx.fillRect(0, 0, STAGE_W, 80);
  ctx.fillRect(0, 656, STAGE_W, 64);
  drawText(
    ctx,
    String(state.score).padStart(6, "0"),
    94,
    42,
    42,
    "left",
    "#eaffff",
  );
  drawText(ctx, DIVE_LABEL, STAGE_W / 2, 42, 20, "center", "#5e8890");
  drawText(ctx, `DEPTH ${state.depth}`, 1040, 688, 24, "left");
  for (let i = 0; i < state.lives; i += 1)
    ctx.drawImage(state.assets.glimmerfin[6], 72 + i * 34, 674, 26, 26);
  gauge(
    ctx,
    430,
    676,
    210,
    18,
    "SONAR",
    state.sonar.ready ? 1 : 1 - state.sonar.cooldown / SONAR_COOLDOWN,
    "#52f4ff",
  );
  gauge(
    ctx,
    680,
    676,
    210,
    18,
    "INK",
    state.ink.ready ? 1 : 1 - state.ink.cooldown / INK_COOLDOWN,
    "#708090",
  );
  if (state.muted) drawText(ctx, "MUTED", 1180, 40, 20, "center", "#ffb24f");
}

function gauge(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  label: string,
  fill: number,
  color: string,
): void {
  ctx.strokeStyle = "#35505a";
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, w, h);
  ctx.fillStyle = color;
  ctx.fillRect(x + 2, y + 2, Math.max(0, Math.min(1, fill)) * (w - 4), h - 4);
  drawText(ctx, label, x + w / 2, y - 13, 14, "center", "#87aeb6");
}

function drawMenu(
  state: DeepReadonly<FathomState>,
  ctx: CanvasRenderingContext2D,
): void {
  const items = menuItems(state.screen);
  for (let i = 0; i < items.length; i += 1) {
    const r = menuRect(state.screen, i);
    if (!r) continue;
    const selected = i === state.menuIndex;
    ctx.fillStyle = selected ? "rgba(86,244,255,0.18)" : "rgba(3,16,24,0.74)";
    ctx.strokeStyle = selected ? "#52f4ff" : "#2a5360";
    ctx.lineWidth = 2;
    ctx.fillRect(r.x, r.y, r.w, r.h);
    ctx.strokeRect(r.x, r.y, r.w, r.h);
    drawText(
      ctx,
      items[i] ?? "",
      r.x + r.w / 2,
      r.y + r.h / 2,
      26,
      "center",
      selected ? "#ffffff" : "#a8cbd1",
    );
  }
}

function drawScreens(
  state: DeepReadonly<FathomState>,
  ctx: CanvasRenderingContext2D,
): void {
  if (state.screen === "title") {
    drawMaze(state, ctx);
    ctx.fillStyle = "rgba(0,4,10,0.62)";
    ctx.fillRect(0, 0, STAGE_W, STAGE_H);
    drawText(ctx, TITLE_TEXT, STAGE_W / 2, 210, 94, "center", "#dffcff");
    drawText(ctx, TAGLINE_TEXT, STAGE_W / 2, 290, 28, "center", "#ffb24f");
    drawMenu(state, ctx);
    return;
  }
  if (state.screen === "howto") {
    ctx.fillStyle = BACKGROUND;
    ctx.fillRect(0, 0, STAGE_W, STAGE_H);
    drawText(ctx, "HOW TO PLAY", STAGE_W / 2, 105, 46);
    const lines = [
      "Arrow keys or WASD swim. Space sends sonar. Shift releases ink. Esc pauses.",
      "Eat plankton to score and brighten your light. Brightness grows your sight and your danger.",
      "Lanternjaw hunts light, Gloamfin hunts sound, Flarefish exposes the maze with a burning flare.",
      "Remembered corridors stay mapped, but Kindle's window blacks them out until you return.",
      "Clear every mote to descend. Press Enter, Space, or click to return.",
    ];
    lines.forEach((line, i) =>
      drawText(
        ctx,
        line,
        STAGE_W / 2,
        215 + i * 58,
        22,
        "center",
        i === 4 ? "#ffb24f" : "#c5eaf0",
      ),
    );
    return;
  }
  if (state.screen === "gameover") {
    ctx.fillStyle = BACKGROUND;
    ctx.fillRect(0, 0, STAGE_W, STAGE_H);
    drawText(ctx, "DIVE LOST", STAGE_W / 2, 190, 58, "center", "#ffb0a0");
    drawText(ctx, `SCORE ${state.score}`, STAGE_W / 2, 265, 34);
    drawText(
      ctx,
      `REACHED DEPTH ${state.depth}`,
      STAGE_W / 2,
      315,
      24,
      "center",
      "#9fbcc4",
    );
    drawMenu(state, ctx);
  }
}

async function loadFrames(api: InitApi<FathomState>): Promise<Assets> {
  const load = (folder: string, count: number) =>
    Promise.all(
      Array.from({ length: count }, (_, i) =>
        api.assets.loadImage(`${folder}/${i}.png`),
      ),
    );
  const [
    glimmerfin,
    drifter,
    lanternjaw,
    gloamfin,
    flarefish,
    flareBloom,
    trenchWalls,
  ] = await Promise.all([
    load("glimmerfin", 8),
    load("drifter", 8),
    load("lanternjaw", 16),
    load("gloamfin", 8),
    load("flarefish", 8),
    load("flare-bloom", 8),
    load("trench-walls", 19),
  ]);
  return {
    glimmerfin,
    drifter,
    lanternjaw,
    gloamfin,
    flarefish,
    flareBloom,
    trenchWalls,
  };
}

function register(api: InitApi<FathomState>): void {
  for (const action of ACTIONS)
    api.input.register(action, { keys: [...BINDINGS[action as ActionName]] });
  api.audio.define(CUES.eat, {
    wave: "triangle",
    freq: 740,
    freqTo: 1120,
    durationMs: 80,
    gain: 0.12,
  });
  api.audio.define(CUES.sonar, {
    wave: "sine",
    freq: 300,
    freqTo: 680,
    durationMs: 180,
    gain: 0.16,
  });
  api.audio.define(CUES.ink, {
    wave: "sawtooth",
    freq: 120,
    freqTo: 70,
    durationMs: 180,
    gain: 0.12,
  });
  api.audio.define(CUES.predatorPing, {
    wave: "sine",
    freq: 180,
    freqTo: 420,
    durationMs: 220,
    gain: 0.14,
  });
  api.audio.define(CUES.flare, {
    wave: "square",
    freq: 90,
    freqTo: 640,
    durationMs: 240,
    gain: 0.12,
  });
  api.audio.define(CUES.caught, {
    wave: "sawtooth",
    freq: 180,
    freqTo: 55,
    durationMs: 260,
    gain: 0.18,
  });
  api.audio.define(CUES.descend, {
    wave: "triangle",
    freq: 420,
    freqTo: 120,
    durationMs: 320,
    gain: 0.16,
  });
  api.diagnostics.register("screen", (s) => s.screen);
  api.diagnostics.register("depth", (s) => s.depth);
  api.diagnostics.register("score", (s) => s.score);
  api.diagnostics.register("lives", (s) => s.lives);
  api.diagnostics.register("G", (s) => s.brightness);
  api.diagnostics.register("V", (s) => s.visionRadius);
  api.diagnostics.register("R", (s) => s.windowRadius);
  api.diagnostics.register("sonar", (s) => s.sonar.cooldown);
  api.diagnostics.register("ink", (s) => s.ink.cooldown);
  api.diagnostics.register("plankton", (s) => s.planktonRemaining);
  api.diagnostics.register(
    "forager",
    (s) => `${s.forager.tx},${s.forager.ty} ${s.forager.dir}`,
  );
  api.diagnostics.register("predators", (s) =>
    s.predators
      .map(
        (p) =>
          `${p.kind}:${p.state}@${p.tx},${p.ty}/${Math.round(p.speed)}${p.alert ? "!" : ""}`,
      )
      .join(" "),
  );
}

export const game: Game<FathomState, FathomDebugApi> = {
  async initialize(
    api: InitApi<FathomState>,
  ): Promise<[FathomState, FathomDebugApi]> {
    register(api);
    const assets = await loadFrames(api);
    return [baseState(assets, false), debugApi()];
  },

  update(
    state: DeepReadonly<FathomState>,
    api: UpdateApi,
    dt: number,
  ): FathomState {
    const cues = new Set<string>();
    let next = readInput(withDerived(asState(state)), api);
    next = {
      ...next,
      muted: api.audio.muted(),
      accumulator: next.accumulator + Math.min(0.25, Math.max(0, dt)),
    };
    while (next.accumulator >= TICK_DT) {
      next = {
        ...tick(next, api, cues),
        accumulator: next.accumulator - TICK_DT,
      };
    }
    for (const cue of cues) api.audio.play(cue);
    return withDerived(next);
  },

  render(state: DeepReadonly<FathomState>, api: RenderApi): void {
    const ctx = api.ctx;
    ctx.imageSmoothingEnabled = false;
    if (
      state.screen === "title" ||
      state.screen === "howto" ||
      state.screen === "gameover"
    ) {
      drawScreens(state, ctx);
      return;
    }
    drawMaze(state, ctx);
    drawEffects(state, ctx);
    drawCreatures(state, ctx);
    drawHud(state, ctx);
    if (state.screen === "countdown") {
      drawText(ctx, "DIVE", STAGE_W / 2, 310, 54);
      drawText(
        ctx,
        String(Math.max(1, Math.ceil(state.countdown))),
        STAGE_W / 2,
        380,
        72,
        "center",
        "#ffb24f",
      );
    } else if (state.screen === "paused") {
      ctx.fillStyle = "rgba(0,4,10,0.58)";
      ctx.fillRect(0, 0, STAGE_W, STAGE_H);
      drawText(ctx, "PAUSED", STAGE_W / 2, 280, 48);
      drawMenu(state, ctx);
    } else if (state.screen === "cleared") {
      ctx.fillStyle = "rgba(0,4,10,0.46)";
      ctx.fillRect(0, 0, STAGE_W, STAGE_H);
      drawText(
        ctx,
        `DEPTH ${state.depth} CLEARED`,
        STAGE_W / 2,
        330,
        48,
        "center",
        "#ffdda8",
      );
    }
  },
};
