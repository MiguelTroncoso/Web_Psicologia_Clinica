-- Esquema de base de datos para Agenda Clínica
-- Ejecutar en Supabase: SQL Editor > New query > pegar todo > Run

-- ============ TABLAS ============

create table public.patients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  full_name text not null,
  rut text,
  birth_date date,
  phone text,
  email text,
  address text,
  occupation text,
  emergency_contact text,
  notes text,
  created_at timestamptz not null default now()
);

create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  patient_id uuid not null references public.patients (id) on delete cascade,
  starts_at timestamptz not null,
  duration_min integer not null default 50,
  status text not null default 'pendiente'
    check (status in ('pendiente', 'confirmada', 'completada', 'cancelada', 'no_asistio')),
  modality text not null default 'presencial'
    check (modality in ('presencial', 'online')),
  notes text,
  created_at timestamptz not null default now()
);

create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  patient_id uuid not null references public.patients (id) on delete cascade,
  session_date date not null default current_date,
  content text not null,
  created_at timestamptz not null default now()
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  patient_id uuid not null references public.patients (id) on delete cascade,
  amount numeric not null,
  method text not null default 'transferencia'
    check (method in ('efectivo', 'transferencia', 'tarjeta', 'otro')),
  paid_at date not null default current_date,
  notes text,
  created_at timestamptz not null default now()
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  patient_id uuid not null references public.patients (id) on delete cascade,
  title text not null,
  content text not null,
  created_at timestamptz not null default now()
);

create table public.settings (
  user_id uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  professional_name text not null default '',
  professional_title text not null default 'Psicóloga',
  professional_id text not null default '',
  clinic_name text not null default '',
  session_price numeric not null default 0
);

-- ============ ÍNDICES ============

create index idx_appointments_starts_at on public.appointments (user_id, starts_at);
create index idx_appointments_patient on public.appointments (patient_id);
create index idx_sessions_patient on public.sessions (patient_id, session_date desc);
create index idx_payments_patient on public.payments (patient_id);
create index idx_payments_paid_at on public.payments (user_id, paid_at);
create index idx_reports_patient on public.reports (patient_id);

-- ============ SEGURIDAD (RLS) ============
-- Cada usuario solo ve y modifica sus propios datos.

alter table public.patients enable row level security;
alter table public.appointments enable row level security;
alter table public.sessions enable row level security;
alter table public.payments enable row level security;
alter table public.reports enable row level security;
alter table public.settings enable row level security;

create policy "own patients" on public.patients
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own appointments" on public.appointments
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own sessions" on public.sessions
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own payments" on public.payments
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own reports" on public.reports
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own settings" on public.settings
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
