import { useMemo, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useVehicle } from '../hooks/useVehicle';
import { Modal } from '../components/Modal';
import { MaintenanceForm } from '../components/forms/MaintenanceForm';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { EmptyState } from '../components/EmptyState';
import { MaintenanceDetail } from '../components/DetailViews';
import { buildDeadlines } from '../utils/deadlines';
import { formatCurrency, formatDate, formatKm } from '../utils/format';
import { StatusBadge } from '../components/StatusBadge';

export const MaintenancePage = () => {
  const { data, addMaintenance, deleteMaintenance } = useApp();
  const { vehicle } = useVehicle();
  const [tab, setTab] = useState<'overview' | 'history' | 'plans'>('overview');
  const [open, setOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const records = data.maintenanceRecords.filter((item) => item.vehicleId === vehicle!.id);
  const deadlines = useMemo(() => buildDeadlines(data, vehicle!.id).filter((item) => item.kind === 'manutenzione'), [data, vehicle]);
  const selectedRecord = records.find((item) => item.id === selectedRecordId);

  return (
    <>
      <section className="page-heading"><div><h1>Manutenzione</h1><p>Storico, piano ricorrente e prossime scadenze.</p></div><button className="button button-primary" onClick={() => setOpen(true)} type="button"><Plus size={18} /> Nuovo intervento</button></section>
      <div className="tabs"><button className={tab === 'overview' ? 'active' : ''} onClick={() => setTab('overview')}>Panoramica</button><button className={tab === 'history' ? 'active' : ''} onClick={() => setTab('history')}>Storico</button><button className={tab === 'plans' ? 'active' : ''} onClick={() => setTab('plans')}>Piano manutenzione</button></div>
      {tab === 'overview' && <section className="card-grid">{deadlines.map((item) => <button className="card clickable-card" key={item.id} type="button" onClick={() => setSelectedRecordId(item.sourceId)}><h2>{item.title}</h2><p>{formatDate(item.dueDate)}</p><p>{item.dueMileage ? formatKm(item.dueMileage) : 'Km indicativi non impostati'}</p><StatusBadge status={item.status} /></button>)}</section>}
      {tab === 'history' && (records.length ? <section className="table-card"><table><thead><tr><th>Intervento</th><th>Data</th><th>Km</th><th>Officina</th><th>Costo</th><th /></tr></thead><tbody>{records.map((item) => <tr className="clickable-row" key={item.id} onClick={() => setSelectedRecordId(item.id)}><td><strong>{item.title}</strong><span>{item.typeName}</span></td><td>{formatDate(item.performedAt)}</td><td>{formatKm(item.mileage)}</td><td>{item.workshop || '-'}</td><td>{formatCurrency(item.cost)}</td><td><button className="icon-button" onClick={(event) => { event.stopPropagation(); setDeleteId(item.id); }} aria-label="Elimina"><Trash2 size={17} /></button></td></tr>)}</tbody></table></section> : <EmptyState title="Nessun intervento registrato." action={<button className="button button-primary" onClick={() => setOpen(true)}>Aggiungi il primo intervento</button>} />)}
      {tab === 'plans' && <section className="table-card"><table><thead><tr><th>Intervento</th><th>Ultima data</th><th>Intervallo</th><th>Prossima scadenza</th></tr></thead><tbody>{records.filter((item) => item.isRecurring).map((item) => <tr className="clickable-row" key={item.id} onClick={() => setSelectedRecordId(item.id)}><td>{item.title}</td><td>{formatDate(item.performedAt)}</td><td>{item.intervalMonths ? `${item.intervalMonths} mesi` : '-'} {item.intervalKm ? ` / ${formatKm(item.intervalKm)}` : ''}</td><td>{formatDate(item.nextDueDate)}</td></tr>)}</tbody></table></section>}
      {open && <Modal title="Nuovo intervento" onClose={() => setOpen(false)}><MaintenanceForm vehicleId={vehicle!.id} onCancel={() => setOpen(false)} onSubmit={async (draft) => { await addMaintenance(draft); setOpen(false); }} /></Modal>}
      {selectedRecord && <Modal title={selectedRecord.title} onClose={() => setSelectedRecordId(null)}><MaintenanceDetail record={selectedRecord} /></Modal>}
      <ConfirmDialog open={Boolean(deleteId)} title="Eliminare intervento?" description="L'operazione rimuove lo storico di questo intervento." onCancel={() => setDeleteId(null)} onConfirm={async () => { if (deleteId) await deleteMaintenance(deleteId); setDeleteId(null); }} />
    </>
  );
};
