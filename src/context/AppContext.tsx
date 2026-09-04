import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { AuthError, User } from '@supabase/supabase-js';
import { DOCUMENTS_BUCKET, isSupabaseConfigured, supabase } from '../lib/supabase';
import { demoData, demoProfile } from '../data/demoData';
import type { AppData, DocumentDraft, MaintenanceDraft, Profile, Vehicle, VehicleDraft, VehicleDocument } from '../types';
import { normalizeDocumentDraft, normalizeMaintenanceDraft, todayISO } from '../utils/deadlines';

type AuthMode = 'demo' | 'supabase';

type AppContextValue = {
  mode: AuthMode;
  profile: Profile | null;
  user: User | null;
  data: AppData;
  loading: boolean;
  error: string | null;
  toast: string | null;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName?: string) => Promise<void>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
  clearToast: () => void;
  addVehicle: (draft: VehicleDraft, photo?: File) => Promise<Vehicle>;
  updateVehicle: (id: string, patch: Partial<VehicleDraft>, photo?: File) => Promise<void>;
  deleteVehicle: (id: string) => Promise<void>;
  updateMileage: (vehicleId: string, mileage: number, readingDate: string) => Promise<void>;
  addMaintenance: (draft: MaintenanceDraft) => Promise<void>;
  deleteMaintenance: (id: string) => Promise<void>;
  addDocument: (draft: DocumentDraft, file?: File) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
};

const storageKey = 'autocare-demo-data';
const sessionKey = 'autocare-demo-session';

const cloneDemo = (): AppData => JSON.parse(JSON.stringify(demoData)) as AppData;

const loadDemoData = () => {
  const stored = localStorage.getItem(storageKey);
  return stored ? (JSON.parse(stored) as AppData) : cloneDemo();
};

const saveDemoData = (data: AppData) => localStorage.setItem(storageKey, JSON.stringify(data));

const fileToDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Impossibile leggere il file selezionato'));
    reader.readAsDataURL(file);
  });

const AppContext = createContext<AppContextValue | undefined>(undefined);

