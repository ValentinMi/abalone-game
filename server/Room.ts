import type { WebSocket } from 'ws';
import type { Player } from '../src/types.ts';
import { Player as PlayerConst } from '../src/types.ts';
import { GameSession } from './GameSession.ts';
import { generatePlayerId } from './utils.ts';
import type { ClientMessage, ServerMessage } from './protocol.ts';

type PlayerSlot = {
  playerId: string;
  player: Player;
  ws: WebSocket | null;
  disconnectTimer: ReturnType<typeof setTimeout> | null;
};

export class Room {
  readonly code: string;
  private slots: PlayerSlot[] = [];
  private game: GameSession | null = null;
  private lastActivity: number = Date.now();
  private onDestroy: (code: string) => void;

  constructor(code: string, onDestroy: (code: string) => void) {
    this.code = code;
    this.onDestroy = onDestroy;
  }

  get playerCount(): number {
    return this.slots.length;
  }

  get isStarted(): boolean {
    return this.game !== null;
  }

  get lastActivityTime(): number {
    return this.lastActivity;
  }

  private touch() {
    this.lastActivity = Date.now();
  }

  private send(ws: WebSocket | null, msg: ServerMessage) {
    if (ws && ws.readyState === 1) {
      ws.send(JSON.stringify(msg));
    }
  }

  private broadcast(msg: ServerMessage) {
    for (const slot of this.slots) {
      this.send(slot.ws, msg);
    }
  }

  private getSlotByWs(ws: WebSocket): PlayerSlot | undefined {
    return this.slots.find(s => s.ws === ws);
  }

  private getSlotByPlayerId(playerId: string): PlayerSlot | undefined {
    return this.slots.find(s => s.playerId === playerId);
  }

  private getOpponent(slot: PlayerSlot): PlayerSlot | undefined {
    return this.slots.find(s => s !== slot);
  }

  addPlayer(ws: WebSocket): { playerId: string; player: Player } | null {
    if (this.slots.length >= 2) return null;

    this.touch();
    const player = this.slots.length === 0 ? PlayerConst.Black : PlayerConst.White;
    const playerId = generatePlayerId();
    this.slots.push({ playerId, player, ws, disconnectTimer: null });

    if (this.slots.length === 2) {
      const firstSlot = this.slots[0];
      this.send(firstSlot.ws, { type: 'opponent_joined' });
      this.startGame();
    }

    return { playerId, player };
  }

  reconnect(ws: WebSocket, playerId: string): boolean {
    const slot = this.getSlotByPlayerId(playerId);
    if (!slot) return false;

    this.touch();

    if (slot.disconnectTimer) {
      clearTimeout(slot.disconnectTimer);
      slot.disconnectTimer = null;
    }

    slot.ws = ws;

    const opponent = this.getOpponent(slot);
    if (opponent) {
      this.send(opponent.ws, { type: 'opponent_reconnected' });
    }

    if (this.game) {
      this.send(ws, {
        type: 'game_start',
        player: slot.player,
        state: this.game.getSerializedState(),
      });
    }

    return true;
  }

  handleDisconnect(ws: WebSocket) {
    const slot = this.getSlotByWs(ws);
    if (!slot) return;

    this.touch();
    slot.ws = null;

    const opponent = this.getOpponent(slot);
    if (opponent) {
      this.send(opponent.ws, { type: 'opponent_disconnected' });
    }

    slot.disconnectTimer = setTimeout(() => {
      this.destroy('Opponent disconnected');
    }, 60_000);
  }

  handleMessage(ws: WebSocket, msg: ClientMessage) {
    const slot = this.getSlotByWs(ws);
    if (!slot) return;

    this.touch();

    switch (msg.type) {
      case 'execute_move': {
        if (!this.game) {
          this.send(ws, { type: 'error', message: 'Game has not started' });
          return;
        }

        const result = this.game.tryMove(msg.move, slot.player);
        if (!result.success) {
          this.send(ws, { type: 'move_rejected', reason: result.reason! });
          return;
        }

        this.broadcast({ type: 'game_state', state: this.game.getSerializedState() });

        if (this.game.winner) {
          setTimeout(() => this.destroy('Game over'), 5 * 60_000);
        }
        break;
      }

      case 'chat': {
        const text = msg.text.trim().slice(0, 500);
        if (!text) return;

        this.broadcast({
          type: 'chat',
          text,
          from: slot.player,
          timestamp: Date.now(),
        });
        break;
      }

      default:
        break;
    }
  }

  private startGame() {
    this.game = new GameSession();
    const state = this.game.getSerializedState();

    for (const slot of this.slots) {
      this.send(slot.ws, {
        type: 'game_start',
        player: slot.player,
        state,
      });
    }
  }

  destroy(reason: string) {
    for (const slot of this.slots) {
      if (slot.disconnectTimer) {
        clearTimeout(slot.disconnectTimer);
      }
      this.send(slot.ws, { type: 'room_closed', reason });
      if (slot.ws) {
        slot.ws.close();
      }
    }

    this.onDestroy(this.code);
  }
}
