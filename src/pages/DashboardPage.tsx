import { useMemo, useState } from 'react';
import { BellPlus, FileCheck2, Gauge, Plus, Wrench } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Modal } from '../components/Modal';
import { MileageForm } from '../components/forms/MileageForm';
import { MaintenanceForm } from '../components/forms/MaintenanceForm';
import { ReminderForm } from '../components/forms/ReminderForm';
import { StatusBadge } from '../components/StatusBadge';
import { DeadlineDetail } from '../components/DetailViews';
import { useVehicle } from '../hooks/useVehicle';
import { buildDeadlines, hasImportantDocument, maintenanceTotal, upcomingDashboardDeadlines } from '../utils/deadlines';
import { formatCurrency, formatDate, formatKm, relativeDueLabel } from '../utils/format';

export const DashboardPage = () => {
  const { data, updateMileage, addMaintenance, addReminder } = useApp();
  const { vehicle } = useVehicle();
  const [mileageOpen, setMileageOpen] = useState(false);
  const [maintenanceOpen, setMaintenanceOpen] = useState(false);
  const [reminderOpen, setReminderOpen] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const vehicleId = vehicle!.id;
  const deadlines = useMemo(() => upcomingDashboardDeadlines(buildDeadlines(data, vehicleId), vehicle!.currentMileage), [data, vehicleId, vehicle]);
  const detailDeadline = deadlines.find((item) => item.id === detailId);
  const detailReminder = detailDeadline ? data.reminders.find((item) => item.id === detailDeadline.sourceId) : undefined;
  const detailMaintenance = detailDeadline ? data.maintenanceRecords.find((item) => item.id === detailDeadline.sourceId) : undefined;
  const detailDocument = detailDeadline ? data.documents.find((item) => item.id === detailDeadline.sourceId) : undefined;
  const maintenance = data.maintenanceRecords.filter((item) => item.vehicleId === vehicleId);
  const docs = data.documents.filter((item) => item.vehicleId === vehicleId);
  const readings = data.odometerReadings.filter((item) => item.vehicleId === vehicleId);
  const yearlyKm = readings.length >= 2 ? Math.round(((readings[0].mileage - readings[readings.length - 1].mileage) / Math.max(1, readings.length - 1)) * 18) : undefined;

  return (
    <>
      <section className="hero-card">
        <div className="hero-photo">{vehicle!.imageUrl ? <img src={vehicle!.imageUrl} alt={`${vehicle!.make} ${vehicle!.model}`} /> : <Gauge size={40} />}</div>
        <div className="hero-copy">
          <p>{vehicle!.plate || 'Targa non indicata'}</p>
          <h1>{vehicle!.make} {vehicle!.model} {vehicle!.trim}</h1>
          <span>{vehicle!.engine}</span>
        </div>
        <div className="hero-metrics">
          <strong>{formatKm(vehicle!.currentMileage)}</strong>
          <span>Aggiornati il {formatDate(vehicle!.mileageUpdatedAt)}</span>
        </div>
        <div className="hero-actions">
          <button className="button button-ghost" type="button" onClick={() => setMileageOpen(true)}>Aggiorna km</button>
          <button className="button button-ghost" type="button" onClick={() => setReminderOpen(true)}><BellPlus size={18} /> Imposta scadenza</button>
          <button className="button button-primary" type="button" onClick={() => setMaintenanceOpen(true)}><Plus size={18} /> Nuovo intervento</button>
        </div>
      </section>
      <section className="dashboard-grid">
        <article className="card card-span-2">
          <h2>Nei prossimi 60 giorni</h2>
          <div className="deadline-list">
            {deadlines.length ? deadlines.map((item) => (
              <button className="deadline-row clickable-deadline" key={item.id} type="button" onClick={() => setDetailId(item.id)}>
                <div><strong>{item.title}</strong><span>{item.dueDate ? `${formatDate(item.dueDate)} - ${relativeDueLabel(item.daysLeft)}` : `al raggiungimento di ${formatKm(item.dueMileage)}`}</span></div>
                <StatusBadge status={item.status} />
              </button>
            )) : <p className="muted">Nessuna scadenza nei prossimi 60 giorni.</p>}
          </div>
        </article>
        <article className="card">
          <h2>Documenti in evidenza</h2>
          {['Libretto', 'Acquisto', 'Assicurazione', 'Bollo'].map((category) => (
            <p className="check-row" key={category}><FileCheck2 size={17} /> {hasImportantDocument(docs, category) ? '✓' : '•'} {category}</p>
          ))}
        </article>
        <article className="card">
          <h2>Chilometraggio</h2>
          <p className="big-number">{formatKm(vehicle!.currentMileage)}</p>
          <p className="muted">Aggiornati il {formatDate(vehicle!.mileageUpdatedAt)}.</p>
          {yearlyKm && <p className="muted">Media stimata indicativa: {formatKm(yearlyKm)}/anno</p>}
        </article>
        <article className="card card-span-2">
          <h2>Riepilogo manutenzione</h2>
          <p className="big-number">{formatCurrency(maintenanceTotal(maintenance))}</p>
          <p className="muted">Totale storico registrato</p>
          {maintenance.slice(0, 3).map((item) => <p className="timeline-item" key={item.id}><Wrench size={16} /> {item.title} - {formatDate(item.performedAt)} - {formatCurrency(item.cost)}</p>)}
        </article>
      </section>
      {mileageOpen && <Modal title="Aggiorna chilometraggio" onClose={() => setMileageOpen(false)}><MileageForm currentMileage={vehicle!.currentMileage} onCancel={() => setMileageOpen(false)} onSubmit={async (km, date) => { await updateMileage(vehicleId, km, date); setMileageOpen(false); }} /></Modal>}
      {reminderOpen && <Modal title="Imposta scadenza" onClose={() => setReminderOpen(false)}><ReminderForm vehicleId={vehicleId} onCancel={() => setReminderOpen(false)} onSubmit={async (draft) => { await addReminder(draft); setReminderOpen(false); }} /></Modal>}
      {maintenanceOpen && <Modal title="Nuovo intervento" onClose={() => setMaintenanceOpen(false)}><MaintenanceForm vehicleId={vehicleId} onCancel={() => setMaintenanceOpen(false)} onSubmit={async (draft) => { await addMaintenance(draft); setMaintenanceOpen(false); }} /></Modal>}
      {detailDeadline && <Modal title="Dettaglio scadenza" onClose={() => setDetailId(null)}><DeadlineDetail deadline={detailDeadline} reminder={detailReminder} maintenance={detailMaintenance} document={detailDocument} /></Modal>}
    </>
  );
};
