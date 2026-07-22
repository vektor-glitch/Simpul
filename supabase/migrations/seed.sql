-- SEED DATA (Data Bawaan)

-- A. Membuat Akun Auth (Agar bisa Login dengan email & password, khusus non-Google yang Anda berikan)
-- Password untuk semua akun ini adalah: password123
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
VALUES
('00000000-0000-0000-0000-000000000000', '22222222-2222-2222-2222-222222222222', 'authenticated', 'authenticated', 'budi@simpul.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', ''),
('00000000-0000-0000-0000-000000000000', '42cb94f3-7852-49fa-88d2-7ba6e5584222', 'authenticated', 'authenticated', 'rafi@simpul.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', ''),
('00000000-0000-0000-0000-000000000000', '451ba6c6-8593-40d5-bb6f-2f7e93bf3591', 'authenticated', 'authenticated', 'fadel@simpul.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', ''),
('00000000-0000-0000-0000-000000000000', '27241ba2-c133-424f-9911-f2738036c8aa', 'authenticated', 'authenticated', 'dhafina@simpul.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', ''),
('00000000-0000-0000-0000-000000000000', '2f5a8610-0a63-40b2-b0a5-b7cf6f0c5345', 'authenticated', 'authenticated', 'admin@simpul.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', '')
ON CONFLICT (id) DO NOTHING;

-- B. Memasukkan data public.users (Menggunakan ON CONFLICT DO UPDATE untuk menghindari bentrok dengan trigger auth Supabase jika ada)
INSERT INTO "public"."users" ("id", "role", "name", "phone", "verified", "created_at", "is_suspended") VALUES 
('22222222-2222-2222-2222-222222222222', 'producer', 'Pak Budi', null, true, '2026-07-17 12:43:58.208871+00', false), 
('27241ba2-c133-424f-9911-f2738036c8aa', 'buyer', 'Dhafina Putri Eka Febrina', '082327846300', false, '2026-07-19 06:01:57.114479+00', false), 
('2f5a8610-0a63-40b2-b0a5-b7cf6f0c5345', 'admin', 'Admin Simpul', null, true, '2026-07-22 11:18:47.183214+00', false), 
('373d1530-4e4a-4d4b-8aac-c5c4f413d72b', 'buyer', 'Ananda Vektorino Ibrahim', '08987153305', false, '2026-07-18 14:12:25.697359+00', false), 
('42cb94f3-7852-49fa-88d2-7ba6e5584222', 'producer', 'Rafi Wicaksono', '085156414861', true, '2026-07-20 03:08:57.474817+00', false), 
('451ba6c6-8593-40d5-bb6f-2f7e93bf3591', 'producer', 'Fadel Akbar', '089652040213', true, '2026-07-22 11:30:47.314277+00', false)
ON CONFLICT (id) DO UPDATE SET 
    role = EXCLUDED.role, name = EXCLUDED.name, phone = EXCLUDED.phone, verified = EXCLUDED.verified, is_suspended = EXCLUDED.is_suspended;

