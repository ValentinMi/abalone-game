import type { ConnectionStatus as ConnectionStatusType } from '../../hooks/useSocket';

type ConnectionStatusProps = {
  status: ConnectionStatusType;
};

const STATUS_COLORS: Record<ConnectionStatusType, string> = {
  connected: '#00ff88',
  connecting: '#ffcc00',
  disconnected: '#ff2244',
};

const STATUS_LABELS: Record<ConnectionStatusType, string> = {
  connected: 'CONNECTED',
  connecting: 'CONNECTING...',
  disconnected: 'DISCONNECTED',
};

export function ConnectionStatus({ status }: ConnectionStatusProps) {
  return (
    <div className="connection-status">
      <span
        className="connection-dot"
        style={{ backgroundColor: STATUS_COLORS[status] }}
      />
      <span className="connection-label">{STATUS_LABELS[status]}</span>
    </div>
  );
}
