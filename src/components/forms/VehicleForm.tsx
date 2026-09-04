import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Vehicle, VehicleDraft } from '../../types';
import { todayISO } from '../../utils/deadlines';

const schema = z.object({
  make: z.string().min(1, 'Inserisci la marca'),
  model: z.string().min(1, 'Inserisci il modello'),
  trim: z.string().optional(),
  engine: z.string().optional(),
  fuel: z.enum(['benzina', 'diesel', 'ibrida', 'elettrica', 'gpl', 'metano', 'altro']),
  power: z.string().optional(),
  year: z.coerce.number().min(1950, 'Anno non valido').max(2100, 'Anno non valido').optional(),
  plate: z.string().optional(),
  vin: z.string().optional(),
  firstRegistrationDate: z.string().optional(),
  purchaseDate: z.string().optional(),
  purchaseMileage: z.coerce.number().min(0).optional(),
  currentMileage: z.coerce.number().min(0, 'Il chilometraggio non puo essere negativo'),
  mileageUpdatedAt: z.string().optional(),
  purchasePrice: z.coerce.number().min(0).optional(),
  seller: z.string().optional(),
  notes: z.string().optional(),
  imagePath: z.string().optional(),
  imageUrl: z.string().optional()
});

export const VehicleForm = ({ vehicle, onSubmit, onCancel }: { vehicle?: Vehicle; onSubmit: (draft: VehicleDraft, photo?: File) => Promise<void>; onCancel: () => void }) => {
  const [photo, setPhoto] = useState<File | undefined>();
  const [previewUrl, setPreviewUrl] = useState(vehicle?.imageUrl);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<VehicleDraft>({
    resolver: zodResolver(schema),
    defaultValues: vehicle || { make: '', model: '', fuel: 'benzina', currentMileage: 0, mileageUpdatedAt: todayISO() }
  });

  useEffect(() => {
    if (!photo) {
      setPreviewUrl(vehicle?.imageUrl);
      return undefined;
    }
    const url = URL.createObjectURL(photo);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [photo, vehicle?.imageUrl]);

  return (
    <form className="form" onSubmit={handleSubmit((values) => onSubmit(values, photo))}>
      <div className="form-grid">
        <label>Marca<input {...register('make')} />{errors.make && <span>{errors.make.message}</span>}</label>
        <label>Modello<input {...register('model')} />{errors.model && <span>{errors.model.message}</span>}</label>
        <label>Versione/allestimento<input {...register('trim')} /></label>
        <label>Motorizzazione<input {...register('engine')} /></label>
        <label>Carburante<select {...register('fuel')}><option value="benzina">Benzina</option><option value="diesel">Diesel</option><option value="ibrida">Ibrida</option><option value="elettrica">Elettrica</option><option value="gpl">GPL</option><option value="metano">Metano</option><option value="altro">Altro</option></select></label>
        <label>Potenza<input {...register('power')} /></label>
        <label>Anno<input type="number" {...register('year')} /></label>
        <label>Targa<input {...register('plate')} /></label>
        <label>VIN<input {...register('vin')} /></label>
        <label>Prima immatricolazione<input type="date" {...register('firstRegistrationDate')} /></label>
        <label>Data acquisto<input type="date" {...register('purchaseDate')} /></label>
        <label>Km all'acquisto<input type="number" {...register('purchaseMileage')} /></label>
        <label>Km attuali<input type="number" {...register('currentMileage')} />{errors.currentMileage && <span>{errors.currentMileage.message}</span>}</label>
        <label>Data aggiornamento km<input type="date" {...register('mileageUpdatedAt')} /></label>
        <label>Prezzo acquisto<input type="number" step="0.01" {...register('purchasePrice')} /></label>
        <label>Venditore<input {...register('seller')} /></label>
      </div>
      <label>Foto veicolo
        <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => setPhoto(event.target.files?.[0])} />
      </label>
      {previewUrl && <img className="vehicle-preview" src={previewUrl} alt="Anteprima foto veicolo" />}
      <label>Note<textarea rows={4} {...register('notes')} /></label>
      <div className="form-actions">
        <button className="button button-ghost" type="button" onClick={onCancel}>Annulla</button>
        <button className="button button-primary" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Salvataggio...' : 'Salva'}</button>
      </div>
    </form>
  );
};
