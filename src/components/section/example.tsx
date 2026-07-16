import Link from "next/link";

// ============================================================
// Data dummy — ganti dengan data asli dari Supabase nanti
// ============================================================
const featuredProducts = [
    {
        id: "1",
        name: "Kangkung Organik",
        location: "Ds. Cibodas, Bandung",
        unit: "ikat",
        priceProducer: 8000,
        shipping: 3000,
        fee: 1000,
        emoji: "🥬",
    },
    {
        id: "2",
        name: "Telur Ayam Kampung",
        location: "Kec. Wonosari, Yogyakarta",
        unit: "kg",
        priceProducer: 28000,
        shipping: 5000,
        fee: 2000,
        emoji: "🥚",
    },
    {
        id: "3",
        name: "Anyaman Bambu",
        location: "Ds. Tanjungsari, Kalimantan",
        unit: "buah",
        priceProducer: 45000,
        shipping: 8000,
        fee: 3000,
        emoji: "🧺",
    },
    {
        id: "4",
        name: "Madu Hutan Asli",
        location: "Ds. Sukamaju, Sumatra",
        unit: "botol",
        priceProducer: 35000,
        shipping: 6000,
        fee: 2500,
        emoji: "🍯",
    },
];

const testimonials = [
    {
        quote:
            "Biasanya hasil panen saya dibeli tengkulak dengan harga jauh di bawah pasar. Lewat Pool di Simpul, saya bisa gabung dengan petani lain dan memenuhi pesanan besar yang dulu tidak mungkin saya layani sendiri.",
        role: "Ilustrasi: Petani Sayur, Jawa Tengah",
    },
    {
        quote:
            "Saya bisa lihat persis berapa yang saya bayar untuk produk, ongkir, dan biaya platform. Tidak ada kejutan harga.",
        role: "Ilustrasi: Pembeli B2B, Restoran",
    },
    {
        quote:
            "Sebagai pengrajin, biasanya saya kesulitan menjual ke luar daerah. Sekarang pembeli bisa menemukan produk saya langsung.",
        role: "Ilustrasi: Pengrajin Anyaman, Kalimantan",
    },
];

const faqs = [
    {
        q: "Bagaimana jika Pool tidak mencapai target jumlah pesanan?",
        a: "Pool akan tetap terbuka hingga batas waktu yang ditentukan. Jika target belum terpenuhi, produsen tetap bisa menerima pesanan sesuai stok yang telah tergabung, atau Pool dapat diperpanjang oleh admin.",
    },
    {
        q: "Bagaimana Simpul memastikan produsen yang terdaftar benar-benar asli?",
        a: "Setiap produsen melalui proses verifikasi oleh admin platform sebelum dapat memasang produk, termasuk pengecekan identitas dan informasi usaha.",
    },
    {
        q: "Apakah pembayaran di Simpul aman?",
        a: "Seluruh transaksi diproses melalui sistem pembayaran pihak ketiga tepercaya, sehingga dana baru diteruskan setelah transaksi terverifikasi.",
    },
    {
        q: "Berapa biaya yang dikenakan platform?",
        a: "Fee platform ditampilkan secara terbuka di setiap produk sebagai bagian dari rincian harga — tidak ada biaya tersembunyi.",
    },
    {
        q: "Apakah saya bisa menjadi produsen meskipun berada di daerah terpencil?",
        a: "Selama memiliki akses internet dan produk untuk dijual, siapa pun dapat mendaftar sebagai produsen di Simpul.",
    },
];

function formatRupiah(n: number) {
    return `Rp${n.toLocaleString("id-ID")}`;
}

