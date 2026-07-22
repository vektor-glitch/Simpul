const fs = require('fs');
const addressSQL = `
-- ============================================================
-- TABEL ADDRESSES
-- ============================================================
create table public.addresses (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  label text not null,
  recipient_name text not null,
  phone text not null,
  full_address text not null,
  city text not null,
  postal_code text not null,
  is_primary boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.addresses enable row level security;
create policy "Users can manage their own addresses" on public.addresses for all using ( auth.uid() = user_id ) with check ( auth.uid() = user_id );
`;
fs.appendFileSync('supabase/migrations/init.sql', '\n' + addressSQL);
console.log('Addresses schema added to init.sql');
