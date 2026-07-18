import { createClient } from "@supabase/supabase-js";
import Image from "next/image";
import Link from "next/link";
import { Search, SlidersHorizontal, Users } from "lucide-react";
import MarketNav from "@/components/marketplace/marketplacenav";
import LogoSvg from "@/components/logo/LOGO-SIMPUL.svg";

type SearchParams = {
    q?: string;
    category?: string;
    region?: string;
    sort?: "newest" | "ending_soon";
    page?: string;
};

export default async function PoolsPage({
    searchParams,
}: {
    searchParams: Promise<SearchParams>;
}) {
    const params = await searchParams;
    const sort = params.sort ?? "newest";

    // Pagination (12 item per halaman)
    const page = params.page ? parseInt(params.page) : 1;
    const limit = 12;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    let poolQuery = supabase
        .from("pools")
        .select(`*`, { count: "exact" })
        .eq("status", "open")
        .range(from, to);

    if (params.q) {
        poolQuery = poolQuery.ilike("title", `%${params.q}%`);
    }
    if (params.category) {
        poolQuery = poolQuery.eq("category", params.category);
    }
    if (params.region) {
        poolQuery = poolQuery.eq("region", params.region);
    }

    if (sort === "ending_soon") {
        poolQuery = poolQuery.order("deadline", { ascending: true });
    } else {
        poolQuery = poolQuery.order("created_at", { ascending: false });
    }

    const { data: pools, error: poolsError, count: totalItems } = await poolQuery;
    if (poolsError) console.error("Gagal ambil pool:", poolsError.message);

    const totalPages = totalItems ? Math.ceil(totalItems / limit) : 1;

    // Daftar kategori & region untuk sidebar filter
    const { data: allPools } = await supabase
        .from("pools")
        .select("category, region")
        .eq("status", "open");

    const categories = Array.from(
        new Set((allPools ?? []).map((r) => r.category).filter(Boolean)),
    );
    const regions = Array.from(
        new Set((allPools ?? []).map((r) => r.region).filter(Boolean)),
    );

    const items = pools ?? [];

    return (
        <div style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 60%, #fff7ed 100%)' }} className="min-h-screen flex flex-col">
            <MarketNav />
            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
                {/*  Breadcrumbs / Title  */}
                <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Pool Simpul</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            {params.q ? `Hasil pencarian untuk "${params.q}"` : "Produsen sejenis di satu wilayah bergabung untuk memenuhi pesanan skala besar."}
                        </p>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-6 items-start">
                    {/*  Sidebar Filter  */}
                    <aside className="w-full lg:w-60 shrink-0 bg-white rounded-xl border border-gray-200 p-5 lg:sticky lg:top-24">
                        <div className="mb-4 flex items-center gap-2 font-bold text-gray-800 pb-3 border-b border-gray-100">
                            <SlidersHorizontal size={18} className="text-earth-600" />
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
                                        className={`px-3 py-2 rounded-lg text-sm transition-colors ${!params.category ? "bg-earth-50 text-earth-700 font-semibold" : "text-gray-600 hover:bg-gray-50"
                                            }`}
                                    >
                                        Semua Kategori
                                    </Link>
                                    {categories.map((cat) => (
                                        <Link
                                            key={cat}
                                            href={`/pools?category=${encodeURIComponent(cat)}${params.region ? `&region=${params.region}` : ""}`}
                                            className={`px-3 py-2 rounded-lg text-sm transition-colors ${params.category === cat ? "bg-earth-50 text-earth-700 font-semibold" : "text-gray-600 hover:bg-gray-50"
                                                }`}
                                        >
                                            {cat}
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <p className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-500">
                                    Wilayah
                                </p>
                                <div className="flex flex-col gap-1.5">
                                    <Link
                                        href="/pools"
                                        className={`px-3 py-2 rounded-lg text-sm transition-colors ${!params.region ? "bg-earth-50 text-earth-700 font-semibold" : "text-gray-600 hover:bg-gray-50"
                                            }`}
                                    >
                                        Semua Wilayah
                                    </Link>
                                    {regions.map((r) => (
                                        <Link
                                            key={r}
                                            href={`/pools?region=${encodeURIComponent(r)}${params.category ? `&category=${params.category}` : ""}`}
                                            className={`px-3 py-2 rounded-lg text-sm transition-colors ${params.region === r ? "bg-earth-50 text-earth-700 font-semibold" : "text-gray-600 hover:bg-gray-50"
                                                }`}
                                        >
                                            {r}
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
                                        { key: "newest", label: "Terbaru" },
                                        { key: "ending_soon", label: "Segera Berakhir" },
                                    ].map((s) => (
                                        <Link
                                            key={s.key}
                                            href={`/pools?sort=${s.key}${params.category ? `&category=${params.category}` : ""}${params.region ? `&region=${params.region}` : ""}`}
                                            className={`px-3 py-2 rounded-lg text-sm transition-colors ${sort === s.key
                                                ? "bg-earth-50 text-earth-700 font-semibold"
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

                    {/*  Grid Pool  */}
                    <div className="flex-1 w-full">
                        <div className="mb-4 flex items-center justify-between">
                            <p className="text-sm text-gray-500 font-medium">
                                Menampilkan <span className="text-gray-900 font-bold">{items.length}</span> pool aktif
                            </p>
                        </div>

                        {items.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center flex flex-col items-center justify-center">
                                <Search className="w-12 h-12 text-gray-300 mb-4" />
                                <h3 className="text-lg font-bold text-gray-900">Pool Tidak Ditemukan</h3>
                                <p className="text-sm text-gray-500 mt-2">Coba ubah kata kunci atau filter pencarian Anda.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                                {items.map((pool: any) => {
                                    const progress = Math.min(
                                        100,
                                        Math.round((pool.current_quantity / pool.target_quantity) * 100),
                                    );

                                    return (
                                        <Link
                                            href={`/pools/${pool.id}`}
                                            key={pool.id}
                                            className="group flex flex-col bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200"
                                        >
                                            <div className="relative aspect-[4/3] bg-earth-50/40 border-b border-gray-100 flex items-center justify-center overflow-hidden p-6">
                                                {pool.image_url || pool.image ? (
                                                    <Image
                                                        src={pool.image_url || pool.image}
                                                        alt={pool.title}
                                                        fill
                                                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                                                    />
                                                ) : (
                                                    <div className="w-20 h-20 opacity-30 grayscale group-hover:scale-110 transition-transform duration-300 flex items-center justify-center relative z-10">
                                                        <Users className="w-16 h-16 text-earth-700" />
                                                    </div>
                                                )}
                                            </div>

                                            <div className="p-5 flex flex-col flex-1 gap-2">
                                                <div className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-earth-700">
                                                    {pool.category} · {pool.region}
                                                </div>
                                                
                                                <h3 className="text-base text-gray-900 leading-snug font-bold line-clamp-2">{pool.title}</h3>
                                                
                                                <div className="mt-auto pt-4 flex flex-col gap-2 border-t border-gray-100">
                                                    <div className="pool-bar mt-1 w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                                                        <div className="pool-bar-fill bg-earth-500 h-2.5" style={{ width: `${progress}%` }} />
                                                    </div>
                                                    <p className="mt-1 text-xs text-gray-700 font-medium">
                                                        Terkumpul: {pool.current_quantity} / {pool.target_quantity} {pool.unit} ({progress}%)
                                                    </p>
                                                    <p className="text-[11px] text-gray-500 mt-1">
                                                        Batas waktu: {new Date(pool.deadline).toLocaleDateString("id-ID")}
                                                    </p>
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        )}

                        {/*  Pagination  */}
                        {totalPages > 1 && (
                            <div className="mt-8 flex justify-center items-center gap-2">
                                {page > 1 && (
                                    <Link
                                        href={`/pools?page=${page - 1}${params.q ? `&q=${params.q}` : ""}${params.category ? `&category=${params.category}` : ""}${params.region ? `&region=${params.region}` : ""}${params.sort ? `&sort=${params.sort}` : ""}`}
                                        className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-earth-600 transition-colors"
                                    >
                                        &laquo;
                                    </Link>
                                )}

                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                                    <Link
                                        key={p}
                                        href={`/pools?page=${p}${params.q ? `&q=${params.q}` : ""}${params.category ? `&category=${params.category}` : ""}${params.region ? `&region=${params.region}` : ""}${params.sort ? `&sort=${params.sort}` : ""}`}
                                        className={`w-10 h-10 flex items-center justify-center rounded-lg font-bold transition-colors ${p === page
                                            ? "bg-earth-600 text-white border border-earth-600"
                                            : "border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-earth-600"
                                            }`}
                                    >
                                        {p}
                                    </Link>
                                ))}

                                {page < totalPages && (
                                    <Link
                                        href={`/pools?page=${page + 1}${params.q ? `&q=${params.q}` : ""}${params.category ? `&category=${params.category}` : ""}${params.region ? `&region=${params.region}` : ""}${params.sort ? `&sort=${params.sort}` : ""}`}
                                        className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-earth-600 transition-colors"
                                    >
                                        &raquo;
                                    </Link>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
