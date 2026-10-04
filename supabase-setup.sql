create table if not exists public.site_settings (
    id text primary key check (id = 'service_prices'),
    services jsonb not null
        check (jsonb_typeof(services) = 'array')
);

insert into public.site_settings (id, services)
values (
    'service_prices',
    '[
        {"name":"Manicure Tradicional","price":40},
        {"name":"Pedicure Tradicional","price":45},
        {"name":"Esmaltação em Gel (mãos)","price":75},
        {"name":"Esmaltação em Gel (pés)","price":75},
        {"name":"Alongamento em SoftGel","price":180},
        {"name":"Manutenção Alongamento","price":130},
        {"name":"Esmaltação bio adesiva","price":75},
        {"name":"Spa dos Pés + Hidratação","price":90}
    ]'::jsonb
)
on conflict (id) do nothing;

create table if not exists public.bookings (
    id uuid primary key default gen_random_uuid(),
    customer_name text not null
        check (char_length(trim(customer_name)) between 1 and 100),
    service text not null
        check (char_length(service) between 1 and 180),
    appointment_date date not null
        check (
            extract(isodow from appointment_date) between 2 and 6
        ),
    appointment_time time not null
        check (
            appointment_time between time '09:00' and time '19:00'
            and extract(minute from appointment_time) in (0, 30)
            and (extract(hour from appointment_time) < 19 or appointment_time = time '19:00')
        ),
    created_at timestamptz not null default now(),
    unique (appointment_date, appointment_time)
);

alter table public.site_settings enable row level security;
alter table public.bookings enable row level security;

drop policy if exists "Public can read service prices" on public.site_settings;
create policy "Public can read service prices"
    on public.site_settings for select
    to anon, authenticated
    using (id = 'service_prices');

drop policy if exists "Admin can insert service prices" on public.site_settings;
create policy "Admin can insert service prices"
    on public.site_settings for insert
    to authenticated
    with check (
        id = 'service_prices'
        and (select auth.jwt() ->> 'email') = 'borgesjaine1@gmail.com'
    );

drop policy if exists "Admin can update service prices" on public.site_settings;
create policy "Admin can update service prices"
    on public.site_settings for update
    to authenticated
    using (
        id = 'service_prices'
        and (select auth.jwt() ->> 'email') = 'borgesjaine1@gmail.com'
    )
    with check (
        id = 'service_prices'
        and (select auth.jwt() ->> 'email') = 'borgesjaine1@gmail.com'
    );

drop policy if exists "Public can book an available time" on public.bookings;
create policy "Public can book an available time"
    on public.bookings for insert
    to anon, authenticated
    with check (appointment_date >= current_date);

drop policy if exists "Admin can read bookings" on public.bookings;
create policy "Admin can read bookings"
    on public.bookings for select
    to authenticated
    using ((select auth.jwt() ->> 'email') = 'borgesjaine1@gmail.com');

grant select on public.site_settings to anon, authenticated;
grant insert, update on public.site_settings to authenticated;
grant insert on public.bookings to anon, authenticated;
grant select on public.bookings to authenticated;
