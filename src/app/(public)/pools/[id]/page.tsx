import { createClient } from "@supabase/supabase-js";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, MapPin, Package, Users, Tag, CheckCircle2 } from "lucide-react";
import MarketNav from "@/components/marketplace/marketplacenav";
import PoolCheckoutBox from "@/components/marketplace/PoolCheckoutBox";
import { notFound } from "next/navigation";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export const revalidate = 60;

export default async function PoolDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    // Ambil data Pool
    const { data: pool, error } = await supabase
        .from("pools")
        .select(`*`)
        .eq("id", id)
        .single();

    if (error || !pool) {
        notFound();
    }

    // Ambil produsen yang berkontribusi (pool_contributions)
    const { data: contributions } = await supabase
        .from("pool_contributions")
        .select(`
            quantity_committed,
            producer:users!pool_contributions_producer_id_fkey(
                producer_profiles(business_name, location)
            )
        `)
        .eq("pool_id", id);

    const producersList = contributions || [];
    const availableToBuy = pool.collected_quantity - pool.sold_quantity;
    const isSoldOut = availableToBuy <= 0 || pool.status === 'sold_out';

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            <MarketNav />

            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
                {/* Breadcrumb Navigation */}
                <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                    <Link href="/" className="hover:text-brand-600 transition-colors">Beranda</Link>
                    <ChevronRight size={14} />
                    <Link href="/pools" className="hover:text-brand-600 transition-colors">Pool Grosir</Link>
                    <ChevronRight size={14} />
                    <span className="text-gray-900 font-medium truncate max-w-[200px]">{pool.title}</span>
                </nav>

                <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
                    {/* Kiri: Gambar & Info Produk */}
                    <div className="flex-1 space-y-8">
                        {/* Gambar Utama */}
                        <div className="relative w-full aspect-[4/3] md:aspect-video rounded-3xl overflow-hidden bg-slate-200 shadow-md">
                            {pool.image_url ? (
                                <Image src={pool.image_url} alt={pool.title} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" priority />
                            ) : (
                                <div className="flex items-center justify-center w-full h-full text-slate-400">
                                    <Package size={64} className="opacity-20" />
                                </div>
                            )}
                            <div className="absolute top-4 left-4 bg-brand-600 text-white font-bold px-3 py-1.5 rounded-lg shadow-sm">
                                {pool.category}
                            </div>
                            {isSoldOut && (
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                                    <div className="bg-red-500 text-white font-black text-3xl px-8 py-4 rounded-2xl rotate-[-10deg] border-4 border-white shadow-2xl">
                                        SOLD OUT
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Info Header */}
                        <div>
                            <div className="flex items-center gap-2 text-brand-600 font-medium text-sm mb-2">
                                <MapPin size={16} />
                                {pool.region}
                            </div>
                            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight mb-4">
                                {pool.title}
                            </h1>
                            <div className="text-3xl font-black text-brand-700">
                                Rp{(pool.price || 0).toLocaleString("id-ID")}<span className="text-lg font-medium text-gray-500">/{pool.unit}</span>
                            </div>
                        </div>

                        <hr className="border-gray-200" />

                        {/* Transparansi Produsen */}
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Users className="text-brand-600" />
                                Sumber Hasil Panen
                            </h2>
                            <p className="text-gray-600 mb-4">
                                Kuantitas di pool ini merupakan gabungan *(collective)* dari hasil panen/produk produsen berikut:
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {producersList.map((contrib, idx) => (
                                    <div key={idx} className="bg-white border border-gray-200 rounded-xl p-4 flex items-start gap-4">
                                        <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center text-brand-700 font-bold shrink-0">
                                            {contrib.producer?.producer_profiles?.business_name?.[0] || '?'}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900">{contrib.producer?.producer_profiles?.business_name || 'Produsen Anonim'}</h4>
                                            <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                                <MapPin size={12} />
                                                {contrib.producer?.producer_profiles?.location || 'Lokasi tidak diketahui'}
                                            </p>
                                            <div className="mt-2 text-xs font-bold bg-brand-50 text-brand-700 inline-block px-2 py-1 rounded">
                                                Menyumbang {contrib.quantity_committed} {pool.unit}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {producersList.length === 0 && (
                                    <div className="text-gray-500 italic p-4 border border-dashed rounded-xl bg-gray-50">Belum ada produsen yang berkontribusi.</div>
                                )}
                            </div>
                        </div>

                        {/* Deskripsi */}
                        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
                            <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                                <Tag size={18} />
                                Keuntungan Grosir Pool
                            </h3>
                            <ul className="text-blue-800 space-y-2 text-sm list-disc list-inside">
                                <li>Harga lebih terjangkau dibandingkan membeli eceran per produsen.</li>
                                <li>Kapasitas terjamin karena berasal dari banyak produsen di wilayah yang sama.</li>
                                <li>Cocok untuk kebutuhan B2B, Horeka (Hotel, Restoran, Kafe), maupun pesanan partai besar.</li>
                            </ul>
                        </div>
                    </div>

                    {/* Kanan: Box Checkout */}
                    <div className="lg:w-[380px] shrink-0">
                        {/* Progress Bar Info (Hanya visualisasi tambahan di sidebar) */}
                        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm mb-6">
                            <h3 className="font-bold text-gray-900 mb-3">Informasi Stok Gabungan</h3>
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-500">Terkumpul dari produsen</span>
                                        <span className="font-bold text-gray-900">{pool.collected_quantity} / {pool.target_quantity} {pool.unit}</span>
                                    </div>
                                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                        <div className="bg-green-500 h-full" style={{ width: `${Math.min(100, (pool.collected_quantity / pool.target_quantity) * 100)}%` }}></div>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-500">Telah dibeli (*Sold*)</span>
                                        <span className="font-bold text-brand-700">{pool.sold_quantity} {pool.unit}</span>
                                    </div>
                                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                        <div className="bg-brand-500 h-full" style={{ width: `${Math.min(100, pool.collected_quantity > 0 ? (pool.sold_quantity / pool.collected_quantity) * 100 : 0)}%` }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {!isSoldOut ? (
                            <PoolCheckoutBox
                                poolId={pool.id}
                                price={pool.price}
                                stock={availableToBuy}
                                minOrder={10} // Misal minimal order 10
                                unit={pool.unit}
                            />
                        ) : (
                            <div className="bg-white rounded-2xl border border-red-200 p-8 shadow-sm text-center">
                                <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Package size={32} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Pool Habis Terjual</h3>
                                <p className="text-gray-500 mb-6">
                                    Mohon maaf, seluruh stok yang terkumpul dari produsen di pool ini sudah ludes dipesan pembeli lain.
                                </p>
                                <Link href="/pools" className="inline-flex items-center justify-center w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors">
                                    Cari Pool Lain
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
