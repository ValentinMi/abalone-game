# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Full-stack implementation of the Abalone board game (two-player abstract strategy) using React 19, TypeScript, and Vite. Supports local and online multiplayer via WebSocket. Features a dark retro pixel-art aesthetic with the Press Start 2P font.

## Commands

```bash
npm run dev          # Start Vite client + WebSocket server concurrently
npm run dev:client   # Vite dev server only
npm run dev:server   # WebSocket server only (tsx watch)
npm run build        # TypeScript type-check (tsc -b) then Vite bundle
npm run start        # Run server in production
npm run lint         # ESLint (flat config) across entire project
npm run preview      # Serve production build locally
```

No test runner is configured.

## Architecture

### Code Organization

- **`src/logic/`** — Pure game logic functions, no React dependencies
  - `board.ts`: Board initialization (`createInitialBoard`), `getAllHexes` (61 hex positions, radius 4)
  - `moves.ts`: Move validation and generation — inline moves (with sumito pushing), broadside moves; `generateValidMoves`
  - `game.ts`: Game state reducer (`gameReducer`) handling all actions including `SET_SERVER_STATE` for multiplayer sync
- **`src/components/`** — React components
  - `Board.tsx`: SVG board rendering with highlight derivation for destinations, pushed, pushed-off marbles
  - `HexCell.tsx`, `Marble.tsx`: Individual hex cell and 3D-style marble rendering
  - `ScoreBoard.tsx`, `TurnIndicator.tsx`, `GameOverDialog.tsx`: Game HUD elements
  - `Lobby.tsx`: Main menu — local game, create room, join room with code
  - `RoomWaiting.tsx`: Waiting screen showing room code with copy-to-clipboard
  - `Chat.tsx`: Collapsible multiplayer chat panel with unread badge
  - `ConnectionStatus.tsx`: WebSocket connection indicator (connected/connecting/disconnected)
- **`src/hooks/`** — React custom hooks
  - `useGameState.ts`: Central game state via `useReducer`; supports `OnlineConfig` for multiplayer
  - `useSocket.ts`: WebSocket connection management with auto-reconnect (exponential backoff, max 5 retries)
- **`src/utils/`** — Coordinate math (`hex.ts`: axial operations, hex-to-pixel, collinear/contiguous checks, direction normalization) and SVG helpers (`svg.ts`)
- **`src/styles/`** — CSS: `global.css`, `multiplayer.css`, `scanlines.css`
- **`src/types.ts`** — All shared TypeScript types (`Hex`, `Board`, `GameState`, `SerializedGameState`, `Action`, `Move`, `Player`)
- **`src/constants.ts`** — Game constants: `BOARD_RADIUS`, `HEX_DIRECTIONS`, `HEX_SIZE`, `PALETTE`, `SCORE_TO_WIN`

### Server (`server/`)

WebSocket server (port 3001) for online multiplayer:

- `index.ts`: HTTP + WebSocket server, room lifecycle management, message routing
- `protocol.ts`: Client/server message type definitions (create_room, join_room, reconnect, execute_move, chat, etc.)
- `Room.ts`: Room class — 2 players max, 60-second disconnect grace period, 30-minute inactivity expiry
- `GameSession.ts`: Server-side game state using `gameReducer`, validates moves (turn order, marble ownership, move legality)
- `utils.ts`: Room code generation (4-char, ambiguity-free), player ID generation, board serialization

### Deployment

- **Dockerfile**: Multi-stage build — Node 22 Alpine for build/server, Nginx Alpine for client static files
- **docker-compose.yml**: Two services: `client` (Nginx, port 80) and `server` (Node, port 3001)
- **docker/nginx.conf**: SPA fallback routing, `/ws` proxy to server for WebSocket upgrade

### Key Patterns

- **Hex coordinates**: Axial system `{q, r}` with `HexKey` string serialization (`"q,r"`) for Map keys
- **State management**: `useReducer` with action types: `SELECT_MARBLE`, `DESELECT_MARBLE`, `CLEAR_SELECTION`, `EXECUTE_MOVE`, `NEW_GAME`, `SET_SERVER_STATE`
- **Board representation**: `Map<HexKey, Player | null>` where `null` means empty position
- **Rendering**: SVG-based board with click handlers on hex cells; CSS animations for selected state
- **Player type**: Const object pattern (`Player.Black = 'B'`, `Player.White = 'W'`) used as both value and type
- **Multiplayer**: Client sends moves via WebSocket → server validates with `GameSession` → broadcasts `game_state` to both players
- **Vite proxy**: Dev mode proxies `/ws` to `ws://localhost:3001`

### Game Rules

- 14 marbles per player; win by pushing 6 opponent marbles off the board
- Select 1–3 collinear, contiguous own marbles
- Inline moves push along alignment axis; sumito rule allows N marbles to push up to N−1 opponents
- Broadside moves shift perpendicular to alignment; no pushing allowed

## TypeScript Configuration

Three tsconfig references: `tsconfig.app.json` (client, ES2022), `tsconfig.node.json` (Vite tooling, ES2023), `tsconfig.server.json` (server, ES2022 — includes `server/`, shared `src/types`, `src/logic`, `src/utils/hex`, `src/constants`). All have strict mode fully enabled with `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`, `verbatimModuleSyntax`.
