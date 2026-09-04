import { X } from 'lucide-react';

export const Modal = ({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) => (
  <div className="modal-backdrop" role="presentation">
    <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="modal-head">
        <h2 id="modal-title">{title}</h2>
        <button className="icon-button" type="button" onClick={onClose} aria-label="Chiudi"><X size={18} /></button>
      </div>
      {children}
    </div>
  </div>
);
