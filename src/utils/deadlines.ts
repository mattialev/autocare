import { addMonths, differenceInCalendarDays, format, isBefore, parseISO } from 'date-fns';
import type {
  AppData,
  Deadline,
  DeadlineStatus,
  DocumentDraft,
  MaintenanceDraft,
  MaintenanceRecord,
  VehicleDocument
} from '../types';

export const todayISO = () => new Date().toISOString().slice(0, 10);

export const calculateNextMaintenance = (
  performedAt: string,
  mileage?: number,
  intervalMonths?: number,
  intervalKm?: number,
  manualDueDate?: string,
  manualDueMileage?: number
) => {
  const nextDueDate = manualDueDate || (intervalMonths ? format(addMonths(parseISO(performedAt), intervalMonths), 'yyyy-MM-dd') : undefined);
  const nextDueMileage = manualDueMileage || (mileage && intervalKm ? mileage + intervalKm : undefined);
  return { nextDueDate, nextDueMileage };
};

export const statusForDate = (dueDate: string, now = new Date()): DeadlineStatus => {
  const days = differenceInCalendarDays(parseISO(dueDate), now);
  if (days < 0) return 'expired';
  if (days <= 15) return 'soon';
  if (days <= 60) return 'info';
  return 'ok';
};

const deadline = (
  vehicleId: string,
  kind: Deadline['kind'],
  title: string,
  dueDate: string,
  sourceId: string,
  dueMileage?: number,
  now = new Date()
): Deadline => ({
  id: `${kind}-${sourceId}`,
  vehicleId,
  kind,
  title,
  dueDate,
  dueMileage,
  sourceId,
  status: statusForDate(dueDate, now),
  daysLeft: differenceInCalendarDays(parseISO(dueDate), now)
});

export const buildDeadlines = (data: AppData, vehicleId: string, now = new Date()): Deadline[] => {
  const vehicleDocs = data.documents.filter((doc) => doc.vehicleId === vehicleId && doc.expiresAt);
  const maintenance = data.maintenanceRecords.filter((item) => item.vehicleId === vehicleId && item.nextDueDate);
  const insurance = data.insuranceRecords.filter((item) => item.vehicleId === vehicleId);
  const taxes = data.taxRecords.filter((item) => item.vehicleId === vehicleId);
  const inspections = data.inspectionRecords.filter((item) => item.vehicleId === vehicleId);
  const reminders = data.reminders.filter((item) => item.vehicleId === vehicleId && !item.completedAt && (item.dueDate || item.dueMileage));

  return [
    ...maintenance.map((item) =>
      deadline(vehicleId, 'manutenzione', item.title || item.typeName, item.nextDueDate!, item.id, item.nextDueMileage, now)
    ),
    ...vehicleDocs.map((doc) => deadline(vehicleId, 'documenti', doc.name, doc.expiresAt!, doc.id, undefined, now)),
    ...insurance.map((item) => deadline(vehicleId, 'assicurazione', `Rinnovo assicurazione ${item.company}`, item.expiresAt, item.id, undefined, now)),
    ...taxes.map((item) => deadline(vehicleId, 'bollo', `Bollo ${item.year}`, item.expiresAt, item.id, undefined, now)),
    ...inspections.map((item) => deadline(vehicleId, 'revisione', 'Revisione periodica', item.nextDueDate, item.id, undefined, now)),
    ...reminders.map((item) =>
      item.dueDate
        ? deadline(vehicleId, item.category, item.title, item.dueDate, item.id, item.dueMileage, now)
        : {
            id: `reminder-${item.id}`,
            vehicleId,
            kind: item.category,
            title: item.title,
            dueDate: '',
            dueMileage: item.dueMileage,
            sourceId: item.id,
            status: 'info' as const,
            daysLeft: Number.POSITIVE_INFINITY
          }
    )
  ].sort((a, b) => {
    if (!a.dueDate && !b.dueDate) return 0;
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return parseISO(a.dueDate).getTime() - parseISO(b.dueDate).getTime();
  });
};

export const upcomingDeadlines = (deadlines: Deadline[], days = 60) =>
  deadlines.filter((item) => item.daysLeft <= days).sort((a, b) => a.daysLeft - b.daysLeft);

export const upcomingDashboardDeadlines = (deadlines: Deadline[], currentMileage: number, days = 60, kmWindow = 1000) =>
  deadlines
    .filter((item) => item.daysLeft <= days || (item.dueMileage !== undefined && item.dueMileage - currentMileage <= kmWindow))
    .sort((a, b) => {
      const dateSort = a.daysLeft - b.daysLeft;
      if (Number.isFinite(dateSort) && dateSort !== 0) return dateSort;
      return (a.dueMileage || Number.POSITIVE_INFINITY) - (b.dueMileage || Number.POSITIVE_INFINITY);
    });

export const isExpired = (dueDate?: string) => (dueDate ? isBefore(parseISO(dueDate), new Date()) : false);

export const normalizeMaintenanceDraft = (draft: MaintenanceDraft): MaintenanceDraft => {
  const next = calculateNextMaintenance(
    draft.performedAt,
    draft.mileage,
    draft.intervalMonths,
    draft.intervalKm,
    draft.nextDueDate,
    draft.nextDueMileage
  );
  return { ...draft, ...next };
};

export const normalizeDocumentDraft = (draft: DocumentDraft): DocumentDraft => ({
  ...draft,
  fileType: draft.fileType || 'application/pdf'
});

export const maintenanceTotal = (records: MaintenanceRecord[]) =>
  records.reduce((sum, record) => sum + (record.cost || 0), 0);

export const hasImportantDocument = (documents: VehicleDocument[], category: string) =>
  documents.some((doc) => doc.category === category);
