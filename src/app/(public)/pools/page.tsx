import { createClient } from "@supabase/supabase-js";
import Image from "next/image";
import Link from "next/link";
import { Search, SlidersHorizontal, MapPin, Calendar, LayoutDashboard } from "lucide-react";
import MarketNav from "@/components/marketplace/marketplacenav";
import LogoSvg from "@/components/logo/LOGO-SIMPUL.svg";

function formatRupiah(n: number = 0) {
    return `Rp${(n || 0).toLocaleString("id-ID")}`;
}

type SearchParams = {
    q?: string;
    category?: string;
    sort?: "newest" | "price_low" | "price_high";
    page?: string;
};

export default async function PoolsPage({
    searchParams,
}: {
    searchParams: Promise<SearchParams>;
}) {
    const params = await searchParams;
    const sort = params.sort ?? "newest";

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    // Ambil data pools yang masih terbuka
    let poolQuery = supabase
        .from("pools")
        .select(`*`, { count: "exact" })
        .eq("status", "open");

    // Urutkan (default deadline terdekat)
    if (sort === "price_low") {
        poolQuery = poolQuery.order("price", { ascending: true });
    } else if (sort === "price_high") {
        poolQuery = poolQuery.order("price", { ascending: false });
    } else {
        poolQuery = poolQuery.order("deadline", { ascending: true });
    }

    if (params.q) {
        poolQuery = poolQuery.ilike("title", `%${params.q}%`);
    }
    if (params.category) {
        poolQuery = poolQuery.eq("category", params.category);
    }

    const { data: pools, count, error } = await poolQuery;
    const categories = ["Pertanian", "Peternakan", "Perikanan", "Kerajinan", "Pupuk & Pakan"];

    return (
        <div className="min-h-screen bg-[#FAF7F0] flex flex-col font-sans">
            <MarketNav />

            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">

                <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-earth-600">Pool Grosir</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            {params.q ? `Hasil pencarian untuk "${params.q}"` : "Kumpulan komoditas panen grosir langsung dari produsen lokal"}
                        </p>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-6 items-start">
                    {/* Sidebar Filter */}
                    <aside className="w-full lg:w-60 shrink-0 bg-white rounded-xl border border-gray-200 p-5 lg:sticky lg:top-24">
                        <div className="mb-4 flex items-center gap-2 font-bold text-gray-800 pb-3 border-b border-gray-100">
                            <SlidersHorizontal size={18} className="text-brand-600" />
                            Filter Pool
                        </div>

                        <div className="space-y-6">
                            <div>
                                <p className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-500">
                                    Kategori
                                </p>
                                <div className="flex flex-col gap-1.5">
                                    <Link
                                        href="/pools"
                                        className={`px-3 py-2 rounded-lg text-sm transition-colors ${!params.category ? "bg-brand-50 text-brand-700 font-semibold" : "text-gray-600 hover:bg-gray-50"
                                            }`}
                                    >
                                        Semua Kategori
                                    </Link>
                                    {categories.map((cat) => (
                                        <Link
                                            key={cat}
                                            href={`/pools?category=${encodeURIComponent(cat)}`}
                                            className={`px-3 py-2 rounded-lg text-sm transition-colors ${params.category === cat ? "bg-brand-50 text-brand-700 font-semibold" : "text-gray-600 hover:bg-gray-50"
                                                }`}
                                        >
                                            {cat}
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <p className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-500">
                                    Urutkan
                                </p>
                                <div className="flex flex-col gap-1.5 text-sm">
                                    {[
                                        { key: "newest", label: "Tenggat Waktu Terdekat" },
                                        { key: "price_low", label: "Harga Terendah" },
                                        { key: "price_high", label: "Harga Tertinggi" },
                                    ].map((s) => (
                                        <Link
                                            key={s.key}
                                            href={`/pools?sort=${s.key}${params.category ? `&category=${params.category}` : ""}`}
                                            className={`px-3 py-2 rounded-lg text-sm transition-colors ${sort === s.key
                                                ? "bg-brand-50 text-brand-700 font-semibold"
                                                : "text-gray-600 hover:bg-gray-50"
                                                }`}
                                        >
                                            {s.label}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Grid Pool */}
                    <div className="flex-1 w-full">
                        <div className="mb-4 flex items-center justify-between">
                            <p className="text-sm text-gray-500 font-medium">
                                Menampilkan <span className="text-gray-900 font-bold">{count || 0}</span> pool aktif
                            </p>
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl text-center mb-6">
                                Gagal memuat daftar pool: {error.message}
                            </div>
                        )}

                        {!pools || pools.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center flex flex-col items-center justify-center">
                                <Search className="w-12 h-12 text-gray-300 mb-4" />
                                <h3 className="text-lg font-bold text-gray-900">Pool Tidak Ditemukan</h3>
                                <p className="text-sm text-gray-500 mt-2">Coba ubah filter atau kategori pencarian Anda.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                                {pools.map((pool) => {
                                    const progressPercentage = Math.min(100, (pool.collected_quantity / pool.target_quantity) * 100);

                                    return (
                                        <Link
                                            href={`/pools/${pool.id}`}
                                            key={pool.id}
                                            className="group flex flex-col bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200"
                                        >
                                            <div className="relative aspect-square bg-gray-50 overflow-hidden border-b border-gray-100 flex items-center justify-center">
                                                {pool.image_url ? (
                                                    <Image
                                                        src={pool.image_url}
                                                        alt={pool.title}
                                                        fill
                                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover group-hover:scale-105 transition-transform duration-300"
                                                    />
                                                ) : (
                                                    <div className="w-16 h-16 opacity-30 grayscale group-hover:scale-110 transition-transform duration-300">
                                                        <Image src={LogoSvg} alt="Simpul Logo" width={64} height={64} />
                                                    </div>
                                                )}
                                            </div>

                                            <div className="p-3 flex flex-col flex-1">
                                                <h3 className="text-sm text-gray-900 leading-snug line-clamp-2">{pool.title}</h3>

                                                <p className="font-bold text-base text-gray-900 mt-1">
                                                    {formatRupiah(pool.price)}<span className="text-xs text-gray-500 font-normal">/{pool.unit}</span>
                                                </p>

                                                <div className="mt-auto pt-3 flex flex-col gap-1 border-t border-gray-100">

                                                    {/* Progress Bar Simple */}
                                                    <div className="flex items-center justify-between text-[10px] font-semibold text-gray-500 mb-1">
                                                        <span>Terkumpul: {pool.collected_quantity}{pool.unit}</span>
                                                    </div>
                                                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                                        <div
                                                            className="bg-brand-500 h-full transition-all"
                                                            style={{ width: `${progressPercentage}%` }}
                                                        ></div>
                                                    </div>

                                                    <div className="flex items-center gap-1 text-[11px] text-gray-400 mt-2">
                                                        <MapPin size={10} />
                                                        <span className="truncate">{pool.region}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
