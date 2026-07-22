-- EXTENSION UNTUK ENKRIPSI PASSWORD & UUID
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- TABEL USERS (Profil Dasar & Autentikasi)
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('buyer', 'producer', 'admin')),
  created_at timestamptz not null default now()
);

-- TABEL BUYER PROFILES
create table public.buyer_profiles (
  user_id uuid primary key references public.users(id) on delete cascade,
  name text not null,
  phone text,
  address text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- TABEL PRODUCER PROFILES (Petani/Peternak/Pengrajin)
create table public.producer_profiles (
  user_id uuid primary key references public.users(id) on delete cascade,
  business_name text not null,
  location text not null,
  region text not null,
  category text not null check (category in ('Pertanian', 'Peternakan', 'Kerajinan', 'Lainnya')),
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index producer_profiles_category_idx on public.producer_profiles(category);

-- TABEL PRODUCTS (Inventori Jualan)
create table public.products (
  id uuid primary key default uuid_generate_v4(),
  producer_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  category text not null check (category in ('Pertanian', 'Peternakan', 'Kerajinan', 'Lainnya')),
  description text,
  price_producer numeric(12,2) not null check (price_producer >= 0),
  price_final numeric(12,2) not null check (price_final >= 0),
  platform_fee numeric(12,2) not null check (platform_fee >= 0),
  stock int not null default 0 check (stock >= 0),
  unit text not null,
  image_url text,
  is_active boolean not null default true,
  rating numeric(3,1) not null default 0.0,
  review_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index products_producer_id_idx on public.products(producer_id);
create index products_category_idx on public.products(category);

-- TABEL POOLS (Kolaborasi/Grosir)
create table public.pools (
  id uuid primary key default uuid_generate_v4(),
  category text not null,
  region text not null,
  title text not null,
  target_quantity int not null check (target_quantity > 0),
  collected_quantity int not null default 0 check (collected_quantity >= 0),
  sold_quantity int not null default 0 check (sold_quantity >= 0),
  price numeric(12,2) not null default 0,
  unit text not null,
  status text not null default 'open' check (status in ('open', 'fulfilled', 'sold_out', 'closed')),
  deadline date not null,
  image_url text,
  created_at timestamptz not null default now()
);

create index pools_region_category_idx on public.pools(region, category);

-- TABEL POOL CONTRIBUTIONS
create table public.pool_contributions (
  id uuid primary key default uuid_generate_v4(),
  pool_id uuid not null references public.pools(id) on delete cascade,
  producer_id uuid not null references public.users(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  quantity_committed int not null check (quantity_committed > 0),
  created_at timestamptz not null default now(),
  unique (pool_id, producer_id)
);

-- TABEL ORDERS
create table public.orders (
  id uuid primary key default uuid_generate_v4(),
  buyer_id uuid not null references public.users(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  pool_id uuid references public.pools(id) on delete set null,
  quantity int not null check (quantity > 0),
  shipping_cost numeric(12,2) not null default 0,
  subtotal numeric(12,2) not null default 0,
  admin_fee numeric(12,2) not null default 0,
  unit_price numeric(12,2) not null default 0,
  total_price numeric(12,2) not null check (total_price >= 0),
  status text not null default 'pending' check (
    status in ('pending', 'processed', 'packed', 'shipped', 'delivered', 'cancelled')
  ),
  shipping_address text not null,
  receipt_number text,
  processed_at timestamptz,
  packed_at timestamptz,
  shipped_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz not null default now(),
  constraint order_source_check check (
    (product_id is not null and pool_id is null) or
    (product_id is null and pool_id is not null)
  )
);

create index orders_buyer_id_idx on public.orders(buyer_id);
create index orders_status_idx on public.orders(status);

-- TABEL ORDER STATUS HISTORY
create table public.order_status_history (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references public.orders(id) on delete cascade,
  status text not null,
  note text,
  updated_at timestamptz not null default now()
);

create index order_status_history_order_id_idx on public.order_status_history(order_id);

-- TABEL REVIEWS
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

-- TABEL CART ITEMS
create table public.cart_items (
  id uuid default gen_random_uuid() primary key,
  buyer_id uuid references public.users(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete cascade not null,
  quantity integer not null check (quantity > 0),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(buyer_id, product_id)
);

-- STORAGE BUCKETS (AVATARS)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Avatar images are publicly accessible."
ON storage.objects FOR SELECT
USING ( bucket_id = 'avatars' );

CREATE POLICY "Authenticated users can upload avatars."
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'avatars' AND auth.role() = 'authenticated' );

CREATE POLICY "Authenticated users can update avatars."
ON storage.objects FOR UPDATE
WITH CHECK ( bucket_id = 'avatars' AND auth.role() = 'authenticated' );

-- TRIGGER: MENGHITUNG RATA-RATA RATING (ROBOT)
CREATE OR REPLACE FUNCTION public.update_product_rating()
RETURNS trigger AS $$
DECLARE
  target_product_id uuid;
BEGIN
  IF TG_OP = 'DELETE' THEN
    SELECT product_id INTO target_product_id FROM public.orders WHERE id = OLD.order_id;
  ELSE
    SELECT product_id INTO target_product_id FROM public.orders WHERE id = NEW.order_id;
  END IF;

  UPDATE public.products
  SET 
    rating = COALESCE((
      SELECT ROUND(AVG(r.rating), 1)
      FROM public.reviews r
      JOIN public.orders o ON o.id = r.order_id
      WHERE o.product_id = target_product_id
    ), 0.0),
    review_count = (
      SELECT COUNT(r.id)
      FROM public.reviews r
      JOIN public.orders o ON o.id = r.order_id
      WHERE o.product_id = target_product_id
    )
  WHERE id = target_product_id;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_review_changed ON public.reviews;
CREATE TRIGGER on_review_changed
AFTER INSERT OR UPDATE OR DELETE ON public.reviews
FOR EACH ROW EXECUTE PROCEDURE public.update_product_rating();

-- ROW LEVEL SECURITY 
alter table public.users enable row level security;
alter table public.buyer_profiles enable row level security;
alter table public.producer_profiles enable row level security;
alter table public.products enable row level security;
alter table public.pools enable row level security;
alter table public.pool_contributions enable row level security;
alter table public.orders enable row level security;
alter table public.order_status_history enable row level security;
alter table public.reviews enable row level security;
alter table public.cart_items enable row level security;

-- Helper: cek peran (role) pengguna saat ini
create function public.current_user_role()
returns text as $$
  select role from public.users where id = auth.uid();
$$ language sql stable security definer;

-- ---------- USERS ----------
create policy "Pengguna dapat melihat semua profil" on public.users for select using (true);
create policy "Pengguna dapat memperbarui profil sendiri" on public.users for update using (auth.uid() = id);

-- ---------- BUYER PROFILES ----------
create policy "Siapa saja dapat melihat profil pembeli" on public.buyer_profiles for select using (true);
create policy "Pembeli dapat mengelola profil sendiri" on public.buyer_profiles for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------- PRODUCER PROFILES ----------
create policy "Siapa saja dapat melihat profil produsen" on public.producer_profiles for select using (true);
create policy "Produsen dapat mengelola profil sendiri" on public.producer_profiles for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------- PRODUCTS ----------
create policy "Siapa saja dapat melihat produk aktif" on public.products for select using (is_active = true or producer_id = auth.uid());
create policy "Produsen dapat mengelola produk sendiri" on public.products for insert with check (auth.uid() = producer_id and public.current_user_role() = 'producer');
create policy "Produsen dapat memperbarui produk sendiri" on public.products for update using (auth.uid() = producer_id);
create policy "Produsen dapat menghapus produk sendiri" on public.products for delete using (auth.uid() = producer_id);

-- ---------- POOLS ----------
create policy "Siapa saja dapat melihat pool" on public.pools for select using (true);
create policy "Produsen dapat membuat pool" on public.pools for insert with check (public.current_user_role() = 'producer');
create policy "Admin dapat mengelola pool" on public.pools for update using (public.current_user_role() = 'admin');

-- ---------- POOL CONTRIBUTIONS ----------
create policy "Siapa saja dapat melihat kontribusi pool" on public.pool_contributions for select using (true);
create policy "Produsen dapat menambah kontribusi sendiri" on public.pool_contributions for insert with check (auth.uid() = producer_id and public.current_user_role() = 'producer');
create policy "Produsen dapat menghapus kontribusi sendiri" on public.pool_contributions for delete using (auth.uid() = producer_id);

-- ---------- ORDERS ----------
create policy "Pembeli dapat melihat pesanan sendiri" on public.orders for select using (auth.uid() = buyer_id or auth.uid() in (select producer_id from public.products where id = orders.product_id union select pc.producer_id from public.pool_contributions pc where pc.pool_id = orders.pool_id) or public.current_user_role() = 'admin');
create policy "Pembeli dapat membuat pesanan" on public.orders for insert with check (auth.uid() = buyer_id and public.current_user_role() in ('buyer', 'producer'));
create policy "Produsen dapat memperbarui status pesanan" on public.orders for update using (auth.uid() in (select producer_id from public.products where id = orders.product_id union select pc.producer_id from public.pool_contributions pc where pc.pool_id = orders.pool_id));
create policy "Pembeli dapat mengonfirmasi pesanan diterima" on public.orders for update using (auth.uid() = buyer_id);
create policy "Pembeli dapat menghapus pesanan pending" on public.orders for delete using (auth.uid() = buyer_id and status = 'pending');

-- ---------- ORDER STATUS HISTORY ----------
create policy "Melihat riwayat status untuk pesanan yang dapat diakses" on public.order_status_history for select using (order_id in (select id from public.orders));
create policy "Produsen dapat memasukkan pembaruan status" on public.order_status_history for insert with check (order_id in (select o.id from public.orders o join public.products p on p.id = o.product_id where p.producer_id = auth.uid()) or public.current_user_role() = 'admin');

-- ---------- REVIEWS ----------
create policy "Siapa saja dapat melihat ulasan" on public.reviews for select using (true);
create policy "Pembeli dapat mengulas pesanan sendiri yang sudah selesai" on public.reviews for insert with check (auth.uid() = buyer_id and exists (select 1 from public.orders where id = order_id and buyer_id = auth.uid() and status = 'delivered'));

-- ---------- CART ITEMS ----------
create policy "Users can view their own cart items" on public.cart_items for select using ( auth.uid() = buyer_id );
create policy "Users can insert their own cart items" on public.cart_items for insert with check ( auth.uid() = buyer_id );
create policy "Users can update their own cart items" on public.cart_items for update using ( auth.uid() = buyer_id );
create policy "Users can delete their own cart items" on public.cart_items for delete using ( auth.uid() = buyer_id );
-- TABEL NOTIFICATIONS
create table public.notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  title text not null,
  message text not null,
  type text not null,
  link text,
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS NOTIFICATIONS
alter table public.notifications enable row level security;
create policy "Users can view their own notifications" on public.notifications for select using ( auth.uid() = user_id );
create policy "Users can update their own notifications" on public.notifications for update using ( auth.uid() = user_id );

-- TRIGGER: NOTIFIKASI STATUS PESANAN
create or replace function public.handle_order_status_change()
returns trigger as $$
begin
  if old.status <> new.status then
    insert into public.notifications (user_id, title, message, type, link)
    values (
      new.buyer_id, 
      'Status Pesanan Diperbarui', 
      'Pesanan anda sekarang berstatus: ' || new.status, 
      'order_status', 
      '/cart'
    );
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_order_status_change
  after update on public.orders
  for each row execute procedure public.handle_order_status_change();


-- TABEL ADDRESSES
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

-- Added for Komerce RajaOngkir V2
alter table public.producer_profiles add column rajaongkir_location_id text;
alter table public.addresses add column rajaongkir_location_id text;


-- TABEL WALLETS
CREATE TABLE public.wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
    balance BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own wallet" ON public.wallets FOR SELECT USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $body
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$body language 'plpgsql';

CREATE TRIGGER update_wallets_updated_at
    BEFORE UPDATE ON public.wallets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- TABEL WITHDRAWALS
create table public.withdrawals (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.users(id) on delete cascade not null,
    amount numeric not null check (amount > 0),
    bank_name text not null,
    account_number text not null,
    account_name text not null,
    status text not null default 'pending' check (status in ('pending', 'processing', 'completed', 'rejected')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.withdrawals enable row level security;
create policy "Producer can view own withdrawals" on public.withdrawals for select using (auth.uid() = user_id);
create policy "Producer can insert own withdrawals" on public.withdrawals for insert with check (auth.uid() = user_id);
create policy "Admin can view all withdrawals" on public.withdrawals for select using (exists (select 1 from public.users where users.id = auth.uid() and users.role = 'admin'));

CREATE TRIGGER update_withdrawals_updated_at
    BEFORE UPDATE ON public.withdrawals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- STORAGE BUCKETS (PRODUCTS)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('products', 'products', true)
ON CONFLICT (id) DO UPDATE SET public = true;

CREATE POLICY "Product images are publicly accessible."
ON storage.objects FOR SELECT
USING ( bucket_id = 'products' );

CREATE POLICY "Authenticated users can upload product images."
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'products' AND auth.role() = 'authenticated' );

CREATE POLICY "Authenticated users can update product images."
ON storage.objects FOR UPDATE
WITH CHECK ( bucket_id = 'products' AND auth.role() = 'authenticated' );