export default function Example() {
    return (
        <main className="bg-[#FAF7F0] text-[#2E2A1F]">
            {/* ============ HERO ============ */}
            <section id="hero" className="relative overflow-hidden px-6 pt-28 pb-24 md:pt-36 md:pb-32">
                <div className="mx-auto grid max-w-6xl gap-16 md:grid-cols-2 md:items-center">
                    <div>
                        <span className="inline-block rounded-full bg-[#2E2A1F]/5 px-4 py-1.5 text-sm tracking-wide text-[#8B8577]">
                            Tengkulak memotong keuntungan produsen lokal.
                        </span>

                        <h1 className="mt-6 font-serif text-4xl leading-[1.1] tracking-tight text-[#2E2A1F] md:text-6xl">
                            Simpul Menghubungkanmu
                            <br />
                            Langsung ke Pasar
                        </h1>

                        <p className="mt-6 max-w-md text-lg text-[#2E2A1F]/70">
                            Tanpa potongan tengkulak. Harga transparan, kekuatan tawar yang setara.
                        </p>

                        <div className="mt-8 flex flex-wrap gap-4">
                            <Link
                                href="/marketplace"
                                className="rounded-full bg-[#3F5A3D] px-7 py-3.5 font-medium text-white transition hover:bg-[#324a30] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3F5A3D]"
                            >
                                Jelajahi Marketplace
                            </Link>
                            <Link
                                href="/auth/register"
                                className="rounded-full border border-[#2E2A1F]/20 px-7 py-3.5 font-medium text-[#2E2A1F] transition hover:border-[#2E2A1F]/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3F5A3D]"
                            >
                                Gabung Sebagai Produsen
                            </Link>
                        </div>

                        <p className="mt-8 text-sm text-[#8B8577]">
                            Dibangun untuk memberdayakan produsen lokal Indonesia.
                        </p>
                    </div>

                    {/* Signature element: kartu breakdown harga */}
                    <div className="relative mx-auto w-full max-w-sm rotate-2 rounded-2xl border border-[#2E2A1F]/10 bg-white p-6 shadow-[0_20px_50px_-15px_rgba(46,42,31,0.25)] transition hover:rotate-0">
                        <div className="flex items-center gap-3 border-b border-dashed border-[#2E2A1F]/15 pb-4">
                            <span className="text-3xl">🥬</span>
                            <div>
                                <p className="font-serif text-lg leading-tight">Kangkung Organik</p>
                                <p className="text-sm text-[#8B8577]">Ds. Cibodas, Bandung</p>
                            </div>
                        </div>

                        <dl className="mt-4 space-y-2 text-sm">
                            <div className="flex justify-between">
                                <dt className="text-[#8B8577]">Harga Petani</dt>
                                <dd>Rp8.000</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-[#8B8577]">Ongkos Kirim</dt>
                                <dd>Rp3.000</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-[#8B8577]">Fee Platform</dt>
                                <dd>Rp1.000</dd>
                            </div>
                        </dl>

                        <div className="mt-4 flex items-center justify-between border-t border-dashed border-[#2E2A1F]/15 pt-4">
                            <span className="font-serif text-xl">Rp12.000</span>
                            <span className="rounded-full bg-[#3F5A3D]/10 px-3 py-1 text-xs font-medium text-[#3F5A3D]">
                                ✓ Harga Adil
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            {/* ============ SOLUTION ============ */}
            <section id="solution" className="px-6 py-24 md:py-32">
                <div className="mx-auto max-w-6xl">
                    <div className="max-w-xl">
                        <h2 className="font-serif text-3xl md:text-4xl">Kenapa Simpul Berbeda</h2>
                        <p className="mt-4 text-[#2E2A1F]/70">
                            Bukan sekadar toko online. Simpul dirancang untuk menjawab akar masalah
                            yang membuat tengkulak masih bertahan.
                        </p>
                    </div>

                    <div className="mt-14 grid gap-8 md:grid-cols-3">
                        {[
                            {
                                title: "Harga Transparan",
                                desc: "Setiap produk menampilkan rincian harga secara terbuka — berapa bagian produsen, berapa ongkir, dan berapa fee platform. Tidak ada markup tersembunyi.",
                            },
                            {
                                title: "Gabung Jadi Kuat",
                                desc: "Produsen sejenis di satu wilayah bisa bergabung dalam satu Pool untuk memenuhi pesanan besar — hasil dibagi proporsional sesuai kontribusi.",
                            },
                            {
                                title: "Transparan Sampai Tujuan",
                                desc: "Pantau status pesanan secara real-time, dari diproses, dikemas, dikirim, hingga diterima.",
                            },
                        ].map((item) => (
                            <div key={item.title} className="rounded-2xl border border-[#2E2A1F]/10 bg-white p-8">
                                <h3 className="font-serif text-xl">{item.title}</h3>
                                <p className="mt-3 text-sm leading-relaxed text-[#2E2A1F]/70">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ============ PRODUK UNGGULAN ============ */}
            <section id="products" className="bg-[#2E2A1F]/[0.03] px-6 py-24 md:py-32">
                <div className="mx-auto max-w-6xl">
                    <div className="flex flex-wrap items-end justify-between gap-4">
                        <div>
                            <h2 className="font-serif text-3xl md:text-4xl">Produk dari Tangan Produsen Lokal</h2>
                            <p className="mt-4 max-w-md text-[#2E2A1F]/70">
                                Setiap produk di sini datang langsung dari petani, peternak, dan
                                pengrajin yang telah terverifikasi.
                            </p>
                        </div>
                        <Link
                            href="/marketplace"
                            className="whitespace-nowrap font-medium text-[#3F5A3D] hover:underline"
                        >
                            Lihat Semua Produk →
                        </Link>
                    </div>

                    <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {featuredProducts.map((p, i) => {
                            const total = p.priceProducer + p.shipping + p.fee;
                            const tilt = i % 2 === 0 ? "-rotate-1" : "rotate-1";
                            return (
                                <Link
                                    href={`/marketplace/${p.id}`}
                                    key={p.id}
                                    className={`group block rounded-2xl border border-[#2E2A1F]/10 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:rotate-0 hover:shadow-lg ${tilt}`}
                                >
                                    <div className="flex h-32 items-center justify-center rounded-xl bg-[#3F5A3D]/5 text-5xl">
                                        {p.emoji}
                                    </div>

                                    <div className="mt-4 border-b border-dashed border-[#2E2A1F]/15 pb-4">
                                        <p className="font-serif text-lg leading-tight">{p.name}</p>
                                        <p className="mt-1 text-xs text-[#8B8577]">{p.location}</p>
                                    </div>

                                    <div className="mt-4 flex items-center justify-between">
                                        <div>
                                            <p className="font-serif text-lg">{formatRupiah(total)}</p>
                                            <p className="text-xs text-[#8B8577]">/{p.unit}</p>
                                        </div>
                                        <span className="rounded-full bg-[#3F5A3D]/10 px-2.5 py-1 text-[11px] font-medium text-[#3F5A3D]">
                                            ✓ Harga Adil
                                        </span>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ============ TESTIMONIAL ============ */}
            <section id="testimonial" className="px-6 py-24 md:py-32">
                <div className="mx-auto max-w-6xl">
                    <h2 className="font-serif text-3xl md:text-4xl">Cerita dari Simpul</h2>
                    <p className="mt-3 text-sm italic text-[#8B8577]">
                        Testimoni berikut merupakan ilustrasi skenario pengguna untuk keperluan
                        demonstrasi.
                    </p>

                    <div className="mt-12 grid gap-8 md:grid-cols-3">
                        {testimonials.map((t) => (
                            <figure key={t.role} className="rounded-2xl border border-[#2E2A1F]/10 bg-white p-8">
                                <blockquote className="font-serif text-lg leading-relaxed text-[#2E2A1F]">
                                    &ldquo;{t.quote}&rdquo;
                                </blockquote>
                                <figcaption className="mt-4 text-sm text-[#8B8577]">{t.role}</figcaption>
                            </figure>
                        ))}
                    </div>
                </div>
            </section>

            {/* ============ ABOUT US ============ */}
            <section id="about" className="bg-[#3F5A3D] px-6 py-24 text-[#FAF7F0] md:py-32">
                <div className="mx-auto max-w-3xl">
                    <h2 className="font-serif text-3xl md:text-4xl">Kenapa Simpul Dibuat</h2>
                    <div className="mt-6 space-y-5 leading-relaxed text-[#FAF7F0]/85">
                        <p>
                            Di banyak daerah pelosok Indonesia, hasil kerja keras petani, peternak,
                            dan pengrajin sering kali harus melewati rantai tengkulak yang panjang
                            sebelum sampai ke pasar yang lebih luas — memangkas margin yang
                            seharusnya menjadi hak mereka.
                        </p>
                        <p>
                            Simpul dibangun dengan satu keyakinan sederhana: produsen kecil berhak
                            mendapatkan harga yang adil dan akses pasar yang setara, tanpa harus
                            kehilangan sebagian besar hasil kerja mereka ke tangan perantara.
                        </p>
                        <p>
                            Kami percaya solusinya bukan sekadar memindahkan transaksi ke layar HP,
                            melainkan mengubah struktur di baliknya — lewat transparansi harga dan
                            kekuatan kolektif antar produsen.
                        </p>
                    </div>
                </div>
            </section>

            {/* ============ CALL TO ACTION ============ */}
            <section id="cta" className="px-6 pb-24">
                <div className="mx-auto max-w-4xl rounded-3xl bg-[#2E2A1F] px-8 py-16 text-center text-[#FAF7F0] md:py-20">
                    <h2 className="font-serif text-3xl md:text-4xl">Siap Menjadi Bagian dari Simpul?</h2>
                    <p className="mx-auto mt-4 max-w-lg text-[#FAF7F0]/70">
                        Baik kamu produsen yang ingin harga lebih adil, atau pembeli yang ingin
                        produk langsung dari sumbernya — Simpul ada untuk menghubungkan keduanya.
                    </p>
                    <div className="mt-8 flex flex-wrap justify-center gap-4">
                        <Link
                            href="/auth/register"
                            className="rounded-full bg-[#3F5A3D] px-7 py-3.5 font-medium text-white transition hover:bg-[#4a6b47]"
                        >
                            Daftar Sekarang
                        </Link>
                        <Link
                            href="/marketplace"
                            className="rounded-full border border-[#FAF7F0]/25 px-7 py-3.5 font-medium text-[#FAF7F0] transition hover:border-[#FAF7F0]/50"
                        >
                            Jelajahi Marketplace
                        </Link>
                    </div>
                </div>
            </section>

            {/* ============ FOOTER ============ */}
            <footer className="border-t border-[#2E2A1F]/10 px-6 py-14">
                <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-3">
                    <div>
                        <p className="font-serif text-xl">Simpul</p>
                        <p className="mt-2 max-w-xs text-sm text-[#2E2A1F]/60">
                            Menghubungkan produsen lokal ke pasar yang lebih luas, dengan harga yang adil.
                        </p>
                    </div>
                    <div className="text-sm">
                        <p className="font-medium">Navigasi</p>
                        <ul className="mt-3 space-y-2 text-[#2E2A1F]/60">
                            <li><Link href="/marketplace" className="hover:text-[#2E2A1F]">Marketplace</Link></li>
                            <li><Link href="/#about" className="hover:text-[#2E2A1F]">Tentang Kami</Link></li>
                            <li><Link href="/#faq" className="hover:text-[#2E2A1F]">FAQ</Link></li>
                        </ul>
                    </div>
                    <div className="text-sm">
                        <p className="font-medium">Untuk Pengguna</p>
                        <ul className="mt-3 space-y-2 text-[#2E2A1F]/60">
                            <li><Link href="/auth/register" className="hover:text-[#2E2A1F]">Daftar Produsen</Link></li>
                            <li><Link href="/auth/register" className="hover:text-[#2E2A1F]">Daftar Pembeli</Link></li>
                            <li><Link href="/auth/login" className="hover:text-[#2E2A1F]">Masuk</Link></li>
                        </ul>
                    </div>
                </div>
                <p className="mx-auto mt-10 max-w-6xl border-t border-[#2E2A1F]/10 pt-6 text-xs text-[#2E2A1F]/50">
                    © 2026 Simpul. Dibuat untuk kompetisi.
                </p>
            </footer>
        </main>
    );
}