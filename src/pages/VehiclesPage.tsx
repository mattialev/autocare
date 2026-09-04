import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Car, Plus, ShieldAlert } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Modal } from '../components/Modal';
import { VehicleForm } from '../components/forms/VehicleForm';
import { buildDeadlines } from '../utils/deadlines';
import { formatDate, formatKm, relativeDueLabel } from '../utils/format';
import { EmptyState } from '../components/EmptyState';
import { Logo } from '../components/Logo';

export const VehiclesPage = () => {
  const { data, addVehicle, profile, signOut } = useApp();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const deadlinesByVehicle = useMemo(() => Object.fromEntries(data.vehicles.map((vehicle) => [vehicle.id, buildDeadlines(data, vehicle.id)[0]])), [data]);

  return (
    <main className="vehicles-page">
      <header className="topbar">
        <Logo />
        <div className="topbar-actions">
          <span>{profile?.email}</span>
          <button className="button button-ghost" onClick={signOut} type="button">Logout</button>
        </div>
      </header>
      <section className="page-heading">
        <div>
          <h1>Le mie auto</h1>
          <p>Gestisci anagrafica, manutenzioni, scadenze e documenti dei tuoi veicoli.</p>
        </div>
        <button className="button button-primary" type="button" onClick={() => setOpen(true)}><Plus size={18} /> Aggiungi auto</button>
      </section>
      {data.vehicles.length === 0 ? (
        <EmptyState title="Non hai ancora registrato auto." action={<button className="button button-primary" type="button" onClick={() => setOpen(true)}>Aggiungi la prima auto</button>} />
      ) : (
        <section className="vehicle-grid">
          {data.vehicles.map((vehicle) => {
            const next = deadlinesByVehicle[vehicle.id];
            return (
              <article className="vehicle-card" key={vehicle.id}>
                <div className="vehicle-photo">{vehicle.imageUrl ? <img src={vehicle.imageUrl} alt={`${vehicle.make} ${vehicle.model}`} /> : <Car size={42} />}</div>
                <div>
                  <h2>{vehicle.make} {vehicle.model}</h2>
                  <p>{vehicle.trim || vehicle.engine}</p>
                </div>
                <dl>
                  <div><dt>Targa</dt><dd>{vehicle.plate || '-'}</dd></div>
                  <div><dt>Km</dt><dd>{formatKm(vehicle.currentMileage)}</dd></div>
                  <div><dt>Prossima scadenza</dt><dd>{next ? `${next.title} - ${formatDate(next.dueDate)} (${relativeDueLabel(next.daysLeft)})` : 'Nessuna'}</dd></div>
                </dl>
                {next && next.status === 'expired' && <p className="inline-alert"><ShieldAlert size={16} /> Scadenza passata da gestire</p>}
                <Link className="button button-primary button-wide" to={`/vehicles/${vehicle.id}/dashboard`}>Apri</Link>
              </article>
            );
          })}
        </section>
      )}
      {open && <Modal title="Aggiungi auto" onClose={() => setOpen(false)}><VehicleForm onCancel={() => setOpen(false)} onSubmit={async (draft, photo) => { const vehicle = await addVehicle(draft, photo); setOpen(false); navigate(`/vehicles/${vehicle.id}/dashboard`); }} /></Modal>}
    </main>
  );
};
