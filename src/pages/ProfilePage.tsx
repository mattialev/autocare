import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useVehicle } from '../hooks/useVehicle';
import { Modal } from '../components/Modal';
import { VehicleForm } from '../components/forms/VehicleForm';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { formatCurrency, formatDate, formatKm } from '../utils/format';

export const ProfilePage = () => {
  const { updateVehicle, deleteVehicle } = useApp();
  const { vehicle } = useVehicle();
  const [edit, setEdit] = useState(false);
  const [confirm, setConfirm] = useState(false);

  return (
    <>
      <section className="page-heading"><div><h1>Anagrafica auto</h1><p>Dati tecnici, acquisto e note del veicolo.</p></div><button className="button button-primary" onClick={() => setEdit(true)}>Modifica</button></section>
      <section className="profile-grid">
        <article className="card"><h2>Identificazione</h2><dl className="details"><div><dt>Marca</dt><dd>{vehicle!.make}</dd></div><div><dt>Modello</dt><dd>{vehicle!.model}</dd></div><div><dt>Allestimento</dt><dd>{vehicle!.trim || '-'}</dd></div><div><dt>Targa</dt><dd>{vehicle!.plate || '-'}</dd></div><div><dt>VIN</dt><dd>{vehicle!.vin || '-'}</dd></div></dl></article>
        <article className="card"><h2>Tecnica</h2><dl className="details"><div><dt>Motore</dt><dd>{vehicle!.engine || '-'}</dd></div><div><dt>Carburante</dt><dd>{vehicle!.fuel}</dd></div><div><dt>Potenza</dt><dd>{vehicle!.power || '-'}</dd></div><div><dt>Anno</dt><dd>{vehicle!.year || '-'}</dd></div><div><dt>Prima immatricolazione</dt><dd>{formatDate(vehicle!.firstRegistrationDate)}</dd></div></dl></article>
        <article className="card"><h2>Acquisto</h2><dl className="details"><div><dt>Data acquisto</dt><dd>{formatDate(vehicle!.purchaseDate)}</dd></div><div><dt>Km acquisto</dt><dd>{formatKm(vehicle!.purchaseMileage)}</dd></div><div><dt>Prezzo</dt><dd>{formatCurrency(vehicle!.purchasePrice)}</dd></div><div><dt>Venditore</dt><dd>{vehicle!.seller || '-'}</dd></div></dl></article>
        <article className="card"><h2>Note</h2><p>{vehicle!.notes || 'Nessuna nota inserita.'}</p><button className="button button-danger" onClick={() => setConfirm(true)}><Trash2 size={17} /> Elimina veicolo</button></article>
      </section>
      {edit && <Modal title="Modifica anagrafica" onClose={() => setEdit(false)}><VehicleForm vehicle={vehicle!} onCancel={() => setEdit(false)} onSubmit={async (draft, photo) => { await updateVehicle(vehicle!.id, draft, photo); setEdit(false); }} /></Modal>}
      <ConfirmDialog open={confirm} title="Eliminare veicolo?" description="Verranno eliminati anagrafica, manutenzioni e documenti collegati." onCancel={() => setConfirm(false)} onConfirm={async () => { await deleteVehicle(vehicle!.id); window.location.href = '/vehicles'; }} />
    </>
  );
};
