import { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { useVehicle } from '../hooks/useVehicle';
import { buildDeadlines } from '../utils/deadlines';
import { formatDate, formatKm, relativeDueLabel } from '../utils/format';
import { StatusBadge } from '../components/StatusBadge';
import type { DeadlineKind } from '../types';

const filters: Array<DeadlineKind | 'tutte'> = ['tutte', 'manutenzione', 'documenti', 'assicurazione', 'bollo', 'revisione'];

export const DeadlinesPage = () => {
  const { data } = useApp();
  const { vehicle } = useVehicle();
  const [filter, setFilter] = useState<DeadlineKind | 'tutte'>('tutte');
  const deadlines = useMemo(() => buildDeadlines(data, vehicle!.id).filter((item) => filter === 'tutte' || item.kind === filter), [data, vehicle, filter]);

  return (
    <>
      <section className="page-heading"><div><h1>Scadenze</h1><p>Manutenzioni, documenti, assicurazione, bollo e revisione in ordine cronologico.</p></div></section>
      <div className="tabs">{filters.map((item) => <button key={item} className={filter === item ? 'active' : ''} onClick={() => setFilter(item)}>{item}</button>)}</div>
      <section className="table-card">
        <table><thead><tr><th>Scadenza</th><th>Tipo</th><th>Data</th><th>Km indicativi</th><th>Stato</th></tr></thead><tbody>{deadlines.map((item) => <tr key={item.id}><td><strong>{item.title}</strong><span>{relativeDueLabel(item.daysLeft)}</span></td><td>{item.kind}</td><td>{formatDate(item.dueDate)}</td><td>{formatKm(item.dueMileage)}</td><td><StatusBadge status={item.status} /></td></tr>)}</tbody></table>
      </section>
    </>
  );
};
