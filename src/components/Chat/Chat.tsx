import { useState, useRef, useEffect } from 'react';
import type { Player } from '../../types';
import { Player as PlayerConst } from '../../types';

export type ChatMessage = {
  text: string;
  from: Player;
  timestamp: number;
};

type ChatProps = {
  messages: ChatMessage[];
  onSend: (text: string) => void;
  localPlayer: Player;
};

export function Chat({ messages, onSend, localPlayer }: ChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [unread, setUnread] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);
  const prevCountRef = useRef(messages.length);
  const isOpenRef = useRef(isOpen);

  useEffect(() => {
    isOpenRef.current = isOpen;
  });

  useEffect(() => {
    const diff = messages.length - prevCountRef.current;
    if (diff > 0 && !isOpenRef.current) {
      setUnread(u => u + diff);
    }
    prevCountRef.current = messages.length;
  }, [messages.length]);

  useEffect(() => {
    if (listRef.current && isOpen) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages.length, isOpen]);

  const handleOpen = () => {
    setIsOpen(true);
    setUnread(0);
  };

  const handleSend = () => {
    const text = input.trim();
    if (text) {
      onSend(text);
      setInput('');
    }
  };

  if (!isOpen) {
    return (
      <button className="chat-toggle" onClick={handleOpen}>
        CHAT
        {unread > 0 && <span className="chat-badge">{unread}</span>}
      </button>
    );
  }

  return (
    <div className="chat-panel">
      <div className="chat-header">
        <span>CHAT</span>
        <button className="chat-close" onClick={() => setIsOpen(false)}>X</button>
      </div>
      <div className="chat-messages" ref={listRef}>
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`chat-msg ${msg.from === localPlayer ? 'chat-msg--self' : 'chat-msg--other'}`}
          >
            <span
              className="chat-msg-dot"
              style={{
                backgroundColor: msg.from === PlayerConst.Black ? '#3a3a3a' : '#e8e8e8',
              }}
            />
            <span className="chat-msg-text">{msg.text}</span>
          </div>
        ))}
      </div>
      <div className="chat-input-row">
        <input
          className="chat-input"
          type="text"
          placeholder="Type..."
          value={input}
          maxLength={200}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <button className="chat-send" onClick={handleSend}>{'>'}</button>
      </div>
    </div>
  );
}
