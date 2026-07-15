# PRD — Simpul: Platform Digitalisasi UMKM & Rantai Pasok Lokal

## 1. Latar Belakang
Petani, peternak, dan pengrajin di daerah pelosok sering terjebak jalur distribusi tengkulak yang memangkas margin keuntungan mereka secara signifikan, sementara posisi tawar individu terlalu lemah untuk melayani pembeli skala besar secara mandiri.

## 2. Tujuan Produk
Membangun platform marketplace yang:
1. Menampilkan harga transparan.
2. Memungkinkan produsen kecil bergabung membentuk kapasitas pasokan kolektif.
3. Memberi visibilitas status pengiriman.
Sehingga produsen bisa terhubung langsung ke pasar lebih luas dengan harga adil.

## 3. Target Pengguna
- **Produsen**: petani, peternak, pengrajin UMKM di daerah pelosok.
- **Pembeli retail**: individu/rumah tangga.
- **Pembeli B2B**: restoran, hotel, distributor, reseller.
- **Admin**: verifikasi & moderasi platform.

## 4. Fitur

### Tier 1 — MVP (Wajib)
| Fitur | Deskripsi |
|---|---|
| **Auth & Profil** | Registrasi role-based (produsen/pembeli), verifikasi produsen oleh admin |
| **Listing Produk** | CRUD produk dengan breakdown harga transparan (harga produsen, ongkir, fee platform) |
| **Marketplace & Pencarian** | Browse & filter produk by kategori/wilayah |
| **Sistem Pool/Gabung Pesanan** | Produsen sejenis satu wilayah gabung stok jadi 1 listing kolektif untuk buyer B2B |
| **Order & Checkout** | Pembeli order individual maupun dari pool |
| **Ongkir Otomatis** | Integrasi RajaOngkir untuk hitung biaya kirim real |
| **Status Pesanan** | Diproses → Dikemas → Dikirim → Diterima, diupdate produsen |
| **Dashboard Produsen** | Kelola produk, pool, pesanan masuk, pendapatan |
| **Dashboard Admin** | Verifikasi produsen baru, moderasi listing |
| **Payment Sandbox** | Simulasi pembayaran via Midtrans sandbox |

### Tier 2 — Nilai Tambah (Jika waktu cukup)
- Rating & review produsen
- Fitur "Harga Adil" berbasis AI (bandingkan harga listing vs rata-rata pasar)
- Grafik pendapatan produsen
- Filter lokasi via peta (OpenStreetMap)

### Tier 3 — Future Work (Disebut di proposal, tidak wajib dibangun)
- Notifikasi WhatsApp otomatis
- Verifikasi dokumen usaha otomatis
- Multi-bahasa daerah

## 5. Arsitektur Teknis
- **Frontend**: Next.js (App Router) + TypeScript + Tailwind CSS
- **Backend**: Next.js API Routes sebagai REST API internal (bukan langsung akses Supabase dari client)
- **Database & Auth**: Supabase (Postgres + Supabase Auth)
- **API Eksternal**: RajaOngkir (ongkir), Midtrans Sandbox (payment), opsional Claude API (fitur harga adil)
- **Hosting**: Vercel (frontend+API), Supabase Cloud (DB)

## 6. Skema Data Inti
- `users`
- `producer_profiles`
- `products`
- `pools`
- `pool_contributions`
- `orders`
- `order_status_history`
- `reviews`

## 7. Metrik Keberhasilan (Untuk Penilaian Juri)
- Selisih harga yang ditampilkan ke pembeli vs skema tengkulak konvensional (disimulasikan di data demo).
- Jumlah produsen yang bisa "gabung" dalam 1 pool untuk memenuhi pesanan besar.
- Kelengkapan alur end-to-end: dari listing produk → pool → order → status terkirim.

## 8. Batasan (Constraints)
- **Waktu pengembangan**: ~18 hari (solo fullstack dev).
- **Payment**: bersifat simulasi/sandbox, bukan transaksi nyata.
- **Data demo**: menggunakan seed data realistis, bukan pengguna nyata.

## 9. Risiko & Mitigasi
| Risiko | Mitigasi |
|---|---|
| Logika pool/gabung pesanan kompleks | Sederhanakan: alokasi stok proporsional otomatis, tanpa negosiasi manual antar produsen |
| Waktu mepet untuk semua fitur | Tier 1 selesai duluan, Tier 2 opsional, Tier 3 cukup di proposal |
| Ketergantungan API eksternal saat demo | Siapkan fallback data statis jika API down saat presentasi |

---

## Deskripsi Lengkap Website

### Gambaran Umum
**Simpul** adalah platform marketplace digital yang dirancang khusus untuk menghubungkan produsen lokal — petani, peternak, dan pengrajin UMKM di daerah pelosok — langsung dengan pembeli akhir maupun pembeli skala besar (restoran, hotel, distributor), tanpa melalui jalur tengkulak yang selama ini memotong margin keuntungan mereka secara tidak adil.

