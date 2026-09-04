import type { AppData, MaintenanceType, Profile, Vehicle } from '../types';

const userId = 'demo-user';
const vehicleId = 'focus-demo';

export const demoProfile: Profile = {
  id: userId,
  email: 'demo@autocare.local',
  fullName: 'Utente Demo'
};

export const maintenanceTypes: MaintenanceType[] = [
  { id: 'tagliando', name: 'Tagliando', category: 'tagliando', defaultIntervalMonths: 12, defaultIntervalKm: 15000, isDefault: true },
  { id: 'olio', name: 'Cambio olio motore', category: 'olio', defaultIntervalMonths: 12, defaultIntervalKm: 15000, isDefault: true },
  { id: 'filtro-olio', name: 'Filtro olio', category: 'filtri', defaultIntervalMonths: 12, defaultIntervalKm: 15000, isDefault: true },
  { id: 'filtro-aria', name: 'Filtro aria', category: 'filtri', defaultIntervalMonths: 24, defaultIntervalKm: 30000, isDefault: true },
  { id: 'filtro-abitacolo', name: 'Filtro abitacolo', category: 'filtri', defaultIntervalMonths: 12, isDefault: true },
  { id: 'candele', name: 'Candele', category: 'altro', defaultIntervalMonths: 48, defaultIntervalKm: 60000, isDefault: true },
  { id: 'liquido-freni', name: 'Liquido freni', category: 'liquidi', defaultIntervalMonths: 24, isDefault: true },
  { id: 'refrigerante', name: 'Liquido refrigerante', category: 'liquidi', defaultIntervalMonths: 48, isDefault: true },
  { id: 'batteria', name: 'Batteria', category: 'batteria', defaultIntervalMonths: 60, isDefault: true },
  { id: 'pneumatici', name: 'Pneumatici', category: 'pneumatici', defaultIntervalMonths: 60, defaultIntervalKm: 45000, isDefault: true },
  { id: 'rotazione', name: 'Rotazione pneumatici', category: 'pneumatici', defaultIntervalMonths: 6, defaultIntervalKm: 10000, isDefault: true },
  { id: 'convergenza', name: 'Convergenza', category: 'pneumatici', defaultIntervalMonths: 12, isDefault: true },
  { id: 'pastiglie', name: 'Pastiglie freno', category: 'freni', defaultIntervalKm: 35000, isDefault: true },
  { id: 'dischi', name: 'Dischi freno', category: 'freni', defaultIntervalKm: 70000, isDefault: true },
  { id: 'distribuzione', name: 'Distribuzione', category: 'distribuzione', defaultIntervalMonths: 72, defaultIntervalKm: 120000, isDefault: true },
  { id: 'cinghia-servizi', name: 'Cinghia servizi', category: 'distribuzione', defaultIntervalMonths: 60, defaultIntervalKm: 90000, isDefault: true },
  { id: 'cambio-auto', name: 'Manutenzione cambio automatico', category: 'altro', defaultIntervalMonths: 48, defaultIntervalKm: 60000, isDefault: true },
  { id: 'revisione', name: 'Revisione', category: 'revisione', defaultIntervalMonths: 24, isDefault: true },
  { id: 'altro', name: 'Altro', category: 'altro', isDefault: true }
];

const focus: Vehicle = {
  id: vehicleId,
  userId,
  make: 'Ford',
  model: 'Focus',
  trim: 'ST-Line X',
  engine: '1.0 EcoBoost Hybrid 155 CV Powershift',
  fuel: 'ibrida',
  power: '155 CV',
  year: 2023,
  plate: 'GC123DE',
  vin: 'WF0DEMOFOCUS2023',
  firstRegistrationDate: '2023-05-19',
  purchaseDate: '2024-02-10',
  purchaseMileage: 18400,
  currentMileage: 42350,
  mileageUpdatedAt: '2026-09-04',
  purchasePrice: 24500,
  seller: 'Concessionaria Demo Ford',
  notes: 'Dati dimostrativi, nessun riferimento reale.',
  imageUrl: '',
  createdAt: '2026-09-04',
  updatedAt: '2026-09-04'
};

