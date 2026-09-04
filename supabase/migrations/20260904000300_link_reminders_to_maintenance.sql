alter table public.reminders
add column if not exists completed_maintenance_record_id uuid references public.maintenance_records(id) on delete set null;
