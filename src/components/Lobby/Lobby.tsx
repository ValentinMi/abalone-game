import { useState } from 'react';

type LobbyProps = {
  onLocalGame: () => void;
  onCreateRoom: () => void;
  onJoinRoom: (code: string) => void;
};

export function Lobby({ onLocalGame, onCreateRoom, onJoinRoom }: LobbyProps) {
  const [joinCode, setJoinCode] = useState('');
  const [showJoinInput, setShowJoinInput] = useState(false);

  const handleJoin = () => {
    const code = joinCode.trim().toUpperCase();
    if (code.length === 4) {
      onJoinRoom(code);
    }
  };

  return (
    <div className="lobby">
      <h1 className="app-title">ABALONE</h1>
      <div className="lobby-subtitle">ONLINE</div>
      <div className="lobby-buttons">
        <button className="lobby-btn" onClick={onLocalGame}>
          LOCAL GAME
        </button>
        <button className="lobby-btn lobby-btn--primary" onClick={onCreateRoom}>
          CREATE ROOM
        </button>
        {!showJoinInput ? (
          <button className="lobby-btn" onClick={() => setShowJoinInput(true)}>
            JOIN ROOM
          </button>
        ) : (
          <div className="lobby-join">
            <input
              className="lobby-input"
              type="text"
              placeholder="CODE"
              maxLength={4}
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
              autoFocus
            />
            <button
              className="lobby-btn lobby-btn--small"
              onClick={handleJoin}
              disabled={joinCode.trim().length !== 4}
            >
              GO
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
