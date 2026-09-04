import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { BarChart3, CalendarClock, Car, FileText, Gauge, LogOut, Menu, Settings, Wrench } from 'lucide-react';
import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Logo } from '../components/Logo';
import { useVehicle } from '../hooks/useVehicle';

const nav = [
  ['dashboard', 'Dashboard', Gauge],
  ['maintenance', 'Manutenzione', Wrench],
  ['profile', 'Anagrafica', Car],
  ['documents', 'Documenti', FileText],
  ['deadlines', 'Scadenze', CalendarClock],
  ['stats', 'Statistiche', BarChart3],
  ['settings', 'Impostazioni', Settings]
] as const;

export const VehicleLayout = () => {
  const { data, profile, signOut } = useApp();
  const { vehicle } = useVehicle();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  if (!vehicle) return <main className="screen-center">Veicolo non trovato.</main>;

  return (
    <div className="app-shell">
      <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
        <Logo />
        <nav>
          {nav.map(([path, label, Icon]) => (
            <NavLink key={path} to={path} onClick={() => setOpen(false)}><Icon size={18} />{label}</NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <label>Cambia veicolo
            <select value={vehicle.id} onChange={(event) => navigate(`/vehicles/${event.target.value}/dashboard`)}>
              {data.vehicles.map((item) => <option key={item.id} value={item.id}>{item.make} {item.model}</option>)}
            </select>
          </label>
          <div className="user-mini">
            <span>{profile?.fullName || profile?.email}</span>
            <button className="icon-button" type="button" onClick={signOut} aria-label="Logout"><LogOut size={17} /></button>
          </div>
        </div>
      </aside>
      <header className="mobile-bar">
        <button className="icon-button" type="button" onClick={() => setOpen((value) => !value)} aria-label="Menu"><Menu size={20} /></button>
        <Logo />
      </header>
      <section className="content">
        <Outlet />
      </section>
    </div>
  );
};
