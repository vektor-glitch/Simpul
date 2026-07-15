-- ============================================================
-- Simpul
-- ============================================================

create extension if not exists "uuid-ossp";

-- ============================================================
-- 1. TABEL USERS 
-- ============================================================
create table public.users (
  id uuid references auth.users(id) on delete cascade primary key,
  role text not null check (role in ('producer', 'buyer', 'admin')),
  name text not null,
  phone text,
  verified boolean not null default false,
  created_at timestamptz not null default now()
);

-- ini buat tiap ada yang register, data akan disalin ke tabel public.users agar bisa dikelola
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, role, name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'role', 'buyer'),
    coalesce(new.raw_user_meta_data->>'name', 'New User')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- 2. TABEL PRODUCER PROFILES
-- ============================================================
create table public.producer_profiles (
  user_id uuid references public.users(id) on delete cascade primary key,
  business_name text not null,
  location text not null,
  region text not null,
  category text not null,
  description text,
  created_at timestamptz not null default now()
);

-- ============================================================
-- 3. TABEL PRODUCTS
-- ============================================================
create table public.products (
  id uuid primary key default uuid_generate_v4(),
  producer_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  category text not null,
  description text,
  price_producer numeric(12,2) not null check (price_producer >= 0),
  price_final numeric(12,2) not null check (price_final >= 0),
  platform_fee numeric(12,2) not null default 0,
  stock int not null default 0 check (stock >= 0),
  unit text not null,
  image_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index products_producer_id_idx on public.products(producer_id);
create index products_category_idx on public.products(category);

-- ============================================================
-- 4. TABEL POOLS (buat pesanan sekala besar)
-- ============================================================
create table public.pools (
  id uuid primary key default uuid_generate_v4(),
  category text not null,
  region text not null,
  title text not null,
  target_quantity int not null check (target_quantity > 0),
  current_quantity int not null default 0 check (current_quantity >= 0),
  unit text not null,
  status text not null default 'open' check (status in ('open', 'fulfilled', 'closed', 'expired')),
  deadline date not null,
  created_at timestamptz not null default now()
);

create index pools_region_category_idx on public.pools(region, category);

-- ==================================================================================================================
-- 5. TABEL POOL CONTRIBUTIONS (pesanan sekala besar tidak mungkin dari satu petani, makanya ada kontributor lain)
-- ==================================================================================================================
create table public.pool_contributions (
  id uuid primary key default uuid_generate_v4(),
  pool_id uuid not null references public.pools(id) on delete cascade,
  producer_id uuid not null references public.users(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  quantity_committed int not null check (quantity_committed > 0),
  created_at timestamptz not null default now(),
  unique (pool_id, producer_id)
);

-- ============================================================
-- 6. TABEL ORDERS
-- ============================================================
create table public.orders (
  id uuid primary key default uuid_generate_v4(),
  buyer_id uuid not null references public.users(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  pool_id uuid references public.pools(id) on delete set null,
  quantity int not null check (quantity > 0),
  shipping_cost numeric(12,2) not null default 0,
  total_price numeric(12,2) not null check (total_price >= 0),
  status text not null default 'pending' check (
    status in ('pending', 'processed', 'packed', 'shipped', 'delivered', 'cancelled')
  ),
  shipping_address text not null,
  created_at timestamptz not null default now(),
  constraint order_source_check check (
    (product_id is not null and pool_id is null) or
    (product_id is null and pool_id is not null)
  )
);

create index orders_buyer_id_idx on public.orders(buyer_id);
create index orders_status_idx on public.orders(status);

-- ============================================================
-- 7. TABEL ORDER STATUS HISTORY
-- ============================================================
create table public.order_status_history (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references public.orders(id) on delete cascade,
  status text not null,
  note text,
  updated_at timestamptz not null default now()
);

create index order_status_history_order_id_idx on public.order_status_history(order_id);

-- ============================================================
-- 8. TABEL REVIEWS
-- ============================================================
create table public.reviews (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references public.orders(id) on delete cascade unique,
  buyer_id uuid not null references public.users(id) on delete cascade,
  producer_id uuid not null references public.users(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now()
);

create index reviews_producer_id_idx on public.reviews(producer_id);

-- ============================================================
-- ROW LEVEL SECURITY 
-- ============================================================

alter table public.users enable row level security;
alter table public.producer_profiles enable row level security;
alter table public.products enable row level security;
alter table public.pools enable row level security;
alter table public.pool_contributions enable row level security;
alter table public.orders enable row level security;
alter table public.order_status_history enable row level security;
alter table public.reviews enable row level security;

-- Helper: cek peran (role) pengguna saat ini
create function public.current_user_role()
returns text as $$
  select role from public.users where id = auth.uid();
$$ language sql stable security definer;

-- ---------- USERS ----------
create policy "Pengguna dapat melihat semua profil"
  on public.users for select
  using (true);

create policy "Pengguna dapat memperbarui profil sendiri"
  on public.users for update
  using (auth.uid() = id);

-- ---------- PRODUCER PROFILES ----------
create policy "Siapa saja dapat melihat profil produsen"
  on public.producer_profiles for select
  using (true);

create policy "Produsen dapat mengelola profil sendiri"
  on public.producer_profiles for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------- PRODUCTS ----------
create policy "Siapa saja dapat melihat produk aktif"
  on public.products for select
  using (is_active = true or producer_id = auth.uid());

create policy "Produsen dapat mengelola produk sendiri"
  on public.products for insert
  with check (auth.uid() = producer_id and public.current_user_role() = 'producer');

create policy "Produsen dapat memperbarui produk sendiri"
  on public.products for update
  using (auth.uid() = producer_id);

create policy "Produsen dapat menghapus produk sendiri"
  on public.products for delete
  using (auth.uid() = producer_id);

-- ---------- POOLS ----------
create policy "Siapa saja dapat melihat pool"
  on public.pools for select
  using (true);

create policy "Produsen dapat membuat pool"
  on public.pools for insert
  with check (public.current_user_role() = 'producer');

create policy "Admin dapat mengelola pool"
  on public.pools for update
  using (public.current_user_role() = 'admin');

-- ---------- POOL CONTRIBUTIONS ----------
create policy "Siapa saja dapat melihat kontribusi pool"
  on public.pool_contributions for select
  using (true);

create policy "Produsen dapat menambah kontribusi sendiri"
  on public.pool_contributions for insert
  with check (auth.uid() = producer_id and public.current_user_role() = 'producer');

create policy "Produsen dapat menghapus kontribusi sendiri"
  on public.pool_contributions for delete
  using (auth.uid() = producer_id);

-- ---------- ORDERS ----------
create policy "Pembeli dapat melihat pesanan sendiri"
  on public.orders for select
  using (
    auth.uid() = buyer_id
    or auth.uid() in (
      select producer_id from public.products where id = orders.product_id
      union
      select pc.producer_id from public.pool_contributions pc where pc.pool_id = orders.pool_id
    )
    or public.current_user_role() = 'admin'
  );

create policy "Pembeli dapat membuat pesanan"
  on public.orders for insert
  with check (auth.uid() = buyer_id and public.current_user_role() in ('buyer', 'producer'));

create policy "Produsen dapat memperbarui status pesanan"
  on public.orders for update
  using (
    auth.uid() in (
      select producer_id from public.products where id = orders.product_id
      union
      select pc.producer_id from public.pool_contributions pc where pc.pool_id = orders.pool_id
    )
  );

-- ---------- ORDER STATUS HISTORY ----------
create policy "Melihat riwayat status untuk pesanan yang dapat diakses"
  on public.order_status_history for select
  using (
    order_id in (select id from public.orders)
  );

create policy "Produsen dapat memasukkan pembaruan status"
  on public.order_status_history for insert
  with check (
    order_id in (
      select o.id from public.orders o
      join public.products p on p.id = o.product_id
      where p.producer_id = auth.uid()
    )
    or public.current_user_role() = 'admin'
  );

-- ---------- REVIEWS ----------
create policy "Siapa saja dapat melihat ulasan"
  on public.reviews for select
  using (true);

create policy "Pembeli dapat mengulas pesanan sendiri yang sudah selesai"
  on public.reviews for insert
  with check (
    auth.uid() = buyer_id
    and exists (
      select 1 from public.orders
      where id = order_id and buyer_id = auth.uid() and status = 'delivered'
    )
  );