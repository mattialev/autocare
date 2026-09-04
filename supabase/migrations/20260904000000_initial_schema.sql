create extension if not exists "pgcrypto";

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.vehicles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  make text not null,
  model text not null,
  trim text,
  engine text,
  fuel text not null default 'altro',
  power text,
  year integer,
  plate text,
  vin text,
  first_registration_date date,
  purchase_date date,
  purchase_mileage integer,
  current_mileage integer not null default 0 check (current_mileage >= 0),
  mileage_updated_at date,
  purchase_price numeric(12,2),
  seller text,
  notes text,
  image_path text,
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.odometer_readings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  reading_date date not null,
  mileage integer not null check (mileage >= 0),
  notes text,
  created_at timestamptz not null default now()
);

create table public.maintenance_types (
  id text primary key,
  name text not null,
  category text not null default 'altro',
  default_interval_months integer,
  default_interval_km integer,
  is_default boolean not null default true
);

create table public.maintenance_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  maintenance_type_id text references public.maintenance_types(id),
  type_name text not null,
  title text not null,
  performed_at date not null,
  mileage integer check (mileage >= 0),
  workshop text,
  cost numeric(12,2),
  notes text,
  interval_months integer,
  interval_km integer,
  next_due_date date,
  next_due_mileage integer,
  is_recurring boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  maintenance_record_id uuid references public.maintenance_records(id) on delete set null,
  name text not null,
  category text not null default 'Altro',
  description text,
  document_date date,
  expires_at date,
  file_path text,
  file_name text,
  file_type text,
  file_size integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.insurance_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  company text not null,
  policy_number text,
  starts_at date,
  expires_at date not null,
  cost numeric(12,2),
  document_id uuid references public.documents(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.tax_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  year integer not null,
  amount numeric(12,2),
  paid_at date,
  expires_at date not null,
  status text not null default 'da_pagare',
  document_id uuid references public.documents(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.inspection_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  inspected_at date not null,
  mileage integer,
  outcome text,
  next_due_date date not null,
  document_id uuid references public.documents(id) on delete set null,
  created_at timestamptz not null default now()
);

create index vehicles_user_id_idx on public.vehicles(user_id);
create index odometer_vehicle_idx on public.odometer_readings(vehicle_id, reading_date desc);
create index maintenance_vehicle_due_idx on public.maintenance_records(vehicle_id, next_due_date);
create index documents_vehicle_expires_idx on public.documents(vehicle_id, expires_at);
create index insurance_vehicle_expires_idx on public.insurance_records(vehicle_id, expires_at);
create index tax_vehicle_expires_idx on public.tax_records(vehicle_id, expires_at);
create index inspection_vehicle_expires_idx on public.inspection_records(vehicle_id, next_due_date);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger set_vehicles_updated_at before update on public.vehicles for each row execute function public.set_updated_at();
create trigger set_maintenance_updated_at before update on public.maintenance_records for each row execute function public.set_updated_at();
create trigger set_documents_updated_at before update on public.documents for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, coalesce(new.email, ''), new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

insert into public.maintenance_types (id, name, category, default_interval_months, default_interval_km, is_default) values
('tagliando', 'Tagliando', 'tagliando', 12, 15000, true),
('olio', 'Cambio olio motore', 'olio', 12, 15000, true),
('filtro-olio', 'Filtro olio', 'filtri', 12, 15000, true),
('filtro-aria', 'Filtro aria', 'filtri', 24, 30000, true),
('filtro-abitacolo', 'Filtro abitacolo', 'filtri', 12, null, true),
('candele', 'Candele', 'altro', 48, 60000, true),
('liquido-freni', 'Liquido freni', 'liquidi', 24, null, true),
('refrigerante', 'Liquido refrigerante', 'liquidi', 48, null, true),
('batteria', 'Batteria', 'batteria', 60, null, true),
('pneumatici', 'Pneumatici', 'pneumatici', 60, 45000, true),
('rotazione', 'Rotazione pneumatici', 'pneumatici', 6, 10000, true),
('convergenza', 'Convergenza', 'pneumatici', 12, null, true),
('pastiglie', 'Pastiglie freno', 'freni', null, 35000, true),
('dischi', 'Dischi freno', 'freni', null, 70000, true),
('distribuzione', 'Distribuzione', 'distribuzione', 72, 120000, true),
('cinghia-servizi', 'Cinghia servizi', 'distribuzione', 60, 90000, true),
('cambio-auto', 'Manutenzione cambio automatico', 'altro', 48, 60000, true),
('revisione', 'Revisione', 'revisione', 24, null, true),
('altro', 'Altro', 'altro', null, null, true)
on conflict (id) do nothing;

alter table public.profiles enable row level security;
alter table public.vehicles enable row level security;
alter table public.odometer_readings enable row level security;
alter table public.maintenance_types enable row level security;
alter table public.maintenance_records enable row level security;
alter table public.documents enable row level security;
alter table public.insurance_records enable row level security;
alter table public.tax_records enable row level security;
alter table public.inspection_records enable row level security;

create policy "profiles owner read" on public.profiles for select using (auth.uid() = id);
create policy "profiles owner update" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

create policy "maintenance types readable" on public.maintenance_types for select to authenticated using (true);

create policy "vehicles owner all" on public.vehicles for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "odometer owner all" on public.odometer_readings for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "maintenance owner all" on public.maintenance_records for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "documents owner all" on public.documents for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "insurance owner all" on public.insurance_records for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "tax owner all" on public.tax_records for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "inspection owner all" on public.inspection_records for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('vehicle-documents', 'vehicle-documents', false, 10485760, array['application/pdf', 'image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set
  public = false,
  file_size_limit = 10485760,
  allowed_mime_types = array['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];

create policy "storage owner read" on storage.objects
for select to authenticated
using (bucket_id = 'vehicle-documents' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "storage owner insert" on storage.objects
for insert to authenticated
with check (bucket_id = 'vehicle-documents' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "storage owner update" on storage.objects
for update to authenticated
using (bucket_id = 'vehicle-documents' and auth.uid()::text = (storage.foldername(name))[1])
with check (bucket_id = 'vehicle-documents' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "storage owner delete" on storage.objects
for delete to authenticated
using (bucket_id = 'vehicle-documents' and auth.uid()::text = (storage.foldername(name))[1]);
