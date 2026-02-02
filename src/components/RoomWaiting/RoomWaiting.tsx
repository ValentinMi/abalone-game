import { useState } from 'react';

type RoomWaitingProps = {
  code: string;
  onCancel: () => void;
};

export function RoomWaiting({ code, onCancel }: RoomWaitingProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      void 0;
    }
  };

  return (
    <div className="room-waiting">
      <h1 className="app-title">ABALONE</h1>
      <div className="room-waiting-label">ROOM CODE</div>
      <button className="room-waiting-code" onClick={handleCopy} title="Click to copy">
        {code}
      </button>
      <div className="room-waiting-copied">
        {copied ? 'COPIED!' : 'CLICK TO COPY'}
      </div>
      <div className="room-waiting-status">WAITING FOR OPPONENT...</div>
      <button className="lobby-btn" onClick={onCancel}>
        CANCEL
      </button>
    </div>
  );
}
