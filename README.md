  # 🌱 Simpul - Platform E-Commerce B2B Pertanian

  ![Simpul Banner](public/logo.png) 

  **Simpul** adalah platform e-commerce *Business to Business* (B2B) yang dirancang untuk memotong rantai pasok panjang yang merugikan. Kami menghubungkan **Produsen** (Petani, Peternak, Pengrajin) secara langsung dengan **Pembeli** (Restoran, Hotel, Bisnis, Konsumen Kolektif), memastikan transparansi harga yang adil dan keuntungan maksimal untuk pembuat produk.

  ## ✨ Fitur Unggulan

  Simpul dibangun dengan memikirkan alur bisnis dunia nyata dari hulu ke hilir:

  - **👥 Multi-Role System**: 
    - **Buyer (Pembeli)**: Bisa berbelanja, melacak pesanan, bergabung ke *Pool*, dan memberikan ulasan.
    - **Producer (Produsen)**: Bisa membuat toko (profil bisnis), mengunggah produk, mengelola pesanan masuk, menginput resi, dan menarik penghasilan (*withdrawal*).
    - **Admin**: Memiliki kendali penuh atas pengguna, moderasi transaksi, dan pengaturan platform (biaya layanan dinamis).
    
  - **🤝 Fitur Pool Grosir (Group Buying)**: 
    Fitur revolusioner yang memungkinkan pembeli untuk "patungan" membeli dalam kuota besar guna memenuhi target penjualan produsen sehingga mendapatkan harga yang jauh lebih murah.
    
  - **🛒 Siklus Transaksi End-to-End**: 
    Mulai dari Keranjang (Cart) -> Pembayaran (Checkout) -> Diproses (Processed) -> Dikemas (Packed) -> Dikirim dengan wajib Resi (Shipped) -> Diterima (Delivered) -> Rating & Ulasan.

  - **🔔 Notifikasi Real-time**: 
    Setiap kali status pesanan berubah, pembeli dan produsen akan langsung mendapatkan notifikasi seketika berkat integrasi *Websocket*.

  - **💰 Transparansi Harga & Keuangan**:
    Tidak ada biaya tersembunyi. Pembeli melihat rincian harga asli, ongkir, dan *platform fee*. Produsen memiliki dompet (Wallet) sendiri untuk melihat total pendapatannya dan melakukan pencairan dana.

  ## 🛠️ Tech Stack

  Platform ini dibangun menggunakan teknologi modern untuk memastikan kecepatan, keamanan, dan skalabilitas:

  - **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
  - **Styling**: [Tailwind CSS](https://tailwindcss.com/)
  - **Icons**: [Lucide React](https://lucide.dev/)
  - **Backend/Database**: [Supabase](https://supabase.com/) (PostgreSQL)
  - **Autentikasi**: Supabase Auth (Email/Password & Google OAuth)
  - **Real-time & Storage**: Supabase Realtime & Supabase Storage

  ---

  ## 📡 API Endpoints & Integrasi

  Simpul tidak hanya mengandalkan *Server Actions*, tetapi juga menyediakan REST API Routes khusus untuk menjembatani integrasi pihak ketiga:

  ### 1. Payment Gateway (Midtrans)
  Semua transaksi diproses secara aman menggunakan gerbang pembayaran eksternal.
  - `POST /api/payment/checkout` : Membuat sesi transaksi (Snap Token) dan menyimpannya sebagai `orders` dengan status `pending`.
  - `POST /api/payment/webhook` : Menerima *callback/notification* dari Midtrans ketika pembayaran sukses, lalu otomatis mengubah status pesanan dari `pending` menjadi `processed` (dan mendistribusikan admin fee/wallet).
  - `GET /api/payment/sync` : Melakukan sinkronisasi manual jika ada transaksi yang tertunda atau statusnya belum *update*.

  ### 2. Shipping & Logistik (Komerce / RajaOngkir)
  Harga ongkir dihitung secara akurat *real-time* ke sistem logistik.
  - `GET /api/shipping/search` : Mencari ID lokasi / kecamatan dari API kurir untuk menentukan titik tujuan pengiriman.
  - `POST /api/shipping/cost` : Menghitung harga ongkos kirim berdasarkan berat barang, lokasi produsen (titik asal), dan lokasi pembeli (titik tujuan).

  ---

  ## 🚀 Cara Menjalankan Proyek (Getting Started)

  Ikuti langkah-langkah berikut untuk menjalankan proyek Simpul di komputer lokal Anda.

  ### 1. Kloning Repositori & Instalasi
  ```bash
  git clone https://github.com/username/simpul.git
  cd simpul
  npm install
  ```

  ### 2. Pengaturan Supabase (Database)
  Karena proyek ini mengandalkan Supabase, Anda harus mengatur *database* Anda terlebih dahulu:
  1. Buat proyek baru di [Supabase Dashboard](https://database.supabase.com).
  2. Masuk ke **SQL Editor**.
  3. Jalankan *script* `supabase/migrations/init.sql` untuk membangun struktur tabel, kebijakan keamanan (RLS), dan fungsi otomatis (*trigger*).
  4. (Opsional) Jalankan *script* `supabase/migrations/seed.sql` jika Anda ingin menyuntikkan data uji coba (dummy data).

  ### 3. Pengaturan Variabel Lingkungan (.env)
  Buat file bernama `.env.local` di root direktori proyek Anda, lalu masukkan kredensial dari Supabase (Project Settings > API):

  ```env
  NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT-ID].supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=[YOUR-ANON-KEY]
  ```

  ### 4. Jalankan Server Development
  Setelah semuanya siap, nyalakan server lokal:

  ```bash
  npm run dev
  # atau pnpm dev / yarn dev
  ```

  Buka [http://localhost:3000](http://localhost:3000) di browser Anda. Selamat, Simpul sudah berjalan! 🎉

  ---

  ## 📂 Struktur Direktori Utama

  - `src/app/` - Berisi *routing* halaman aplikasi (Beranda, Marketplace, Dashboard Admin/Buyer/Producer, dll).
  - `src/components/` - Komponen React yang dapat digunakan ulang (UI, Navigasi, dll).
  - `src/lib/` - Konfigurasi pihak ketiga (misalnya inisialisasi *client* Supabase).
  - `src/hooks/` - *Custom hooks* untuk mempermudah logika React.
  - `supabase/migrations/` - File-file SQL penting untuk migrasi dan *seeding database*.

  ---
  *Didesain dan dikembangkan dengan ♥️ untuk kemajuan rantai pasok Nusantara.*