const mapVehicle = (row: Record<string, unknown>): Vehicle => ({
  id: String(row.id),
  userId: String(row.user_id),
  make: String(row.make),
  model: String(row.model),
  trim: row.trim as string | undefined,
  engine: row.engine as string | undefined,
  fuel: (row.fuel as Vehicle['fuel']) || 'altro',
  power: row.power as string | undefined,
  year: row.year as number | undefined,
  plate: row.plate as string | undefined,
  vin: row.vin as string | undefined,
  firstRegistrationDate: row.first_registration_date as string | undefined,
  purchaseDate: row.purchase_date as string | undefined,
  purchaseMileage: row.purchase_mileage as number | undefined,
  currentMileage: Number(row.current_mileage || 0),
  mileageUpdatedAt: row.mileage_updated_at as string | undefined,
  purchasePrice: row.purchase_price as number | undefined,
  seller: row.seller as string | undefined,
  notes: row.notes as string | undefined,
  imagePath: row.image_path as string | undefined,
  imageUrl: row.image_url as string | undefined,
  createdAt: String(row.created_at),
  updatedAt: String(row.updated_at)
});

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [data, setData] = useState<AppData>(cloneDemo());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const mode: AuthMode = isSupabaseConfigured ? 'supabase' : 'demo';

  const updateDemo = useCallback((recipe: (current: AppData) => AppData) => {
    setData((current) => {
      const next = recipe(current);
      saveDemoData(next);
      return next;
    });
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!isSupabaseConfigured || !supabase) {
        const signedIn = localStorage.getItem(sessionKey) === 'true';
        setProfile(signedIn ? demoProfile : null);
        setData(loadDemoData());
        return;
      }
      const client = supabase;

      const {
        data: { user: authUser }
      } = await supabase.auth.getUser();
      setUser(authUser);
      if (!authUser) {
        setProfile(null);
        setData({ ...cloneDemo(), vehicles: [], odometerReadings: [], maintenanceRecords: [], documents: [], insuranceRecords: [], taxRecords: [], inspectionRecords: [] });
        return;
      }

      const [{ data: vehicles }, { data: odometer }, { data: maintenanceTypes }, { data: maintenance }, { data: documents }, { data: insurance }, { data: taxes }, { data: inspections }, { data: profileRow }] =
        await Promise.all([
          client.from('vehicles').select('*').order('created_at', { ascending: false }),
          client.from('odometer_readings').select('*').order('reading_date', { ascending: false }),
          client.from('maintenance_types').select('*').order('name'),
          client.from('maintenance_records').select('*').order('performed_at', { ascending: false }),
          client.from('documents').select('*').order('created_at', { ascending: false }),
          client.from('insurance_records').select('*').order('expires_at'),
          client.from('tax_records').select('*').order('expires_at'),
          client.from('inspection_records').select('*').order('next_due_date'),
          client.from('profiles').select('*').eq('id', authUser.id).maybeSingle()
        ]);

      const signedDocuments = await Promise.all(
        (documents || []).map(async (doc) => {
          const filePath = doc.file_path as string | undefined;
          const signedUrl = filePath ? (await client.storage.from(DOCUMENTS_BUCKET).createSignedUrl(filePath, 60 * 10)).data?.signedUrl : undefined;
          return {
            id: doc.id,
            vehicleId: doc.vehicle_id,
            userId: doc.user_id,
            maintenanceRecordId: doc.maintenance_record_id || undefined,
            name: doc.name,
            category: doc.category,
            description: doc.description || undefined,
            documentDate: doc.document_date || undefined,
            expiresAt: doc.expires_at || undefined,
            filePath,
            fileName: doc.file_name || undefined,
            fileType: doc.file_type || undefined,
            fileSize: doc.file_size || undefined,
            signedUrl,
            createdAt: doc.created_at,
            updatedAt: doc.updated_at
          } satisfies VehicleDocument;
        })
      );

      const signedVehicles = await Promise.all(
        (vehicles || []).map(async (row) => {
          const mapped = mapVehicle(row);
          const signedUrl = mapped.imagePath ? (await client.storage.from(DOCUMENTS_BUCKET).createSignedUrl(mapped.imagePath, 60 * 10)).data?.signedUrl : undefined;
          return { ...mapped, imageUrl: signedUrl || mapped.imageUrl };
        })
      );

      setProfile({
        id: authUser.id,
        email: authUser.email || '',
        fullName: (profileRow?.full_name as string | undefined) || authUser.user_metadata.full_name
      });
      setData({
        vehicles: signedVehicles,
        odometerReadings: (odometer || []).map((row) => ({ id: row.id, vehicleId: row.vehicle_id, userId: row.user_id, readingDate: row.reading_date, mileage: row.mileage, notes: row.notes || undefined })),
        maintenanceTypes: (maintenanceTypes || demoData.maintenanceTypes).map((row) => ({ id: row.id, name: row.name, category: row.category, defaultIntervalMonths: row.default_interval_months || undefined, defaultIntervalKm: row.default_interval_km || undefined, isDefault: row.is_default })),
        maintenanceRecords: (maintenance || []).map((row) => ({
          id: row.id,
          vehicleId: row.vehicle_id,
          userId: row.user_id,
          maintenanceTypeId: row.maintenance_type_id || undefined,
          typeName: row.type_name,
          title: row.title,
          performedAt: row.performed_at,
          mileage: row.mileage || undefined,
          workshop: row.workshop || undefined,
          cost: row.cost || undefined,
          notes: row.notes || undefined,
          intervalMonths: row.interval_months || undefined,
          intervalKm: row.interval_km || undefined,
          nextDueDate: row.next_due_date || undefined,
          nextDueMileage: row.next_due_mileage || undefined,
          isRecurring: row.is_recurring,
          createdAt: row.created_at
        })),
        documents: signedDocuments,
        insuranceRecords: (insurance || []).map((row) => ({ id: row.id, vehicleId: row.vehicle_id, userId: row.user_id, company: row.company, policyNumber: row.policy_number || undefined, startsAt: row.starts_at || undefined, expiresAt: row.expires_at, cost: row.cost || undefined, documentId: row.document_id || undefined })),
        taxRecords: (taxes || []).map((row) => ({ id: row.id, vehicleId: row.vehicle_id, userId: row.user_id, year: row.year, amount: row.amount || undefined, paidAt: row.paid_at || undefined, expiresAt: row.expires_at, status: row.status, documentId: row.document_id || undefined })),
        inspectionRecords: (inspections || []).map((row) => ({ id: row.id, vehicleId: row.vehicle_id, userId: row.user_id, inspectedAt: row.inspected_at, mileage: row.mileage || undefined, outcome: row.outcome || undefined, nextDueDate: row.next_due_date, documentId: row.document_id || undefined }))
      });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Errore imprevisto');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    if (!supabase) return undefined;
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      void refresh();
    });
    return () => listener.subscription.unsubscribe();
  }, [refresh]);

  const signIn = async (email: string, password: string) => {
    if (!supabase) {
      localStorage.setItem(sessionKey, 'true');
      setProfile({ ...demoProfile, email });
      setToast('Accesso demo effettuato');
      await refresh();
      return;
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    setToast('Accesso effettuato');
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    if (!supabase) {
      localStorage.setItem(sessionKey, 'true');
      setProfile({ ...demoProfile, email, fullName });
      setToast('Account demo creato');
      await refresh();
      return;
    }
    const { error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } });
    if (error) throw error;
    setToast('Registrazione completata. Controlla la tua email se la conferma e attiva.');
  };

  const signOut = async () => {
    if (!supabase) {
      localStorage.removeItem(sessionKey);
      setProfile(null);
      return;
    }
    await supabase.auth.signOut();
  };

  const addVehicle = async (draft: VehicleDraft, photo?: File) => {
    if (!profile) throw new Error('Utente non autenticato');
    const now = todayISO();
    if (!supabase) {
      const imageUrl = photo ? await fileToDataUrl(photo) : draft.imageUrl;
      const vehicle: Vehicle = { ...draft, imageUrl, id: crypto.randomUUID(), userId: profile.id, createdAt: now, updatedAt: now };
      updateDemo((current) => ({ ...current, vehicles: [vehicle, ...current.vehicles] }));
      setToast('Auto aggiunta');
      return vehicle;
    }
    const row = {
      user_id: profile.id,
      make: draft.make,
      model: draft.model,
      trim: draft.trim,
      engine: draft.engine,
      fuel: draft.fuel,
      power: draft.power,
      year: draft.year,
      plate: draft.plate,
      vin: draft.vin,
      first_registration_date: draft.firstRegistrationDate,
      purchase_date: draft.purchaseDate,
      purchase_mileage: draft.purchaseMileage,
      current_mileage: draft.currentMileage,
      mileage_updated_at: draft.mileageUpdatedAt,
      purchase_price: draft.purchasePrice,
      seller: draft.seller,
      notes: draft.notes,
      image_url: draft.imageUrl
    };
    const { data: inserted, error } = await supabase.from('vehicles').insert(row).select('*').single();
    if (error) throw error;
    if (photo) {
      const imagePath = `${profile.id}/${inserted.id}/profile/${crypto.randomUUID()}-${photo.name}`;
      const upload = await supabase.storage.from(DOCUMENTS_BUCKET).upload(imagePath, photo, { upsert: false });
      if (upload.error) throw upload.error;
      const update = await supabase.from('vehicles').update({ image_path: imagePath, image_url: null }).eq('id', inserted.id);
      if (update.error) throw update.error;
    }
    await refresh();
    return mapVehicle(inserted);
  };

  const updateVehicle = async (id: string, patch: Partial<VehicleDraft>, photo?: File) => {
    if (!supabase) {
      const imageUrl = photo ? await fileToDataUrl(photo) : patch.imageUrl;
      updateDemo((current) => ({ ...current, vehicles: current.vehicles.map((vehicle) => (vehicle.id === id ? { ...vehicle, ...patch, imageUrl: imageUrl ?? vehicle.imageUrl, updatedAt: todayISO() } : vehicle)) }));
      setToast('Anagrafica aggiornata');
      return;
    }
    let imagePath = patch.imagePath;
    if (photo && profile) {
      imagePath = `${profile.id}/${id}/profile/${crypto.randomUUID()}-${photo.name}`;
      const upload = await supabase.storage.from(DOCUMENTS_BUCKET).upload(imagePath, photo, { upsert: false });
      if (upload.error) throw upload.error;
    }
    const { error } = await supabase.from('vehicles').update({
      make: patch.make,
      model: patch.model,
      trim: patch.trim,
      engine: patch.engine,
      fuel: patch.fuel,
      power: patch.power,
      year: patch.year,
      plate: patch.plate,
      vin: patch.vin,
      first_registration_date: patch.firstRegistrationDate,
      purchase_date: patch.purchaseDate,
      purchase_mileage: patch.purchaseMileage,
      current_mileage: patch.currentMileage,
      mileage_updated_at: patch.mileageUpdatedAt,
      purchase_price: patch.purchasePrice,
      seller: patch.seller,
      notes: patch.notes,
      image_path: imagePath,
      image_url: patch.imageUrl
    }).eq('id', id);
    if (error) throw error;
    await refresh();
  };

  const deleteVehicle = async (id: string) => {
    if (!supabase) {
      updateDemo((current) => ({
        ...current,
        vehicles: current.vehicles.filter((vehicle) => vehicle.id !== id),
        maintenanceRecords: current.maintenanceRecords.filter((item) => item.vehicleId !== id),
        documents: current.documents.filter((item) => item.vehicleId !== id)
      }));
      setToast('Veicolo eliminato');
      return;
    }
    const { error } = await supabase.from('vehicles').delete().eq('id', id);
    if (error) throw error;
    await refresh();
  };

  const updateMileage = async (vehicleId: string, mileage: number, readingDate: string) => {
    if (!profile) throw new Error('Utente non autenticato');
    if (!supabase) {
      updateDemo((current) => ({
        ...current,
        vehicles: current.vehicles.map((vehicle) => (vehicle.id === vehicleId ? { ...vehicle, currentMileage: mileage, mileageUpdatedAt: readingDate, updatedAt: todayISO() } : vehicle)),
        odometerReadings: [{ id: crypto.randomUUID(), vehicleId, userId: profile.id, readingDate, mileage }, ...current.odometerReadings]
      }));
      setToast('Chilometraggio aggiornato');
      return;
    }
    const { error } = await supabase.from('odometer_readings').insert({ vehicle_id: vehicleId, user_id: profile.id, reading_date: readingDate, mileage });
    if (error) throw error;
    await supabase.from('vehicles').update({ current_mileage: mileage, mileage_updated_at: readingDate }).eq('id', vehicleId);
    await refresh();
  };

  const addMaintenance = async (draft: MaintenanceDraft) => {
    if (!profile) throw new Error('Utente non autenticato');
    const normalized = normalizeMaintenanceDraft(draft);
    if (!supabase) {
      updateDemo((current) => ({ ...current, maintenanceRecords: [{ ...normalized, id: crypto.randomUUID(), userId: profile.id, createdAt: todayISO() }, ...current.maintenanceRecords] }));
      setToast('Intervento registrato');
      return;
    }
    const { error } = await supabase.from('maintenance_records').insert({
      vehicle_id: normalized.vehicleId,
      user_id: profile.id,
      maintenance_type_id: normalized.maintenanceTypeId,
      type_name: normalized.typeName,
      title: normalized.title,
      performed_at: normalized.performedAt,
      mileage: normalized.mileage,
      workshop: normalized.workshop,
      cost: normalized.cost,
      notes: normalized.notes,
      interval_months: normalized.intervalMonths,
      interval_km: normalized.intervalKm,
      next_due_date: normalized.nextDueDate,
      next_due_mileage: normalized.nextDueMileage,
      is_recurring: normalized.isRecurring
    });
    if (error) throw error;
    await refresh();
  };

  const deleteMaintenance = async (id: string) => {
    if (!supabase) {
      updateDemo((current) => ({ ...current, maintenanceRecords: current.maintenanceRecords.filter((item) => item.id !== id) }));
      setToast('Intervento eliminato');
      return;
    }
    const { error } = await supabase.from('maintenance_records').delete().eq('id', id);
    if (error) throw error;
    await refresh();
  };

  const addDocument = async (draft: DocumentDraft, file?: File) => {
    if (!profile) throw new Error('Utente non autenticato');
    const normalized = normalizeDocumentDraft(draft);
    if (!supabase) {
      const signedUrl = file ? await fileToDataUrl(file) : undefined;
      updateDemo((current) => ({ ...current, documents: [{ ...normalized, id: crypto.randomUUID(), userId: profile.id, createdAt: todayISO(), updatedAt: todayISO(), fileName: file?.name || normalized.fileName, fileSize: file?.size || normalized.fileSize, fileType: file?.type || normalized.fileType, signedUrl }, ...current.documents] }));
      setToast('Documento caricato');
      return;
    }
    let filePath = normalized.filePath;
    if (file) {
      filePath = `${profile.id}/${normalized.vehicleId}/documents/${crypto.randomUUID()}-${file.name}`;
      const { error } = await supabase.storage.from(DOCUMENTS_BUCKET).upload(filePath, file, { upsert: false });
      if (error) throw error;
    }
    const { error } = await supabase.from('documents').insert({
      vehicle_id: normalized.vehicleId,
      user_id: profile.id,
      maintenance_record_id: normalized.maintenanceRecordId,
      name: normalized.name,
      category: normalized.category,
      description: normalized.description,
      document_date: normalized.documentDate,
      expires_at: normalized.expiresAt,
      file_path: filePath,
      file_name: file?.name || normalized.fileName,
      file_type: file?.type || normalized.fileType,
      file_size: file?.size || normalized.fileSize
    });
    if (error) throw error;
    await refresh();
  };

  const deleteDocument = async (id: string) => {
    const doc = data.documents.find((item) => item.id === id);
    if (!supabase) {
      updateDemo((current) => ({ ...current, documents: current.documents.filter((item) => item.id !== id) }));
      setToast('Documento eliminato');
      return;
    }
    if (doc?.filePath) await supabase.storage.from(DOCUMENTS_BUCKET).remove([doc.filePath]);
    const { error } = await supabase.from('documents').delete().eq('id', id);
    if (error) throw error;
    await refresh();
  };

  const value: AppContextValue = {
    mode,
    profile,
    user,
    data,
    loading,
    error,
    toast,
    isAuthenticated: Boolean(profile),
    signIn,
    signUp,
    signOut,
    refresh,
    clearToast: () => setToast(null),
    addVehicle,
    updateVehicle,
    deleteVehicle,
    updateMileage,
    addMaintenance,
    deleteMaintenance,
    addDocument,
    deleteDocument
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp deve essere usato dentro AppProvider');
  return context;
};

export const authErrorMessage = (error: unknown) => {
  const authError = error as AuthError;
  return authError?.message || (error instanceof Error ? error.message : 'Operazione non riuscita');
};
