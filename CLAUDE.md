# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Web-based implementation of the Abalone board game (two-player abstract strategy) using React 19, TypeScript, and Vite. Features a dark retro pixel-art aesthetic with the Press Start 2P font.

## Commands

```bash
npm run dev       # Start Vite dev server with HMR
npm run build     # TypeScript type-check (tsc -b) then Vite bundle
npm run lint      # ESLint (flat config) across entire project
npm run preview   # Serve production build locally
```

No test runner is configured.

## Architecture

### Code Organization

- **`src/logic/`** — Pure game logic functions, no React dependencies
  - `board.ts`: Board initialization, hex-key conversion, position queries (61 hex positions, radius 4)
  - `moves.ts`: Move validation and generation — inline moves (with sumito pushing), broadside moves
  - `game.ts`: Game state reducer (`gameReducer`) handling all actions
- **`src/components/`** — Stateless presentational React components (Board, HexCell, Marble, ScoreBoard, TurnIndicator, GameOverDialog)
- **`src/hooks/useGameState.ts`** — Central game state management via `useReducer`, wires logic to UI
- **`src/utils/`** — Coordinate math (`hex.ts`: axial coordinate operations, hex-to-pixel) and SVG helpers (`svg.ts`)
- **`src/types.ts`** — All shared TypeScript types (`Hex`, `Board`, `GameState`, `Action`, `Move`, `Player`)
- **`src/constants.ts`** — Game constants: `BOARD_RADIUS`, `HEX_DIRECTIONS`, `HEX_SIZE`, `PALETTE`, `SCORE_TO_WIN`

### Key Patterns

- **Hex coordinates**: Axial system `{q, r}` with `HexKey` string serialization for Map keys
- **State management**: `useReducer` with action types: `SELECT_MARBLE`, `DESELECT_MARBLE`, `CLEAR_SELECTION`, `EXECUTE_MOVE`, `NEW_GAME`
- **Board representation**: `Map<HexKey, Player | null>` where `null` means empty position
- **Rendering**: SVG-based board with click handlers on hex cells; CSS animations for selected state
- **Player type**: Const object pattern (`Player.Black = 'B'`, `Player.White = 'W'`) used as both value and type

### Game Rules

- 14 marbles per player; win by pushing 6 opponent marbles off the board
- Select 1–3 collinear, contiguous own marbles
- Inline moves push along alignment axis; sumito rule allows N marbles to push up to N−1 opponents
- Broadside moves shift perpendicular to alignment; no pushing allowed

## TypeScript Configuration

Strict mode is fully enabled. Notable strict settings: `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`, `verbatimModuleSyntax`. Target is ES2022 for app code.
