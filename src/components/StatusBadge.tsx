import type { DeadlineStatus } from '../types';

const labels: Record<DeadlineStatus, string> = {
  ok: 'Tutto ok',
  info: 'Informativo',
  soon: 'Vicino',
  expired: 'Scaduto'
};

export const StatusBadge = ({ status }: { status: DeadlineStatus }) => <span className={`badge badge-${status}`}>{labels[status]}</span>;
