import { createServer } from 'http';
import { WebSocketServer, type WebSocket } from 'ws';
import { Room } from './Room.ts';
import { generateRoomCode } from './utils.ts';
import type { ClientMessage } from './protocol.ts';

const PORT = Number(process.env.PORT) || 3001;

const rooms = new Map<string, Room>();

function createUniqueRoomCode(): string {
  let code: string;
  let attempts = 0;
  do {
    code = generateRoomCode();
    attempts++;
  } while (rooms.has(code) && attempts < 100);
  return code;
}

function destroyRoom(code: string) {
  rooms.delete(code);
  console.log(`[room:${code}] destroyed (${rooms.size} rooms active)`);
}

setInterval(() => {
  const now = Date.now();
  for (const [code, room] of rooms) {
    if (now - room.lastActivityTime > 30 * 60_000) {
      console.log(`[room:${code}] expired due to inactivity`);
      room.destroy('Room expired due to inactivity');
    }
  }
}, 60_000);

const server = createServer((_req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ status: 'ok', rooms: rooms.size }));
});

const wss = new WebSocketServer({ server });

const wsToRoom = new WeakMap<WebSocket, Room>();

wss.on('connection', (ws: WebSocket) => {
  ws.on('message', (data: Buffer) => {
    let msg: ClientMessage;
    try {
      msg = JSON.parse(data.toString()) as ClientMessage;
    } catch {
      ws.send(JSON.stringify({ type: 'error', message: 'Invalid JSON' }));
      return;
    }

    switch (msg.type) {
      case 'create_room': {
        if (wsToRoom.has(ws)) {
          ws.send(JSON.stringify({ type: 'error', message: 'Already in a room' }));
          return;
        }

        const code = createUniqueRoomCode();
        const room = new Room(code, destroyRoom);
        rooms.set(code, room);

        const result = room.addPlayer(ws);
        if (!result) {
          ws.send(JSON.stringify({ type: 'error', message: 'Failed to create room' }));
          return;
        }

        wsToRoom.set(ws, room);
        ws.send(JSON.stringify({
          type: 'room_created',
          code,
          playerId: result.playerId,
        }));

        console.log(`[room:${code}] created (${rooms.size} rooms active)`);
        break;
      }

      case 'join_room': {
        if (wsToRoom.has(ws)) {
          ws.send(JSON.stringify({ type: 'error', message: 'Already in a room' }));
          return;
        }

        const code = msg.code.toUpperCase().trim();
        const room = rooms.get(code);

        if (!room) {
          ws.send(JSON.stringify({ type: 'error', message: 'Room not found' }));
          return;
        }

        if (room.playerCount >= 2) {
          ws.send(JSON.stringify({ type: 'error', message: 'Room is full' }));
          return;
        }

        const result = room.addPlayer(ws);
        if (!result) {
          ws.send(JSON.stringify({ type: 'error', message: 'Failed to join room' }));
          return;
        }

        wsToRoom.set(ws, room);
        ws.send(JSON.stringify({
          type: 'room_joined',
          code,
          playerId: result.playerId,
          player: result.player,
        }));

        console.log(`[room:${code}] player joined (${room.playerCount}/2)`);
        break;
      }

      case 'reconnect': {
        const code = msg.code.toUpperCase().trim();
        const room = rooms.get(code);

        if (!room) {
          ws.send(JSON.stringify({ type: 'error', message: 'Room not found' }));
          return;
        }

        const success = room.reconnect(ws, msg.playerId);
        if (!success) {
          ws.send(JSON.stringify({ type: 'error', message: 'Reconnection failed' }));
          return;
        }

        wsToRoom.set(ws, room);
        console.log(`[room:${code}] player reconnected`);
        break;
      }

      case 'execute_move':
      case 'chat': {
        const room = wsToRoom.get(ws);
        if (!room) {
          ws.send(JSON.stringify({ type: 'error', message: 'Not in a room' }));
          return;
        }
        room.handleMessage(ws, msg);
        break;
      }

      default:
        ws.send(JSON.stringify({ type: 'error', message: 'Unknown message type' }));
    }
  });

  ws.on('close', () => {
    const room = wsToRoom.get(ws);
    if (room) {
      room.handleDisconnect(ws);
    }
  });
});

server.listen(PORT, () => {
  console.log(`Abalone server listening on port ${PORT}`);
});
