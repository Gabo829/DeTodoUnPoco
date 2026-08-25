create table if not exists public.registro_sistema (
  id text primary key,
  users jsonb not null default '[]'::jsonb,
  state jsonb not null default '{"historial":[],"ultimoIngreso":null,"ultimaSalida":null}'::jsonb,
  updated_at timestamptz not null default timezone('utc', now())
);

comment on table public.registro_sistema is 'Estado compartido del panel Ingreso y Salida del Local. Usa el id checkinpro_main_2026.';

create or replace function public.set_registro_sistema_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists registro_sistema_set_updated_at on public.registro_sistema;

create trigger registro_sistema_set_updated_at
before update on public.registro_sistema
for each row
execute function public.set_registro_sistema_updated_at();

alter table public.registro_sistema enable row level security;

drop policy if exists "registro_sistema_select_instance" on public.registro_sistema;
drop policy if exists "registro_sistema_insert_instance" on public.registro_sistema;
drop policy if exists "registro_sistema_update_instance" on public.registro_sistema;
drop policy if exists "registro_sistema_public_access" on public.registro_sistema;

create policy "registro_sistema_select_instance"
on public.registro_sistema
for select
using (id = 'checkinpro_main_2026');

create policy "registro_sistema_insert_instance"
on public.registro_sistema
for insert
with check (id = 'checkinpro_main_2026');

create policy "registro_sistema_update_instance"
on public.registro_sistema
for update
using (id = 'checkinpro_main_2026')
with check (id = 'checkinpro_main_2026');