Berbeda dari marketplace pada umumnya, platform ini dibangun di atas tiga pilar utama yang saling melengkapi: **transparansi harga**, **kekuatan tawar kolektif**, dan **kepercayaan lewat keterlacakan**. Ketiga pilar ini menjawab akar masalah yang membuat tengkulak masih eksis: produsen kecil tidak punya informasi harga yang jelas, tidak punya kapasitas untuk melayani pesanan besar sendirian, dan pembeli tidak punya cara memverifikasi kualitas serta keaslian produk sebelum bertransaksi.

### Bagaimana Website Ini Bekerja
Ketika seorang petani atau pengrajin mendaftar, mereka melalui proses verifikasi sederhana oleh admin platform untuk memastikan keaslian identitas dan usaha mereka. Setelah terverifikasi, mereka dapat memasang produk ke marketplace dengan harga yang mereka tentukan sendiri sebagai harga dasar. 

Sistem kemudian menampilkan breakdown harga secara terbuka kepada pembeli — berapa yang menjadi bagian produsen, berapa biaya pengiriman aktual (dihitung otomatis lewat integrasi API ongkir), dan berapa fee platform yang kecil dan jelas. Tidak ada markup tersembunyi seperti yang biasa terjadi di rantai tengkulak konvensional.

Untuk **pembeli individu**, alur belanja berjalan seperti marketplace pada umumnya: cari produk, lihat detail dan profil produsen, checkout, dan pantau status pesanan dari mulai diproses hingga diterima. 

Namun keunggulan utama platform ini muncul ketika **pembeli berskala besar** — misalnya restoran yang butuh 200kg sayur per minggu, atau distributor yang butuh pasokan rutin — masuk ke sistem. Alih-alih harus mencari dan menghubungi banyak petani kecil satu per satu, pembeli ini dapat memesan dari **Pool**, yaitu kumpulan stok yang dihimpun secara otomatis dari beberapa produsen sejenis di wilayah yang sama. Sistem menggabungkan kapasitas produksi mereka menjadi satu penawaran kolektif, sehingga mereka yang sendiri-sendiri tidak sanggup melayani pesanan besar, kini bisa berpartisipasi dan mendapat bagian pendapatan secara proporsional sesuai kontribusi stok masing-masing.

Setiap transaksi yang berjalan — baik individual maupun lewat pool — dilengkapi dengan status pengiriman bertahap yang diperbarui langsung oleh produsen, sehingga pembeli tahu persis di tahap mana pesanan mereka berada, mulai dari diproses, dikemas, dikirim, hingga diterima. Ini memberi rasa aman dan transparansi yang selama ini tidak ada dalam transaksi lewat tengkulak yang serba tidak jelas.

### Peran Setiap Pengguna
- **Produsen**: Memiliki dashboard sendiri untuk mengelola produk, memantau pesanan masuk, bergabung ke pool bersama produsen lain, dan melihat ringkasan pendapatan mereka.
- **Pembeli (Individu/Institusi)**: Memiliki riwayat transaksi dan dapat memberi ulasan terhadap produsen setelah transaksi selesai untuk membangun reputasi yang transparan di dalam sistem.
- **Admin**: Bertindak sebagai penjaga kualitas platform, memverifikasi produsen baru dan memoderasi listing agar platform tetap terpercaya.

### Yang Membuat Platform Ini Berbeda
Kebanyakan solusi digitalisasi UMKM berhenti di tahap "bikin marketplace supaya petani bisa jualan online" — tapi masalah sebenarnya bukan cuma soal akses jual-beli, melainkan soal **posisi tawar**. Petani kecil sendirian tetap lemah bahkan setelah punya toko online, karena mereka tidak sanggup memenuhi pesanan besar sendirian dan tidak punya cara membuktikan harga mereka wajar. 

Simpul secara langsung menjawab dua hal ini lewat mekanisme **pool** untuk kekuatan kolektif, dan **breakdown harga** untuk transparansi — dua hal yang secara struktural menggantikan fungsi tengkulak, bukan sekadar memindahkan transaksi mereka ke layar HP.

### Teknologi di Baliknya
Platform ini dibangun menggunakan Next.js dan TypeScript untuk frontend yang cepat dan modern, Tailwind CSS untuk antarmuka yang bersih dan mudah digunakan bahkan oleh pengguna dengan literasi digital terbatas, serta Supabase sebagai basis data dan sistem autentikasi. 

Untuk memastikan arsitektur yang matang, seluruh interaksi data melewati lapisan REST API internal yang dibangun sendiri, bukan sekadar akses langsung ke database. Platform ini juga terintegrasi dengan API ongkir untuk perhitungan biaya kirim yang akurat dan API payment gateway (dalam mode sandbox untuk keperluan demo) untuk mensimulasikan alur pembayaran yang realistis.