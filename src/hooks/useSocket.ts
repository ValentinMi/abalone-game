import { useRef, useState, useCallback, useEffect } from 'react';
import type { ClientMessage, ServerMessage } from '../../server/protocol.ts';

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected';

type UseSocketOptions = {
  onMessage: (msg: ServerMessage) => void;
};

export function useSocket({ onMessage }: UseSocketOptions) {
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const wsRef = useRef<WebSocket | null>(null);
  const retriesRef = useRef(0);
  const maxRetries = 5;
  const onMessageRef = useRef(onMessage);
  const connectRef = useRef<() => void>(null);

  useEffect(() => {
    onMessageRef.current = onMessage;
  });

  const createConnection = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setStatus('connecting');

    const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${location.host}/ws`);
    wsRef.current = ws;

    ws.onopen = () => {
      setStatus('connected');
      retriesRef.current = 0;
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data as string) as ServerMessage;
        onMessageRef.current(msg);
      } catch {
        void 0;
      }
    };

    ws.onclose = () => {
      wsRef.current = null;
      setStatus('disconnected');

      if (retriesRef.current < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, retriesRef.current), 16000);
        retriesRef.current++;
        setTimeout(() => {
          if (!wsRef.current) {
            connectRef.current?.();
          }
        }, delay);
      }
    };

    ws.onerror = () => {
    };
  }, []);

  useEffect(() => {
    connectRef.current = createConnection;
  });

  const disconnect = useCallback(() => {
    retriesRef.current = maxRetries;
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setStatus('disconnected');
  }, []);

  const send = useCallback((msg: ClientMessage) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(msg));
    }
  }, []);

  useEffect(() => {
    return () => {
      retriesRef.current = maxRetries;
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  return { status, connect: createConnection, disconnect, send };
}
