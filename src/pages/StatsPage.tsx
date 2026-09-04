import { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { useVehicle } from '../hooks/useVehicle';
import { maintenanceTotal } from '../utils/deadlines';
import { formatCurrency, formatKm } from '../utils/format';

export const StatsPage = () => {
  const { data } = useApp();
  const { vehicle } = useVehicle();
  const records = data.maintenanceRecords.filter((item) => item.vehicleId === vehicle!.id);
  const readings = data.odometerReadings.filter((item) => item.vehicleId === vehicle!.id);
  const currentYear = new Date().getFullYear();
  const yearRecords = records.filter((item) => new Date(item.performedAt).getFullYear() === currentYear);
  const km = readings.length > 1 ? readings[0].mileage - readings[readings.length - 1].mileage : 0;
  const byYear = useMemo(() => Object.entries(records.reduce<Record<string, number>>((acc, item) => {
    const year = item.performedAt.slice(0, 4);
    acc[year] = (acc[year] || 0) + (item.cost || 0);
    return acc;
  }, {})).sort(([a], [b]) => b.localeCompare(a)), [records]);

  return (
    <>
      <section className="page-heading"><div><h1>Statistiche</h1><p>Una vista semplice sui costi e sull'uso del veicolo.</p></div></section>
      <section className="card-grid stats-grid">
        <article className="card"><h2>Spesa anno corrente</h2><p className="big-number">{formatCurrency(maintenanceTotal(yearRecords))}</p></article>
        <article className="card"><h2>Numero interventi</h2><p className="big-number">{records.length}</p></article>
        <article className="card"><h2>Costo medio</h2><p className="big-number">{formatCurrency(records.length ? maintenanceTotal(records) / records.length : 0)}</p></article>
        <article className="card"><h2>Km percorsi registrati</h2><p className="big-number">{formatKm(km)}</p></article>
      </section>
      <section className="table-card"><h2>Spesa per anno</h2><table><tbody>{byYear.map(([year, total]) => <tr key={year}><td>{year}</td><td>{formatCurrency(total)}</td></tr>)}</tbody></table></section>
    </>
  );
};
