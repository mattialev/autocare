import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useApp } from '../../context/AppContext';
import type { MaintenanceDraft } from '../../types';
import { todayISO } from '../../utils/deadlines';

const schema = z.object({
  vehicleId: z.string(),
  maintenanceTypeId: z.string().optional(),
  typeName: z.string().min(1, 'Scegli o inserisci un tipo'),
  title: z.string().min(1, 'Inserisci un titolo'),
  performedAt: z.string().min(1, 'Inserisci la data'),
  mileage: z.coerce.number().min(0).optional(),
  workshop: z.string().optional(),
  cost: z.coerce.number().min(0).optional(),
  notes: z.string().optional(),
  intervalMonths: z.coerce.number().min(0).optional(),
  intervalKm: z.coerce.number().min(0).optional(),
  nextDueDate: z.string().optional(),
  nextDueMileage: z.coerce.number().min(0).optional(),
  isRecurring: z.boolean()
});

export const MaintenanceForm = ({ vehicleId, onSubmit, onCancel }: { vehicleId: string; onSubmit: (draft: MaintenanceDraft) => Promise<void>; onCancel: () => void }) => {
  const { data } = useApp();
  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<MaintenanceDraft>({
    resolver: zodResolver(schema),
    defaultValues: { vehicleId, typeName: 'Tagliando', title: '', performedAt: todayISO(), isRecurring: true }
  });
  const selectedType = watch('maintenanceTypeId');

  useEffect(() => {
    const type = data.maintenanceTypes.find((item) => item.id === selectedType);
    if (type) {
      setValue('typeName', type.name);
      setValue('intervalMonths', type.defaultIntervalMonths);
      setValue('intervalKm', type.defaultIntervalKm);
      setValue('title', type.name);
    }
  }, [data.maintenanceTypes, selectedType, setValue]);

  return (
    <form className="form" onSubmit={handleSubmit(onSubmit)}>
      <div className="form-grid">
        <label>Tipo intervento<select {...register('maintenanceTypeId')}><option value="">Personalizzato</option>{data.maintenanceTypes.map((type) => <option key={type.id} value={type.id}>{type.name}</option>)}</select></label>
        <label>Tipo personalizzato<input {...register('typeName')} />{errors.typeName && <span>{errors.typeName.message}</span>}</label>
        <label>Titolo<input {...register('title')} />{errors.title && <span>{errors.title.message}</span>}</label>
        <label>Data<input type="date" {...register('performedAt')} />{errors.performedAt && <span>{errors.performedAt.message}</span>}</label>
        <label>Km<input type="number" {...register('mileage')} /></label>
        <label>Officina<input {...register('workshop')} /></label>
        <label>Costo<input type="number" step="0.01" {...register('cost')} /></label>
        <label>Intervallo mesi<input type="number" {...register('intervalMonths')} /></label>
        <label>Intervallo km<input type="number" {...register('intervalKm')} /></label>
        <label>Prossima data prevista<input type="date" {...register('nextDueDate')} /></label>
        <label>Prossimi km previsti<input type="number" {...register('nextDueMileage')} /></label>
        <label className="checkbox-row"><input type="checkbox" {...register('isRecurring')} /> Ricorrente</label>
      </div>
      <label>Note<textarea rows={4} {...register('notes')} /></label>
      <div className="form-actions">
        <button className="button button-ghost" type="button" onClick={onCancel}>Annulla</button>
        <button className="button button-primary" type="submit" disabled={isSubmitting}>Registra intervento</button>
      </div>
    </form>
  );
};
