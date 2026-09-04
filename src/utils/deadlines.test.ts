import { describe, expect, it } from 'vitest';
import { calculateNextMaintenance, statusForDate, upcomingDeadlines } from './deadlines';
import type { Deadline } from '../types';

describe('maintenance planning', () => {
  it('calcola prossima data e prossimo km da intervalli', () => {
    expect(calculateNextMaintenance('2026-09-15', 42350, 12, 15000)).toEqual({
      nextDueDate: '2027-09-15',
      nextDueMileage: 57350
    });
  });
});

describe('deadline status', () => {
  const now = new Date('2026-09-04T10:00:00Z');

  it('marca scaduto, vicino, informativo e ok', () => {
    expect(statusForDate('2026-09-01', now)).toBe('expired');
    expect(statusForDate('2026-09-15', now)).toBe('soon');
    expect(statusForDate('2026-10-20', now)).toBe('info');
    expect(statusForDate('2027-01-01', now)).toBe('ok');
  });

  it('filtra gli eventi nei prossimi sessanta giorni includendo scaduti', () => {
    const list: Deadline[] = [
      { id: '1', vehicleId: 'v1', kind: 'manutenzione', title: 'A', dueDate: '2026-09-01', status: 'expired', daysLeft: -3, sourceId: '1' },
      { id: '2', vehicleId: 'v1', kind: 'documenti', title: 'B', dueDate: '2026-10-20', status: 'info', daysLeft: 46, sourceId: '2' },
      { id: '3', vehicleId: 'v1', kind: 'bollo', title: 'C', dueDate: '2026-12-20', status: 'ok', daysLeft: 107, sourceId: '3' }
    ];
    expect(upcomingDeadlines(list)).toHaveLength(2);
  });
});
