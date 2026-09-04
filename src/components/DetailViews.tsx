import type { Deadline, MaintenanceRecord, Reminder, VehicleDocument } from '../types';
import { formatCurrency, formatDate, formatFileSize, formatKm, relativeDueLabel } from '../utils/format';
import { StatusBadge } from './StatusBadge';

export const MaintenanceDetail = ({ record }: { record: MaintenanceRecord }) => (
  <div className="detail-panel">
    <dl className="details">
      <div><dt>Tipo</dt><dd>{record.typeName}</dd></div>
      <div><dt>Data intervento</dt><dd>{formatDate(record.performedAt)}</dd></div>
      <div><dt>Chilometraggio</dt><dd>{formatKm(record.mileage)}</dd></div>
      <div><dt>Officina</dt><dd>{record.workshop || '-'}</dd></div>
      <div><dt>Costo</dt><dd>{formatCurrency(record.cost)}</dd></div>
      <div><dt>Ricorrente</dt><dd>{record.isRecurring ? 'Si' : 'No'}</dd></div>
      <div><dt>Intervallo</dt><dd>{record.intervalMonths ? `${record.intervalMonths} mesi` : '-'} {record.intervalKm ? ` / ${formatKm(record.intervalKm)}` : ''}</dd></div>
      <div><dt>Prossima data</dt><dd>{formatDate(record.nextDueDate)}</dd></div>
      <div><dt>Prossimi km</dt><dd>{formatKm(record.nextDueMileage)}</dd></div>
    </dl>
    <section><h3>Note</h3><p>{record.notes || 'Nessuna nota.'}</p></section>
  </div>
);

export const DeadlineDetail = ({ deadline, reminder, maintenance, document }: { deadline: Deadline; reminder?: Reminder; maintenance?: MaintenanceRecord; document?: VehicleDocument }) => (
  <div className="detail-panel">
    <div className="detail-title">
      <div>
        <p className="muted">{deadline.kind}</p>
        <h3>{deadline.title}</h3>
      </div>
      <StatusBadge status={deadline.status} />
    </div>
    <dl className="details">
      <div><dt>Data</dt><dd>{deadline.dueDate ? formatDate(deadline.dueDate) : 'Non impostata'}</dd></div>
      <div><dt>Quando</dt><dd>{deadline.dueDate ? relativeDueLabel(deadline.daysLeft) : 'Promemoria chilometrico'}</dd></div>
      <div><dt>Km indicativi</dt><dd>{formatKm(deadline.dueMileage)}</dd></div>
      {reminder && <div><dt>Origine</dt><dd>Promemoria manuale</dd></div>}
      {maintenance && <div><dt>Origine</dt><dd>Manutenzione: {maintenance.typeName}</dd></div>}
      {document && <div><dt>Documento</dt><dd>{document.fileName || document.name} ({formatFileSize(document.fileSize)})</dd></div>}
      {reminder?.completedMaintenanceRecordId && <div><dt>Manutenzione collegata</dt><dd>{reminder.completedMaintenanceRecordId}</dd></div>}
    </dl>
    {reminder?.notes && <section><h3>Note</h3><p>{reminder.notes}</p></section>}
    {maintenance?.notes && <section><h3>Note manutenzione</h3><p>{maintenance.notes}</p></section>}
    {document?.description && <section><h3>Note documento</h3><p>{document.description}</p></section>}
  </div>
);
