import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { DocumentCategory, DocumentDraft, MaintenanceRecord } from '../../types';

const categories: DocumentCategory[] = ['Anagrafica', 'Acquisto', 'Libretto', 'Assicurazione', 'Bollo', 'Revisione', 'Manutenzione', 'Garanzia', 'Pneumatici', 'Altro'];

const schema = z.object({
  vehicleId: z.string(),
  maintenanceRecordId: z.string().optional(),
  name: z.string().min(1, 'Inserisci il nome del documento'),
  category: z.enum(categories as [DocumentCategory, ...DocumentCategory[]]),
  description: z.string().optional(),
  documentDate: z.string().optional(),
  expiresAt: z.string().optional(),
  filePath: z.string().optional(),
  fileName: z.string().optional(),
  fileType: z.string().optional(),
  fileSize: z.coerce.number().optional()
});

export const DocumentForm = ({ vehicleId, maintenanceRecords, onSubmit, onCancel }: { vehicleId: string; maintenanceRecords: MaintenanceRecord[]; onSubmit: (draft: DocumentDraft, file?: File) => Promise<void>; onCancel: () => void }) => {
  const [file, setFile] = useState<File | undefined>();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<DocumentDraft>({
    resolver: zodResolver(schema),
    defaultValues: { vehicleId, name: '', category: 'Altro' }
  });

  return (
    <form className="form" onSubmit={handleSubmit((values) => onSubmit(values, file))}>
      <div className="form-grid">
        <label>Nome<input {...register('name')} />{errors.name && <span>{errors.name.message}</span>}</label>
        <label>Categoria<select {...register('category')}>{categories.map((category) => <option key={category} value={category}>{category}</option>)}</select></label>
        <label>Data documento<input type="date" {...register('documentDate')} /></label>
        <label>Scadenza<input type="date" {...register('expiresAt')} /></label>
        <label>Manutenzione collegata<select {...register('maintenanceRecordId')}><option value="">Nessuna</option>{maintenanceRecords.map((record) => <option key={record.id} value={record.id}>{record.title}</option>)}</select></label>
        <label>File PDF/JPG/PNG<input type="file" accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" onChange={(event) => setFile(event.target.files?.[0])} /></label>
      </div>
      <label>Note<textarea rows={4} {...register('description')} /></label>
      <div className="form-actions">
        <button className="button button-ghost" type="button" onClick={onCancel}>Annulla</button>
        <button className="button button-primary" type="submit" disabled={isSubmitting}>Carica documento</button>
      </div>
    </form>
  );
};
