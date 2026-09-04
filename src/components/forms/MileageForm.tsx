import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { todayISO } from '../../utils/deadlines';

const schema = z.object({
  mileage: z.coerce.number().min(0, 'Inserisci un chilometraggio valido'),
  readingDate: z.string().min(1, 'Inserisci la data')
});

export const MileageForm = ({ currentMileage, onSubmit, onCancel }: { currentMileage: number; onSubmit: (mileage: number, readingDate: string) => Promise<void>; onCancel: () => void }) => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<{ mileage: number; readingDate: string }>({
    resolver: zodResolver(schema),
    defaultValues: { mileage: currentMileage, readingDate: todayISO() }
  });
  return (
    <form className="form" onSubmit={handleSubmit((values) => onSubmit(values.mileage, values.readingDate))}>
      <label>Chilometraggio attuale<input type="number" {...register('mileage')} />{errors.mileage && <span>{errors.mileage.message}</span>}</label>
      <label>Data rilevazione<input type="date" {...register('readingDate')} />{errors.readingDate && <span>{errors.readingDate.message}</span>}</label>
      <div className="form-actions">
        <button className="button button-ghost" type="button" onClick={onCancel}>Annulla</button>
        <button className="button button-primary" type="submit" disabled={isSubmitting}>Aggiorna km</button>
      </div>
    </form>
  );
};
