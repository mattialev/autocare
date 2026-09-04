import { AlertTriangle } from 'lucide-react';

type Props = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export const ConfirmDialog = ({ open, title, description, confirmLabel = 'Elimina', onConfirm, onCancel }: Props) => {
  if (!open) return null;
  return (
    <div className="modal-backdrop" role="presentation">
      <div className="dialog" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
        <div className="dialog-icon"><AlertTriangle size={22} /></div>
        <h2 id="confirm-title">{title}</h2>
        <p>{description}</p>
        <div className="dialog-actions">
          <button className="button button-ghost" type="button" onClick={onCancel}>Annulla</button>
          <button className="button button-danger" type="button" onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
};
