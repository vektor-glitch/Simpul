import Link from "next/link";
import Image from "next/image";
import { createClient } from "@supabase/supabase-js";
import { Users, Clock } from "lucide-react";

export default async function PoolsSection() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
    
    // Ambil maksimal 4 pool yang sedang aktif
    const { data: pools } = await supabase
        .from("pools")
        .select(`*, users!inner(name, producer_profiles(business_name))`)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(4);

    if (!pools || pools.length === 0) return null; // Sembunyikan section jika tidak ada pool aktif

    return (
        <section className="bg-white py-24 md:py-32">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <div className="flex flex-wrap items-end justify-between gap-6">
                    <div className="max-w-2xl">
                        <h2 className="font-extrabold text-3xl md:text-4xl">Ikuti <span className="text-earth-600">Pool Grosir</span> Aktif</h2>
                        <p className="mt-4 max-w-md text-slate-500">
                            Beli bersama untuk memenuhi target kuota produsen dan dapatkan harga terbaik secara langsung.
                        </p>
                    </div>
                    <Link href="/pools" className="whitespace-nowrap font-medium text-earth-500 hover:underline">
                        Lihat Semua Pool →
                    </Link>
                </div>
                <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {pools.map((pool) => {
                        const progress = (pool.current_quantity / pool.target_quantity) * 100;
                        
                        return (
                            <div key={pool.id} className="bg-earth-50 rounded-2xl border border-earth-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row">
                                <div className="w-full md:w-48 h-48 md:h-auto bg-slate-200 relative shrink-0">
                                    {pool.image_url ? (
                                        <Image src={pool.image_url} alt={pool.title} fill className="object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-400">No Image</div>
                                    )}
                                </div>
                                <div className="p-6 flex flex-col grow">
                                    <h3 className="font-bold text-xl text-slate-900 line-clamp-1">{pool.title}</h3>
                                    <p className="text-sm text-slate-500 line-clamp-1 mt-1">Oleh: {pool.users?.producer_profiles?.business_name || pool.users?.name}</p>
                                    
                                    <div className="mt-4 bg-white rounded-xl p-4 border border-earth-100">
                                        <div className="flex justify-between text-xs font-bold mb-2">
                                            <span className="text-earth-600">Terkumpul: {pool.current_quantity} {pool.unit}</span>
                                            <span className="text-slate-400">Target: {pool.target_quantity} {pool.unit}</span>
                                        </div>
                                        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                                            <div className="bg-earth-500 h-2.5 rounded-full" style={{ width: `${Math.min(progress, 100)}%` }}></div>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-auto pt-4 flex items-center justify-between">
                                        <p className="font-black text-2xl text-slate-900">
                                            Rp{pool.price?.toLocaleString('id-ID')} <span className="text-sm font-normal text-slate-500">/{pool.unit}</span>
                                        </p>
                                        <Link href={`/pools/${pool.id}`} className="px-5 py-2 bg-earth-600 hover:bg-earth-700 text-white text-sm font-bold rounded-lg shadow-sm transition-colors">
                                            Gabung Pool
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
