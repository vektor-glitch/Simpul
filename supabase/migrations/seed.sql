-- EXTENSION UNTUK ENKRIPSI PASSWORD
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- AKUN USER (PASSWORDNYA: password123)
INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
VALUES 
-- 1 Akun Admin
('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'admin@simpul.test', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"name":"Admin Simpul", "role":"admin"}', now(), now()),
-- 3 Akun Produsen
('22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'petani@simpul.test', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"name":"Pak Budi", "role":"producer"}', now(), now()),
('33333333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'peternak@simpul.test', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"name":"Bu Tejo", "role":"producer"}', now(), now()),
('44444444-4444-4444-4444-444444444444', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'pengrajin@simpul.test', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"name":"Mang Oleh", "role":"producer"}', now(), now()),
-- 2 Akun Buyer
('55555555-5555-5555-5555-555555555555', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'pembeli1@simpul.test', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"name":"Restoran Sehat Jakarta", "role":"buyer"}', now(), now()),
('66666666-6666-6666-6666-666666666666', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'pembeli2@simpul.test', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"name":"Katering Bu Nina", "role":"buyer"}', now(), now());

-- INSERT KE PRODUCER_PROFILES
INSERT INTO public.producer_profiles (user_id, business_name, location, region, category, description)
VALUES 
('22222222-2222-2222-2222-222222222222', 'Kebun Sayur Budi', 'Ds. Cibodas', 'Jawa Barat', 'Pertanian', 'Fokus pada sayuran organik tanpa pestisida sejak 2010.'),
('33333333-3333-3333-3333-333333333333', 'Peternakan Tejo Makmur', 'Blitar', 'Jawa Timur', 'Peternakan', 'Peternakan unggas bebas kandang sempit (cage-free).'),
('44444444-4444-4444-4444-444444444444', 'Kriya Oleh-Oleh', 'Gianyar', 'Bali', 'Kerajinan', 'Pengrajin bambu dan rotan khas nusantara.');

-- INSERT 15 PRODUK DUMMY
INSERT INTO public.products (producer_id, name, category, description, price_producer, price_final, platform_fee, stock, unit, image_url, is_active)
VALUES 
-- Produk dari Pak Budi (Pertanian)
('22222222-2222-2222-2222-222222222222', 'Kangkung Organik', 'Pertanian', 'Kangkung segar dipanen pagi hari.', 8000, 9000, 1000, 150, 'ikat', 'https://images.unsplash.com/photo-1623490439625-758205dc3219?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', true),
('22222222-2222-2222-2222-222222222222', 'Bayam Merah', 'Pertanian', 'Bayam merah kaya zat besi.', 9000, 10000, 1000, 120, 'ikat', 'https://images.unsplash.com/photo-1587578855742-e229eb43888b?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', true),
('22222222-2222-2222-2222-222222222222', 'Tomat Cherry', 'Pertanian', 'Tomat manis untuk salad.', 18000, 20000, 2000, 50, 'kg', 'https://images.unsplash.com/photo-1587334274535-5f82e7e55dc0?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', true),
('22222222-2222-2222-2222-222222222222', 'Beras Merah Premium', 'Pertanian', 'Beras merah utuh bebas pengawet.', 22000, 25000, 3000, 500, 'kg', 'https://images.pexels.com/photos/8108117/pexels-photo-8108117.jpeg', true),
('22222222-2222-2222-2222-222222222222', 'Cabai Rawit Setan', 'Pertanian', 'Cabai rawit super pedas pilihan.', 40000, 45000, 5000, 80, 'kg', 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', true),

-- Produk dari Bu Tejo (Peternakan)
('33333333-3333-3333-3333-333333333333', 'Telur Ayam Kampung', 'Peternakan', 'Telur ayam kampung asli, warna cangkang krem.', 25000, 28000, 3000, 200, 'kg', 'https://images.unsplash.com/photo-1587486913049-53fc88980cfc?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', true),
('33333333-3333-3333-3333-333333333333', 'Telur Bebek Omega', 'Peternakan', 'Kuning telur lebih masir dan kaya omega.', 32000, 35000, 3000, 100, 'tray', 'https://pixabay.com/images/download/barskefranck-egg-4067035_1920.jpg', true),
('33333333-3333-3333-3333-333333333333', 'Daging Ayam Probiotik', 'Peternakan', 'Ayam potong yang diberi pakan probiotik alami.', 40000, 45000, 5000, 60, 'ekor', 'https://cdn.pixabay.com/photo/2021/10/01/12/27/chicken-6672356_1280.jpg', true),
('33333333-3333-3333-3333-333333333333', 'Susu Kambing Etawa', 'Peternakan', 'Susu murni yang dibekukan agar tahan lama.', 15000, 18000, 3000, 90, 'liter', 'https://images.pexels.com/photos/18258533/pexels-photo-18258533.jpeg', true),
('33333333-3333-3333-3333-333333333333', 'Madu Kelulut', 'Peternakan', 'Madu asam manis dari lebah tanpa sengat.', 120000, 130000, 10000, 20, 'botol', 'https://images.unsplash.com/photo-1621757523499-c3264bbcc15e?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', true),

-- Produk dari Mang Oleh (Kerajinan)
('44444444-4444-4444-4444-444444444444', 'Keranjang Bambu Sedang', 'Kerajinan', 'Cocok untuk hampers atau parsel.', 20000, 23000, 3000, 40, 'pcs', 'https://images.pexels.com/photos/19515730/pexels-photo-19515730.jpeg', true),
('44444444-4444-4444-4444-444444444444', 'Tikar Anyam Pandan', 'Kerajinan', 'Tikar tradisional sejuk untuk alas lantai.', 75000, 85000, 10000, 15, 'lembar', 'https://images.unsplash.com/photo-1675765765869-dcf7da360fd1?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', true),
('44444444-4444-4444-4444-444444444444', 'Topi Caping Lebar', 'Kerajinan', 'Topi bambu anti panas untuk petani.', 15000, 18000, 3000, 100, 'pcs', 'https://images.pexels.com/photos/34068352/pexels-photo-34068352.jpeg', true),
('44444444-4444-4444-4444-444444444444', 'Tas Rotan Estetik', 'Kerajinan', 'Tas wanita berbahan rotan dengan furing dalam.', 110000, 125000, 15000, 25, 'pcs', 'https://images.unsplash.com/photo-1630071168464-c2e006dd9789?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', true),
('44444444-4444-4444-4444-444444444444', 'Piring Lidi Kelapa', 'Kerajinan', 'Piring saji tradisional yang kuat dan rapi.', 3000, 5000, 2000, 300, 'pcs', 'https://plut.riau.go.id/assets/uploads/produk/240823_123646_PIRING_LIDI.jpg', true);

-- INSERT POOL EXAMPLES
INSERT INTO public.pools (category, region, title, target_quantity, current_quantity, unit, status, deadline)
VALUES 
('Pertanian', 'Jawa Barat', 'Supply Kangkung Organik Restoran Vegan Jakarta', 1000, 250, 'ikat', 'open', '2026-12-31'),
('Peternakan', 'Jawa Timur', 'Kebutuhan Telur Ayam Kampung Katering Bulanan', 2000, 1800, 'kg', 'open', '2026-10-15');

-- Tambahan: Memasukkan kontributor (Pak Budi) ke dalam Pool Kangkung
INSERT INTO public.pool_contributions (pool_id, producer_id, quantity_committed)
SELECT id, '22222222-2222-2222-2222-222222222222', 150 
FROM public.pools WHERE title LIKE '%Kangkung%';