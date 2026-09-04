export type FuelType = 'benzina' | 'diesel' | 'ibrida' | 'elettrica' | 'gpl' | 'metano' | 'altro';

export type Vehicle = {
  id: string;
  userId: string;
  make: string;
  model: string;
  trim?: string;
  engine?: string;
  fuel: FuelType;
  power?: string;
  year?: number;
  plate?: string;
  vin?: string;
  firstRegistrationDate?: string;
  purchaseDate?: string;
  purchaseMileage?: number;
  currentMileage: number;
  mileageUpdatedAt?: string;
  purchasePrice?: number;
  seller?: string;
  notes?: string;
  imagePath?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
};

export type OdometerReading = {
  id: string;
  vehicleId: string;
  userId: string;
  readingDate: string;
  mileage: number;
  notes?: string;
};

export type MaintenanceCategory =
  | 'tagliando'
  | 'olio'
  | 'filtri'
  | 'freni'
  | 'pneumatici'
  | 'revisione'
  | 'distribuzione'
  | 'liquidi'
  | 'batteria'
  | 'altro';

export type MaintenanceType = {
  id: string;
  name: string;
  category: MaintenanceCategory;
  defaultIntervalMonths?: number;
  defaultIntervalKm?: number;
  isDefault: boolean;
};

export type MaintenanceRecord = {
  id: string;
  vehicleId: string;
  userId: string;
  maintenanceTypeId?: string;
  typeName: string;
  title: string;
  performedAt: string;
  mileage?: number;
  workshop?: string;
  cost?: number;
  notes?: string;
  intervalMonths?: number;
  intervalKm?: number;
  nextDueDate?: string;
  nextDueMileage?: number;
  isRecurring: boolean;
  createdAt: string;
};

export type DocumentCategory =
  | 'Anagrafica'
  | 'Acquisto'
  | 'Libretto'
  | 'Assicurazione'
  | 'Bollo'
  | 'Revisione'
  | 'Manutenzione'
  | 'Garanzia'
  | 'Pneumatici'
  | 'Altro';

export type VehicleDocument = {
  id: string;
  vehicleId: string;
  userId: string;
  maintenanceRecordId?: string;
  name: string;
  category: DocumentCategory;
  description?: string;
  documentDate?: string;
  expiresAt?: string;
  filePath?: string;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
  signedUrl?: string;
  createdAt: string;
  updatedAt: string;
};

export type InsuranceRecord = {
  id: string;
  vehicleId: string;
  userId: string;
  company: string;
  policyNumber?: string;
  startsAt?: string;
  expiresAt: string;
  cost?: number;
  documentId?: string;
};

export type TaxRecord = {
  id: string;
  vehicleId: string;
  userId: string;
  year: number;
  amount?: number;
  paidAt?: string;
  expiresAt: string;
  status: 'pagato' | 'da_pagare';
  documentId?: string;
};

export type InspectionRecord = {
  id: string;
  vehicleId: string;
  userId: string;
  inspectedAt: string;
  mileage?: number;
  outcome?: string;
  nextDueDate: string;
  documentId?: string;
};

export type DeadlineKind = 'manutenzione' | 'documenti' | 'assicurazione' | 'bollo' | 'revisione' | 'evento';
export type DeadlineStatus = 'ok' | 'info' | 'soon' | 'expired';

export type Deadline = {
  id: string;
  vehicleId: string;
  kind: DeadlineKind;
  title: string;
  dueDate: string;
  dueMileage?: number;
  status: DeadlineStatus;
  daysLeft: number;
  sourceId: string;
};

export type Profile = {
  id: string;
  email: string;
  fullName?: string;
};

export type AppData = {
  vehicles: Vehicle[];
  odometerReadings: OdometerReading[];
  maintenanceTypes: MaintenanceType[];
  maintenanceRecords: MaintenanceRecord[];
  documents: VehicleDocument[];
  insuranceRecords: InsuranceRecord[];
  taxRecords: TaxRecord[];
  inspectionRecords: InspectionRecord[];
};

export type VehicleDraft = Omit<Vehicle, 'id' | 'userId' | 'createdAt' | 'updatedAt'>;
export type MaintenanceDraft = Omit<MaintenanceRecord, 'id' | 'userId' | 'createdAt'>;
export type DocumentDraft = Omit<VehicleDocument, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'signedUrl'>;