-- C. Memasukkan sisa data yang Anda berikan
INSERT INTO "public"."addresses" ("id", "user_id", "label", "recipient_name", "phone", "full_address", "city", "postal_code", "is_primary", "created_at") VALUES 
('a6667c16-fb45-43ad-86eb-0b441768c30c', '373d1530-4e4a-4d4b-8aac-c5c4f413d72b', 'Perumahan Permata Hijau', 'Vektor', '08987153305', 'Perumahan Permata Hijau, Semail, Bangunharjo, Sewon, Bantul, Yogyakarta', 'Yogyakarta', '55188', true, '2026-07-20 04:20:06.066524+00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO "public"."buyer_profiles" ("user_id", "avatar_url", "default_address", "city", "postal_code", "created_at", "updated_at") VALUES 
('27241ba2-c133-424f-9911-f2738036c8aa', '', 'Perumahan Karangkajen Permai, l. Imogiri Barat, Salakan, Bangunharjo, Kec. Sewon, Kabupaten Bantul, Daerah Istimewa Yogyakarta ', 'Yogyakarta', '55188', '2026-07-19 06:03:42.754912+00', '2026-07-19 06:03:40.928+00'), 
('373d1530-4e4a-4d4b-8aac-c5c4f413d72b', 'https://rcodowfthjjvuorlatbj.supabase.co/storage/v1/object/public/avatars/coldraven20@gmail.com/0.6800316269622158.JPG', 'Perumahan Permata Hijau, Semail, Bangunharjo, Sewon, Bantul, Yogyakarta', 'DI Yogyakarta', '55188', '2026-07-18 13:31:09.67425+00', '2026-07-20 04:20:10.965+00')
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO "public"."producer_profiles" ("user_id", "business_name", "location", "region", "category", "description", "created_at", "rajaongkir_location_id") VALUES 
('22222222-2222-2222-2222-222222222222', 'Pak Budi', 'Semail, Bantul, Yogyakarta', 'DI Yogyakarta', 'Pertanian', 'Jual Jual', '2026-07-17 12:43:58.208871+00', null), 
('42cb94f3-7852-49fa-88d2-7ba6e5584222', 'Perternakan Lele', 'LEBAK SILIWANGI, COBLONG, BANDUNG, JAWA BARAT, 40132', 'Jawa Barat', 'Pertanian', 'Saya jual lele suwegar!', '2026-07-20 03:24:08.891235+00', '4919'), 
('451ba6c6-8593-40d5-bb6f-2f7e93bf3591', 'Pertenakan Babi ', 'PATEHAN, KRATON, YOGYAKARTA, DI YOGYAKARTA, 55133', 'DAERAH ISTIMEWA YOGYAKARTA', 'Peternakan', 'Jual daging babi', '2026-07-22 11:36:13.006299+00', '31421')
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO "public"."products" ("id", "producer_id", "name", "category", "description", "price_producer", "price_final", "platform_fee", "stock", "unit", "image_url", "is_active", "created_at", "rating", "review_count") VALUES 
('3735b0db-ccce-4981-b1a3-4e86edf61319', '22222222-2222-2222-2222-222222222222', 'Beras Merah Premium', 'Pertanian', 'Beras merah utuh bebas pengawet.', '22000.00', '25000.00', '3000.00', 500, 'kg', 'https://images.pexels.com/photos/8108117/pexels-photo-8108117.jpeg', true, '2026-07-17 12:43:58.208871+00', '0.0', 0), 
('4f614efc-7e60-4d57-adc5-84ef726ee0da', '22222222-2222-2222-2222-222222222222', 'Cabai Rawit Setan', 'Pertanian', 'Cabai rawit super pedas pilihan.', '40000.00', '45000.00', '5000.00', 80, 'kg', 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', true, '2026-07-17 12:43:58.208871+00', '0.0', 0), 
('57f1b5e6-62e0-492c-b536-f0c29c26eb04', '22222222-2222-2222-2222-222222222222', 'Tomat Cherry', 'Pertanian', 'Tomat manis untuk salad.', '18000.00', '20000.00', '2000.00', 50, 'kg', 'https://images.unsplash.com/photo-1587334274535-5f82e7e55dc0?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', true, '2026-07-17 12:43:58.208871+00', '0.0', 0), 
('7c1ea1b2-31a5-4826-9837-cea4568960cd', '22222222-2222-2222-2222-222222222222', 'Bayam Merah', 'Pertanian', 'Bayam merah kaya zat besi.', '9000.00', '10000.00', '1000.00', 120, 'ikat', 'https://images.unsplash.com/photo-1587578855742-e229eb43888b?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', true, '2026-07-17 12:43:58.208871+00', '0.0', 0), 
('9fc29bd6-22b0-4248-9e7a-67e3f87b74bd', '22222222-2222-2222-2222-222222222222', 'Kangkung Organik', 'Pertanian', 'Kangkung segar dipanen pagi hari.', '8000.00', '9000.00', '1000.00', 150, 'ikat', 'https://images.unsplash.com/photo-1623490439625-758205dc3219?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', true, '2026-07-17 12:43:58.208871+00', '5.0', 1), 
('aab9eccc-2ac3-406f-a3e1-482cd92385ab', '42cb94f3-7852-49fa-88d2-7ba6e5584222', 'Sungut Lele Uwenak', 'Peternakan', 'Saya jual lele yang uwenak banget rekkk!', '6650.00', '7000.00', '350.00', 500, 'ekor', 'https://rcodowfthjjvuorlatbj.supabase.co/storage/v1/object/public/products/42cb94f3-7852-49fa-88d2-7ba6e5584222-1784519312710.jpg', true, '2026-07-20 03:48:34.663818+00', '5.0', 1)
ON CONFLICT (id) DO NOTHING;

INSERT INTO "public"."pools" ("id", "category", "region", "title", "target_quantity", "unit", "status", "deadline", "created_at", "image_url", "collected_quantity", "sold_quantity", "price") VALUES 
('0da315de-f03f-45d6-9a64-85472ea7d70f', 'Pertanian', 'Jawa Barat', 'Supply Kangkung Organik Restoran Vegan Jakarta', 1000, 'ikat', 'fulfilled', '2026-12-31', '2026-07-17 12:43:58.208871+00', 'https://images.unsplash.com/photo-1623490439625-758205dc3219?q=80&w=880&auto=format&fit=crop', 1000, 0, '8500.00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO "public"."pool_contributions" ("id", "pool_id", "producer_id", "product_id", "quantity_committed", "created_at") VALUES 
('27372af0-a36b-43ac-9944-2fbfde846e1e', '0da315de-f03f-45d6-9a64-85472ea7d70f', '42cb94f3-7852-49fa-88d2-7ba6e5584222', null, 750, '2026-07-20 04:03:46.475772+00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO "public"."orders" ("id", "buyer_id", "product_id", "pool_id", "quantity", "shipping_cost", "total_price", "status", "shipping_address", "created_at", "subtotal", "admin_fee", "unit_price", "receipt_number", "processed_at", "packed_at", "shipped_at", "delivered_at") VALUES 
('36378f47-09d6-478d-a499-ba25fa110785', '373d1530-4e4a-4d4b-8aac-c5c4f413d72b', 'aab9eccc-2ac3-406f-a3e1-482cd92385ab', null, 1, '13230.00', '20580.00', 'processed', 'Perumahan Permata Hijau, Semail, Bangunharjo, Sewon, Bantul, Yogyakarta, Yogyakarta - 55188', '2026-07-22 11:04:16.583808+00', '7000.00', '350.00', '7000.00', null, null, null, null, null)
ON CONFLICT (id) DO NOTHING;

INSERT INTO "public"."reviews" ("id", "order_id", "buyer_id", "producer_id", "rating", "comment", "created_at") VALUES 
('c45b0695-2023-4fe4-b1a0-9954fe009c9e', '36378f47-09d6-478d-a499-ba25fa110785', '373d1530-4e4a-4d4b-8aac-c5c4f413d72b', '42cb94f3-7852-49fa-88d2-7ba6e5584222', 5, 'Lele-nya sangat enak dan segar! Recommended banget.', '2026-07-22 12:05:44.323916+00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO "public"."withdrawals" ("id", "user_id", "amount", "bank_name", "account_number", "account_name", "status", "notes", "created_at", "updated_at") VALUES 
('b712f1c1-f1a7-49d1-bd61-915f086a3dde', '42cb94f3-7852-49fa-88d2-7ba6e5584222', 2000, 'BCA', '12345678', 'Rafi Wicaksono', 'completed', null, '2026-07-20 04:55:46.347616+00', '2026-07-22 11:55:41.575486+00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO "public"."platform_settings" ("id", "admin_fee_percentage", "updated_at") VALUES 
('b6477fb1-a2fc-4764-adad-4905b8e944e2', '5', '2026-07-22 12:17:42.389844+00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO "public"."notifications" ("id", "user_id", "title", "message", "type", "link", "is_read", "created_at") VALUES 
('00da6a6c-7509-46ad-b4a0-0108b3b82c05', '373d1530-4e4a-4d4b-8aac-c5c4f413d72b', 'Status Pesanan Diperbarui', 'Pesanan anda sekarang berstatus: processed', 'order_status', '/cart', false, '2026-07-22 11:05:52.582428+00'), 
('1c2a8d51-1607-46ce-84cd-443804fc3e3f', '373d1530-4e4a-4d4b-8aac-c5c4f413d72b', 'Status Pesanan Diperbarui', 'Pesanan anda sekarang berstatus: shipped', 'order_status', '/cart', true, '2026-07-20 04:24:56.634032+00'), 
('6202d074-3d12-43e9-8120-edede2f7538e', '373d1530-4e4a-4d4b-8aac-c5c4f413d72b', 'Status Pesanan Diperbarui', 'Pesanan anda sekarang berstatus: processed', 'order_status', '/cart', true, '2026-07-20 04:22:07.023649+00'), 
('e1610ee3-39b3-48ca-b014-f66a56c170c7', '373d1530-4e4a-4d4b-8aac-c5c4f413d72b', 'Status Pesanan Diperbarui', 'Pesanan anda sekarang berstatus: packed', 'order_status', '/cart', true, '2026-07-20 04:24:34.613468+00'), 
('ef643cbd-de37-441e-aa37-123b686b659e', '373d1530-4e4a-4d4b-8aac-c5c4f413d72b', 'Status Pesanan Diperbarui', 'Pesanan anda sekarang berstatus: delivered', 'order_status', '/cart', true, '2026-07-20 04:36:38.997389+00')
ON CONFLICT (id) DO NOTHING;
