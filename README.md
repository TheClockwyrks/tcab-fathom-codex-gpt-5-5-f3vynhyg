# Fathom

**Fathom** is a bioluminescent deep-sea maze chase for the browser. You guide a
small glowing forager through a pitch-dark trench, eating plankton, remembering
the maze through fog of war, and surviving three predators that hunt by light,
sound, and flare.

This is the Kindle dive: explored ground is only visible through the forager's
circular vision window. Outside it, even remembered corridors fall back into
black water until you swim close again.

## Install

```sh
npm ci
```

## Run In Development

```sh
npm run dev
```

Open the local Vite URL it prints. The game runs entirely in the browser and
loads its art from the local `assets/` folder.

## Build

```sh
npm run build
```

The static production site is emitted to `dist/`, with `dist/index.html` as the
entry point. It can be served from a static host at the root or under a subpath.

## Controls

- Move: Arrow keys or WASD
- Sonar pulse: Space
- Ink cloud: Shift
- Pause or back: Esc
- Pause alternate: P
- Mute: M
- Menus: Up/Down and Enter or Space, plus pointer/touch selection

## Checks

```sh
npm run typecheck
npm run lint
npm run format
npm test
```
