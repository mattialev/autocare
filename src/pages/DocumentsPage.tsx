import { useMemo, useState } from 'react';
import { Download, ExternalLink, FileText, Plus, Search, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useVehicle } from '../hooks/useVehicle';
import { Modal } from '../components/Modal';
import { DocumentForm } from '../components/forms/DocumentForm';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { EmptyState } from '../components/EmptyState';
import { formatDate, formatFileSize } from '../utils/format';
import type { DocumentCategory } from '../types';

const categories: DocumentCategory[] = ['Anagrafica', 'Acquisto', 'Libretto', 'Assicurazione', 'Bollo', 'Revisione', 'Manutenzione', 'Garanzia', 'Pneumatici', 'Altro'];

export const DocumentsPage = () => {
  const { data, addDocument, deleteDocument } = useApp();
  const { vehicle } = useVehicle();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<DocumentCategory | 'Tutte'>('Tutte');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const vehicleDocs = data.documents.filter((item) => item.vehicleId === vehicle!.id);
  const docs = useMemo(() => vehicleDocs.filter((doc) => (category === 'Tutte' || doc.category === category) && doc.name.toLowerCase().includes(query.toLowerCase())), [vehicleDocs, category, query]);
  const maintenance = data.maintenanceRecords.filter((item) => item.vehicleId === vehicle!.id);

  return (
    <>
      <section className="page-heading"><div><h1>Documenti</h1><p>Tutti i tuoi documenti, sempre a portata di mano.</p></div><button className="button button-primary" onClick={() => setOpen(true)} type="button"><Plus size={18} /> Carica documento</button></section>
      <section className="folder-grid">{categories.map((item) => <button className={`folder-card ${category === item ? 'active' : ''}`} key={item} onClick={() => setCategory(item)} type="button"><FileText size={22} /><strong>{item}</strong><span>{vehicleDocs.filter((doc) => doc.category === item).length} file</span></button>)}</section>
      <section className="toolbar"><div className="search-box"><Search size={17} /><input placeholder="Cerca documento" value={query} onChange={(event) => setQuery(event.target.value)} /></div><select value={category} onChange={(event) => setCategory(event.target.value as DocumentCategory | 'Tutte')}><option>Tutte</option>{categories.map((item) => <option key={item}>{item}</option>)}</select></section>
      <section className="table-card">
        <h2>Documenti recenti</h2>
        {docs.length ? <table><thead><tr><th>Nome</th><th>Categoria</th><th>Data</th><th>Scadenza</th><th>Dimensione</th><th>File</th><th /></tr></thead><tbody>{docs.map((doc) => <tr key={doc.id}><td><strong>{doc.name}</strong><span>{doc.fileName || 'File non caricato'}</span></td><td>{doc.category}</td><td>{formatDate(doc.documentDate || doc.createdAt)}</td><td>{formatDate(doc.expiresAt)}</td><td>{formatFileSize(doc.fileSize)}</td><td>{doc.signedUrl ? <div className="file-actions"><a className="button button-ghost button-small" href={doc.signedUrl} target="_blank" rel="noreferrer"><ExternalLink size={15} /> Apri</a><a className="button button-ghost button-small" href={doc.signedUrl} download={doc.fileName || doc.name}><Download size={15} /> Scarica</a></div> : <span className="muted">File demo non disponibile</span>}</td><td className="table-actions"><button className="icon-button" onClick={() => setDeleteId(doc.id)} aria-label="Elimina"><Trash2 size={17} /></button></td></tr>)}</tbody></table> : <EmptyState title="Non hai ancora caricato documenti." action={<button className="button button-primary" onClick={() => setOpen(true)}>Carica documento</button>} />}
      </section>
      {open && <Modal title="Carica documento" onClose={() => setOpen(false)}><DocumentForm vehicleId={vehicle!.id} maintenanceRecords={maintenance} onCancel={() => setOpen(false)} onSubmit={async (draft, file) => { await addDocument(draft, file); setOpen(false); }} /></Modal>}
      <ConfirmDialog open={Boolean(deleteId)} title="Eliminare documento?" description="Il file e i metadati associati verranno rimossi." onCancel={() => setDeleteId(null)} onConfirm={async () => { if (deleteId) await deleteDocument(deleteId); setDeleteId(null); }} />
    </>
  );
};
