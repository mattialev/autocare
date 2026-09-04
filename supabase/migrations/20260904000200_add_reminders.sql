create table if not exists public.reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  title text not null,
  category text not null default 'evento',
  due_date date,
  due_mileage integer check (due_mileage >= 0),
  notes text,
  completed_at date,
  completed_maintenance_record_id uuid references public.maintenance_records(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint reminders_due_check check (due_date is not null or due_mileage is not null)
);

create index if not exists reminders_vehicle_due_idx on public.reminders(vehicle_id, due_date, due_mileage);

alter table public.reminders
add column if not exists completed_maintenance_record_id uuid references public.maintenance_records(id) on delete set null;

drop trigger if exists set_reminders_updated_at on public.reminders;
create trigger set_reminders_updated_at
before update on public.reminders
for each row execute function public.set_updated_at();

alter table public.reminders enable row level security;

drop policy if exists "reminders owner all" on public.reminders;
create policy "reminders owner all" on public.reminders
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
