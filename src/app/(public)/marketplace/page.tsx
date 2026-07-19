import { createClient } from "@supabase/supabase-js";
import Image from "next/image";
import Link from "next/link";
import { Search, SlidersHorizontal } from "lucide-react";
import MarketNav from "@/components/marketplace/marketplacenav";
import LogoSvg from "@/components/logo/LOGO-SIMPUL.svg";

function formatRupiah(n: number) {
    return `Rp${n.toLocaleString("id-ID")}`;
}

type SearchParams = {
    q?: string;
    category?: string;
    sort?: "newest" | "price_low" | "price_high";
    page?: string;
};

export default async function MarketplacePage({
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

    // Ambil produk aktif dengan filter dari query params
    let productQuery = supabase
        .from("products")
        .select(`*, users!inner(name, producer_profiles(business_name, location))`, { count: "exact" })
        .eq("is_active", true)
        .range(from, to);

    if (params.q) {
        productQuery = productQuery.ilike("name", `%${params.q}%`);
    }
    if (params.category) {
        productQuery = productQuery.eq("category", params.category);
    }

    if (sort === "price_low") {
        productQuery = productQuery.order("price_final", { ascending: true });
    } else if (sort === "price_high") {
        productQuery = productQuery.order("price_final", { ascending: false });
    } else {
        productQuery = productQuery.order("created_at", { ascending: false });
    }

    const { data: products, error: productsError, count: totalItems } = await productQuery;
    if (productsError) console.error("Gagal ambil produk:", productsError.message);

    const totalPages = totalItems ? Math.ceil(totalItems / limit) : 1;

    // Daftar kategori unik untuk sidebar filter
    const { data: categoryRows } = await supabase
        .from("products")
        .select("category")
        .eq("is_active", true);
    const categories = Array.from(
        new Set((categoryRows ?? []).map((r) => r.category).filter(Boolean)),
    );

    const items = products ?? [];

    return (
        <div style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 60%, #fff7ed 100%)' }} className="min-h-screen flex flex-col">
            <MarketNav />
            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
                {/*  Breadcrumbs / Title  */}
                <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-brand-600">Marketplace</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            {params.q ? `Hasil pencarian untuk "${params.q}"` : "Temukan produk berkualitas langsung dari produsen lokal"}
                        </p>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-6 items-start">
                    {/*  Sidebar Filter  */}
                    <aside className="w-full lg:w-60 shrink-0 bg-white rounded-xl border border-gray-200 p-5 lg:sticky lg:top-24">
                        <div className="mb-4 flex items-center gap-2 font-bold text-gray-800 pb-3 border-b border-gray-100">
                            <SlidersHorizontal size={18} className="text-brand-600" />
                            Filter Produk
                        </div>

                        <div className="space-y-6">
                            <div>
                                <p className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-500">
                                    Kategori
                                </p>
                                <div className="flex flex-col gap-1.5">
                                    <Link
                                        href="/marketplace"
                                        className={`px-3 py-2 rounded-lg text-sm transition-colors ${!params.category ? "bg-brand-50 text-brand-700 font-semibold" : "text-gray-600 hover:bg-gray-50"
                                            }`}
                                    >
                                        Semua Kategori
                                    </Link>
                                    {categories.map((cat) => (
                                        <Link
                                            key={cat}
                                            href={`/marketplace?category=${encodeURIComponent(cat)}`}
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
                                        { key: "newest", label: "Terbaru" },
                                        { key: "price_low", label: "Harga Terendah" },
                                        { key: "price_high", label: "Harga Tertinggi" },
                                    ].map((s) => (
                                        <Link
                                            key={s.key}
                                            href={`/marketplace?sort=${s.key}${params.category ? `&category=${params.category}` : ""}`}
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

                    {/*  Grid Produk  */}
                    <div className="flex-1 w-full">
                        <div className="mb-4 flex items-center justify-between">
                            <p className="text-sm text-gray-500 font-medium">
                                Menampilkan <span className="text-gray-900 font-bold">{items.length}</span> produk
                            </p>
                        </div>

                        {items.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center flex flex-col items-center justify-center">
                                <Search className="w-12 h-12 text-gray-300 mb-4" />
                                <h3 className="text-lg font-bold text-gray-900">Produk Tidak Ditemukan</h3>
                                <p className="text-sm text-gray-500 mt-2">Coba ubah kata kunci atau filter pencarian Anda.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                                {items.map((p: any) => {
                                    const profile = p.users?.producer_profiles;
                                    // Menggunakan data rating asli dari Supabase (fallback ke 0 jika belum ada/null)
                                    const rating = p.rating ? Number(p.rating).toFixed(1) : "0.0";
                                    const reviews = p.review_count || p.reviews_count || p.reviews || 0;

                                    return (
                                        <Link
                                            href={`/marketplace/${p.id}`}
                                            key={p.id}
                                            className="group flex flex-col bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200"
                                        >
                                            <div className="relative aspect-square bg-gray-50 overflow-hidden border-b border-gray-100 flex items-center justify-center">
                                                {p.image_url ? (
                                                    <Image
                                                        src={p.image_url}
                                                        alt={p.name}
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
                                                <h3 className="text-sm text-gray-900 leading-snug line-clamp-2">{p.name}</h3>

                                                <p className="font-bold text-base text-gray-900 mt-1">
                                                    {formatRupiah(p.price_final)}<span className="text-xs text-gray-500 font-normal">/{p.unit}</span>
                                                </p>

                                                <div className="mt-auto pt-3 flex flex-col gap-1 border-t border-gray-100">
                                                    <div className="flex items-center gap-1">
                                                        <p className="text-[11px] text-gray-700 font-medium truncate max-w-[130px]">
                                                            {profile?.business_name ?? p.users?.name ?? "Produsen Anonim"}
                                                        </p>
                                                        <svg className="w-3.5 h-3.5 text-brand-500 shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"></path></svg>
                                                    </div>
                                                    <p className="text-[11px] text-gray-500 flex items-center gap-1 truncate">
                                                        <svg className="w-3 h-3 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                                        {profile?.location ?? "Lokasi tidak diketahui"}
                                                    </p>
                                                </div>

                                                <div className="mt-2 flex items-center gap-1 text-[11px] text-gray-500">
                                                    <svg className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                                                    <span className="font-medium text-gray-700">{rating}</span>
                                                    <span className="text-gray-400">({reviews})</span>
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
                                        href={`/marketplace?page=${page - 1}${params.q ? `&q=${params.q}` : ""}${params.category ? `&category=${params.category}` : ""}${params.sort ? `&sort=${params.sort}` : ""}`}
                                        className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-brand-600 transition-colors"
                                    >
                                        &laquo;
                                    </Link>
                                )}

                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                                    <Link
                                        key={p}
                                        href={`/marketplace?page=${p}${params.q ? `&q=${params.q}` : ""}${params.category ? `&category=${params.category}` : ""}${params.sort ? `&sort=${params.sort}` : ""}`}
                                        className={`w-10 h-10 flex items-center justify-center rounded-lg font-bold transition-colors ${p === page
                                            ? "bg-brand-600 text-white border border-brand-600"
                                            : "border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-brand-600"
                                            }`}
                                    >
                                        {p}
                                    </Link>
                                ))}

                                {page < totalPages && (
                                    <Link
                                        href={`/marketplace?page=${page + 1}${params.q ? `&q=${params.q}` : ""}${params.category ? `&category=${params.category}` : ""}${params.sort ? `&sort=${params.sort}` : ""}`}
                                        className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-brand-600 transition-colors"
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
