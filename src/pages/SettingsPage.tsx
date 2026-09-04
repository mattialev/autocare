import { Download } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const SettingsPage = () => {
  const { profile, data, signOut } = useApp();
  const exportData = () => {
    const blob = new Blob([JSON.stringify({ profile, data }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'autocare-export.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <section className="page-heading"><div><h1>Impostazioni</h1><p>Profilo, preferenze ed esportazione dati.</p></div></section>
      <section className="profile-grid">
        <article className="card"><h2>Profilo</h2><dl className="details"><div><dt>Nome</dt><dd>{profile?.fullName || '-'}</dd></div><div><dt>Email</dt><dd>{profile?.email}</dd></div></dl></article>
        <article className="card"><h2>Preferenze</h2><label className="checkbox-row"><input type="checkbox" defaultChecked /> Avvisi entro 60 giorni</label><label className="checkbox-row"><input type="checkbox" defaultChecked /> Formato valuta EUR</label></article>
        <article className="card"><h2>Dati account</h2><button className="button button-ghost" onClick={exportData}><Download size={17} /> Esporta JSON</button><button className="button button-danger" onClick={signOut}>Logout</button></article>
      </section>
    </>
  );
};
