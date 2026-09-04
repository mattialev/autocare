import { useMemo, useState } from 'react';
import { Check, Plus, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useVehicle } from '../hooks/useVehicle';
import { buildDeadlines } from '../utils/deadlines';
import { formatDate, formatKm, relativeDueLabel } from '../utils/format';
import { StatusBadge } from '../components/StatusBadge';
import type { DeadlineKind } from '../types';
import { Modal } from '../components/Modal';
import { ReminderForm } from '../components/forms/ReminderForm';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { DeadlineDetail } from '../components/DetailViews';
import { MaintenanceForm } from '../components/forms/MaintenanceForm';
import { todayISO } from '../utils/deadlines';

const filters: Array<DeadlineKind | 'tutte'> = ['tutte', 'manutenzione', 'documenti', 'assicurazione', 'bollo', 'revisione', 'evento'];

export const DeadlinesPage = () => {
  const { data, addReminder, completeReminder, completeReminderWithMaintenance, deleteReminder } = useApp();
  const { vehicle } = useVehicle();
  const [filter, setFilter] = useState<DeadlineKind | 'tutte'>('tutte');
  const [open, setOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [completeId, setCompleteId] = useState<string | null>(null);
  const [completeWithMaintenance, setCompleteWithMaintenance] = useState(false);
  const deadlines = useMemo(() => buildDeadlines(data, vehicle!.id).filter((item) => filter === 'tutte' || item.kind === filter), [data, vehicle, filter]);
  const reminders = data.reminders.filter((item) => item.vehicleId === vehicle!.id);
  const detailDeadline = deadlines.find((item) => item.id === detailId);
  const detailReminder = detailDeadline ? reminders.find((item) => item.id === detailDeadline.sourceId) : undefined;
  const detailMaintenance = detailDeadline ? data.maintenanceRecords.find((item) => item.id === detailDeadline.sourceId) : undefined;
  const detailDocument = detailDeadline ? data.documents.find((item) => item.id === detailDeadline.sourceId) : undefined;
  const completingReminder = completeId ? reminders.find((item) => item.id === completeId) : undefined;

  return (
    <>
      <section className="page-heading"><div><h1>Scadenze</h1><p>Manutenzioni, documenti, assicurazione, bollo, revisione e promemoria.</p></div><button className="button button-primary" onClick={() => setOpen(true)}><Plus size={18} /> Imposta scadenza</button></section>
      <div className="tabs">{filters.map((item) => <button key={item} className={filter === item ? 'active' : ''} onClick={() => setFilter(item)}>{item}</button>)}</div>
      <section className="table-card">
        <table><thead><tr><th>Scadenza</th><th>Tipo</th><th>Data</th><th>Km indicativi</th><th>Stato</th><th /></tr></thead><tbody>{deadlines.map((item) => {
          const reminder = reminders.find((candidate) => candidate.id === item.sourceId);
          return <tr className="clickable-row" key={item.id} onClick={() => setDetailId(item.id)}><td><strong>{item.title}</strong><span>{item.dueDate ? relativeDueLabel(item.daysLeft) : 'Promemoria chilometrico'}</span></td><td>{item.kind}</td><td>{formatDate(item.dueDate)}</td><td>{formatKm(item.dueMileage)}</td><td><StatusBadge status={item.status} /></td><td className="table-actions">{reminder ? <><button className="icon-button" aria-label="Completa" onClick={(event) => { event.stopPropagation(); setCompleteId(item.sourceId); setCompleteWithMaintenance(false); }}><Check size={17} /></button><button className="icon-button" aria-label="Elimina" onClick={(event) => { event.stopPropagation(); setDeleteId(item.sourceId); }}><Trash2 size={17} /></button></> : null}</td></tr>;
        })}</tbody></table>
      </section>
      {open && <Modal title="Imposta scadenza" onClose={() => setOpen(false)}><ReminderForm vehicleId={vehicle!.id} onCancel={() => setOpen(false)} onSubmit={async (draft) => { await addReminder(draft); setOpen(false); }} /></Modal>}
      {detailDeadline && <Modal title="Dettaglio scadenza" onClose={() => setDetailId(null)}><DeadlineDetail deadline={detailDeadline} reminder={detailReminder} maintenance={detailMaintenance} document={detailDocument} /></Modal>}
      {completingReminder && <Modal title="Completa promemoria" onClose={() => { setCompleteId(null); setCompleteWithMaintenance(false); }}>
        {!completeWithMaintenance ? (
          <div className="detail-panel">
            <p className="muted">{completingReminder.title}</p>
            <div className="choice-actions">
              <button className="button button-ghost" type="button" onClick={async () => { await completeReminder(completingReminder.id); setCompleteId(null); }}>Completa e basta</button>
              <button className="button button-primary" type="button" onClick={() => setCompleteWithMaintenance(true)}>Completa e registra manutenzione</button>
            </div>
          </div>
        ) : (
          <MaintenanceForm
            vehicleId={vehicle!.id}
            initialValues={{
              title: completingReminder.title,
              typeName: completingReminder.category === 'manutenzione' ? completingReminder.title : 'Altro',
              performedAt: completingReminder.dueDate || todayISO(),
              mileage: completingReminder.dueMileage || vehicle!.currentMileage,
              notes: completingReminder.notes ? `Creato dal promemoria: ${completingReminder.notes}` : 'Creato da promemoria.',
              isRecurring: false
            }}
            onCancel={() => setCompleteWithMaintenance(false)}
            onSubmit={async (draft) => { await completeReminderWithMaintenance(completingReminder.id, draft); setCompleteId(null); setCompleteWithMaintenance(false); }}
          />
        )}
      </Modal>}
      <ConfirmDialog open={Boolean(deleteId)} title="Eliminare promemoria?" description="Il promemoria verra rimosso dalle scadenze." onCancel={() => setDeleteId(null)} onConfirm={async () => { if (deleteId) await deleteReminder(deleteId); setDeleteId(null); }} />
    </>
  );
};