export const demoData: AppData = {
  vehicles: [
    focus,
    {
      ...focus,
      id: 'mx5-demo',
      make: 'Mazda',
      model: 'MX-5',
      trim: '2.0 Skyactiv-G',
      engine: '2.0 184 CV',
      fuel: 'benzina',
      power: '184 CV',
      year: 2021,
      plate: 'GA987MX',
      vin: 'JMZDEMO2021MX5',
      currentMileage: 31820,
      mileageUpdatedAt: '2026-08-29',
      purchaseMileage: 20500,
      purchasePrice: 27900
    }
  ],
  odometerReadings: [
    { id: 'odo-1', vehicleId, userId, readingDate: '2026-09-04', mileage: 42350 },
    { id: 'odo-2', vehicleId, userId, readingDate: '2026-08-15', mileage: 41920 },
    { id: 'odo-3', vehicleId, userId, readingDate: '2026-08-01', mileage: 41400 }
  ],
  maintenanceTypes,
  maintenanceRecords: [
    {
      id: 'm-1',
      vehicleId,
      userId,
      maintenanceTypeId: 'tagliando',
      typeName: 'Tagliando',
      title: 'Tagliando completo',
      performedAt: '2025-10-15',
      mileage: 31200,
      workshop: 'Ford XYZ',
      cost: 320,
      notes: 'Olio, filtri e check generale.',
      intervalMonths: 12,
      intervalKm: 15000,
      nextDueDate: '2026-10-15',
      nextDueMileage: 46200,
      isRecurring: true,
      createdAt: '2025-10-15'
    },
    {
      id: 'm-2',
      vehicleId,
      userId,
      maintenanceTypeId: 'rotazione',
      typeName: 'Rotazione pneumatici',
      title: 'Rotazione pneumatici',
      performedAt: '2026-04-20',
      mileage: 38600,
      workshop: 'Gommista Demo',
      cost: 45,
      intervalMonths: 6,
      intervalKm: 10000,
      nextDueDate: '2026-10-20',
      nextDueMileage: 48600,
      isRecurring: true,
      createdAt: '2026-04-20'
    },
    {
      id: 'm-3',
      vehicleId,
      userId,
      maintenanceTypeId: 'liquido-freni',
      typeName: 'Liquido freni',
      title: 'Sostituzione liquido freni',
      performedAt: '2024-08-12',
      mileage: 22100,
      cost: 95,
      intervalMonths: 24,
      nextDueDate: '2026-08-12',
      isRecurring: true,
      createdAt: '2024-08-12'
    }
  ],
  documents: [
    { id: 'd-1', vehicleId, userId, name: 'Libretto di circolazione', category: 'Libretto', fileName: 'libretto-demo.pdf', fileType: 'application/pdf', fileSize: 240000, createdAt: '2026-01-10', updatedAt: '2026-01-10' },
    { id: 'd-2', vehicleId, userId, name: 'Contratto acquisto', category: 'Acquisto', fileName: 'contratto-demo.pdf', fileType: 'application/pdf', fileSize: 510000, documentDate: '2024-02-10', createdAt: '2026-01-10', updatedAt: '2026-01-10' },
    { id: 'd-3', vehicleId, userId, name: 'Polizza assicurativa', category: 'Assicurazione', fileName: 'polizza-demo.pdf', fileType: 'application/pdf', fileSize: 330000, expiresAt: '2026-11-02', createdAt: '2026-02-01', updatedAt: '2026-02-01' },
    { id: 'd-4', vehicleId, userId, name: 'Bollo 2026', category: 'Bollo', fileName: 'bollo-2026.pdf', fileType: 'application/pdf', fileSize: 180000, expiresAt: '2027-01-31', createdAt: '2026-01-31', updatedAt: '2026-01-31' }
  ],
  insuranceRecords: [
    { id: 'i-1', vehicleId, userId, company: 'Compagnia Demo', policyNumber: 'POL-DEMO-2026', startsAt: '2026-02-02', expiresAt: '2026-11-02', cost: 520, documentId: 'd-3' }
  ],
  taxRecords: [
    { id: 't-1', vehicleId, userId, year: 2026, amount: 245, paidAt: '2026-01-25', expiresAt: '2027-01-31', status: 'pagato', documentId: 'd-4' }
  ],
  inspectionRecords: [
    { id: 'r-1', vehicleId, userId, inspectedAt: '2025-05-18', mileage: 28500, outcome: 'Regolare', nextDueDate: '2027-05-31' }
  ]
};
