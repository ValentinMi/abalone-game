import { useState, useEffect, useCallback, useRef } from 'react';
import { useGameState } from './hooks/useGameState';
import { useSocket } from './hooks/useSocket';
import { Board } from './components/Board/Board';
import { ScoreBoard } from './components/ScoreBoard/ScoreBoard';
import { TurnIndicator } from './components/TurnIndicator/TurnIndicator';
import { GameOverDialog } from './components/GameOverDialog/GameOverDialog';
import { Lobby } from './components/Lobby/Lobby';
import { RoomWaiting } from './components/RoomWaiting/RoomWaiting';
import { Chat, type ChatMessage } from './components/Chat/Chat';
import { ConnectionStatus } from './components/ConnectionStatus/ConnectionStatus';
import { hexEqual } from './utils/hex';
import type { Hex, Player } from './types';
import type { ServerMessage } from '../server/protocol.ts';
import './styles/global.css';
import './styles/scanlines.css';
import './styles/multiplayer.css';

type Screen = 'lobby' | 'waiting' | 'game';
type GameMode = 'local' | 'online';

export default function App() {
  const [screen, setScreen] = useState<Screen>('lobby');
  const [gameMode, setGameMode] = useState<GameMode>('local');
  const [roomCode, setRoomCode] = useState('');
  const [localPlayer, setLocalPlayer] = useState<Player | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [opponentDisconnected, setOpponentDisconnected] = useState(false);

  const playerIdRef = useRef<string | null>(null);
  const resetRef = useRef<() => void>(null);

  const onlineConfig = gameMode === 'online' && localPlayer ? {
    send: (msg: Parameters<typeof send>[0]) => send(msg),
    localPlayer,
  } : undefined;

  const { state, selectMarble, deselectMarble, clearSelection, executeMove, newGame, applyServerState } =
    useGameState(onlineConfig);

  const showError = useCallback((message: string) => {
    setError(message);
    setTimeout(() => setError(null), 3000);
  }, []);

  const handleServerMessage = useCallback((msg: ServerMessage) => {
    switch (msg.type) {
      case 'room_created':
        setRoomCode(msg.code);
        playerIdRef.current = msg.playerId;
        sessionStorage.setItem('abalone_playerId', msg.playerId);
        sessionStorage.setItem('abalone_roomCode', msg.code);
        setScreen('waiting');
        break;

      case 'room_joined':
        setRoomCode(msg.code);
        setLocalPlayer(msg.player);
        playerIdRef.current = msg.playerId;
        sessionStorage.setItem('abalone_playerId', msg.playerId);
        sessionStorage.setItem('abalone_roomCode', msg.code);
        break;

      case 'opponent_joined':
        break;

      case 'game_start':
        setLocalPlayer(msg.player);
        applyServerState(msg.state);
        setScreen('game');
        setOpponentDisconnected(false);
        break;

      case 'game_state':
        applyServerState(msg.state);
        break;

      case 'move_rejected':
        showError(msg.reason);
        break;

      case 'chat':
        setChatMessages(prev => [...prev, {
          text: msg.text,
          from: msg.from,
          timestamp: msg.timestamp,
        }]);
        break;

      case 'opponent_disconnected':
        setOpponentDisconnected(true);
        break;

      case 'opponent_reconnected':
        setOpponentDisconnected(false);
        break;

      case 'room_closed':
        showError(`Room closed: ${msg.reason}`);
        resetRef.current?.();
        break;

      case 'error':
        showError(msg.message);
        break;
    }
  }, [applyServerState, showError]);

  const { status: connectionStatus, connect, disconnect, send } = useSocket({
    onMessage: handleServerMessage,
  });

  const resetToLobby = useCallback(() => {
    disconnect();
    setScreen('lobby');
    setGameMode('local');
    setRoomCode('');
    setLocalPlayer(null);
    setChatMessages([]);
    setOpponentDisconnected(false);
    playerIdRef.current = null;
    sessionStorage.removeItem('abalone_playerId');
    sessionStorage.removeItem('abalone_roomCode');
    newGame();
  }, [disconnect, newGame]);

  useEffect(() => {
    resetRef.current = resetToLobby;
  });

  const handleLocalGame = () => {
    setGameMode('local');
    newGame();
    setScreen('game');
  };

  const handleCreateRoom = () => {
    setGameMode('online');
    connect();
    setTimeout(() => {
      send({ type: 'create_room' });
    }, 500);
  };

  const handleJoinRoom = (code: string) => {
    setGameMode('online');
    connect();
    setTimeout(() => {
      send({ type: 'join_room', code });
    }, 500);
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') clearSelection();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [clearSelection]);

  const handleCellClick = (hex: Hex) => {
    const isSelected = state.selectedMarbles.some(m => hexEqual(m, hex));
    if (isSelected) {
      deselectMarble(hex);
    } else {
      selectMarble(hex);
    }
  };

  const handleChatSend = (text: string) => {
    send({ type: 'chat', text });
  };

  useEffect(() => {
    const savedPlayerId = sessionStorage.getItem('abalone_playerId');
    const savedRoomCode = sessionStorage.getItem('abalone_roomCode');
    if (savedPlayerId && savedRoomCode) {
      setGameMode('online');
      playerIdRef.current = savedPlayerId;
      setRoomCode(savedRoomCode);
      connect();
      setTimeout(() => {
        send({ type: 'reconnect', code: savedRoomCode, playerId: savedPlayerId });
      }, 500);
    }
  }, []);

  if (screen === 'lobby') {
    return (
      <Lobby
        onLocalGame={handleLocalGame}
        onCreateRoom={handleCreateRoom}
        onJoinRoom={handleJoinRoom}
      />
    );
  }

  if (screen === 'waiting') {
    return (
      <>
        <RoomWaiting code={roomCode} onCancel={resetToLobby} />
        <ConnectionStatus status={connectionStatus} />
        {error && <div className="error-toast">{error}</div>}
      </>
    );
  }

  return (
    <div className="app">
      <h1 className="app-title">ABALONE</h1>
      <div className="game-info">
        <ScoreBoard scores={state.scores} />
        <TurnIndicator currentPlayer={state.currentPlayer} />
        {gameMode === 'online' && localPlayer && (
          <div className={`online-player-label ${
            state.currentPlayer === localPlayer ? 'online-player-label--you' : ''
          }`}>
            {state.currentPlayer === localPlayer ? 'YOUR TURN' : 'OPPONENT\'S TURN'}
          </div>
        )}
      </div>
      {opponentDisconnected && (
        <div className="opponent-status">OPPONENT DISCONNECTED</div>
      )}
      <Board
        board={state.board}
        selectedMarbles={state.selectedMarbles}
        validMoves={state.validMoves}
        onCellClick={handleCellClick}
        onExecuteMove={executeMove}
      />
      {gameMode === 'local' ? (
        <button className="btn-new-game" onClick={newGame}>
          NEW GAME
        </button>
      ) : (
        <button className="btn-back" onClick={resetToLobby}>
          LEAVE GAME
        </button>
      )}
      {state.winner && (
        <GameOverDialog
          winner={state.winner}
          onNewGame={gameMode === 'local' ? newGame : resetToLobby}
        />
      )}
      {gameMode === 'online' && (
        <>
          <ConnectionStatus status={connectionStatus} />
          {localPlayer && (
            <Chat
              messages={chatMessages}
              onSend={handleChatSend}
              localPlayer={localPlayer}
            />
          )}
        </>
      )}
      {error && <div className="error-toast">{error}</div>}
    </div>
  );
}
