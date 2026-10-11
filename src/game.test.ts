import { describe, expect, it } from "vitest";
import type { InitApi, UpdateApi } from "@clockwyrks/simple-2d";
import { TICK_DT } from "./constants";
import { game, type FathomState } from "./game";

function initApi(): InitApi<FathomState> {
  return {
    input: {
      register: () => undefined,
      layout: () => null,
    },
    audio: {
      define: () => undefined,
      load: async () => undefined,
    },
    assets: {
      loadImage: async () => ({ width: 32, height: 32 }) as ImageBitmap,
      loadAudio: async () => ({}) as AudioBuffer,
      load: async () => new Blob(),
      resolve: (path) => `assets/${path}`,
    },
    diagnostics: {
      register: () => undefined,
    },
    events: {
      on: () => () => undefined,
    },
    viewport: () => ({
      width: 1280,
      height: 720,
      scale: 1,
      offsetX: 0,
      offsetY: 0,
    }),
  };
}

function updateApi(
  pressed = new Set<string>(),
  held = new Set<string>(),
): UpdateApi {
  let muted = false;
  return {
    input: {
      value: (name) => (held.has(name) ? 1 : 0),
      pressed: (name) => pressed.delete(name),
      pointer: () => ({
        x: 0,
        y: 0,
        down: false,
        device: "mouse",
        buttons: [],
      }),
      pointerPressed: () => false,
      pointerReleased: () => false,
      pointerSamples: () => [],
      pointerContacts: () => [],
      wheel: () => ({ x: 0, y: 0 }),
    },
    audio: {
      play: () => undefined,
      loop: () => undefined,
      stop: () => undefined,
      looping: () => false,
      setMuted: (value) => {
        muted = value;
      },
      muted: () => muted,
    },
    frame: () => ({ count: 0, timeMs: 0, lastDeltaMs: 0 }),
    viewport: () => ({
      width: 1280,
      height: 720,
      scale: 1,
      offsetX: 0,
      offsetY: 0,
    }),
  };
}

describe("Fathom game core", () => {
  it("initializes the title state and JSON snapshot", async () => {
    const [state, debug] = await game.initialize(initApi());
    const snap = debug.snapshot(state);

    expect(snap.version).toBe(1);
    expect(snap.screen).toBe("title");
    expect(snap.menuIndex).toBe(0);
    expect(snap.depth).toBe(1);
    expect(snap.predators.map((p) => p.kind)).toEqual([
      "lanternjaw",
      "gloamfin",
      "flarefish",
    ]);
    expect(snap.planktonRemaining).toBeGreaterThan(100);
  });

  it("debug poses reconcile derived values", async () => {
    const [state, debug] = await game.initialize(initApi());
    const bright = debug.setBrightness(state, 1);
    const deeper = debug.setDepth(bright, 4);

    expect(deeper.visionRadius).toBe(160);
    expect(deeper.windowRadius).toBe(320);
    expect(deeper.sonar.range).toBe(6);
    expect(deeper.predators).toHaveLength(6);
  });

  it("advances countdown and enters play on fixed ticks", async () => {
    const [state, debug] = await game.initialize(initApi());
    let next = debug.setScreen(debug.reset(state), "countdown");
    const api = updateApi();

    for (let i = 0; i < Math.ceil(2 / TICK_DT) + 1; i += 1) {
      next = game.update(next, api, TICK_DT);
    }

    expect(next.screen).toBe("playing");
    expect(next.simTime).toBeGreaterThanOrEqual(2);
  });
});
