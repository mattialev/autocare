import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { DeadlineKind, ReminderDraft } from '../../types';

const categories: DeadlineKind[] = ['manutenzione', 'documenti', 'assicurazione', 'bollo', 'revisione', 'evento'];

const emptyToUndefined = (value: unknown) => value === '' ? undefined : value;

const schema = z.object({
  vehicleId: z.string(),
  title: z.string().min(1, 'Inserisci un titolo'),
  category: z.enum(categories as [DeadlineKind, ...DeadlineKind[]]),
  dueDate: z.preprocess(emptyToUndefined, z.string().optional()),
  dueMileage: z.preprocess(emptyToUndefined, z.coerce.number().min(0, 'Inserisci km validi').optional()),
  notes: z.string().optional()
}).refine((values) => Boolean(values.dueDate || values.dueMileage !== undefined), {
  message: 'Inserisci almeno una data o un chilometraggio',
  path: ['dueDate']
});

export const ReminderForm = ({ vehicleId, onSubmit, onCancel }: { vehicleId: string; onSubmit: (draft: ReminderDraft) => Promise<void>; onCancel: () => void }) => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ReminderDraft>({
    resolver: zodResolver(schema),
    defaultValues: { vehicleId, title: '', category: 'manutenzione' }
  });

  return (
    <form className="form" onSubmit={handleSubmit(onSubmit)}>
      <div className="form-grid">
        <label>Titolo *<input {...register('title')} />{errors.title && <span>{errors.title.message}</span>}</label>
        <label>Tipo<select {...register('category')}>{categories.map((category) => <option key={category} value={category}>{category}</option>)}</select></label>
        <label>Data<input type="date" {...register('dueDate')} />{errors.dueDate && <span>{errors.dueDate.message}</span>}</label>
        <label>Km<input type="number" {...register('dueMileage')} /></label>
      </div>
      <label>Note<textarea rows={4} {...register('notes')} /></label>
      <div className="form-actions">
        <button className="button button-ghost" type="button" onClick={onCancel}>Annulla</button>
        <button className="button button-primary" type="submit" disabled={isSubmitting}>Imposta scadenza</button>
      </div>
    </form>
  );
};
