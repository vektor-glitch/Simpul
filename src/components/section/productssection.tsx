import Link from "next/link";
import Image from "next/image";
import { createClient } from "@supabase/supabase-js";

export default async function ProductsSection() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
    const { data: products } = await supabase
        .from("products")
        .select(`*, users!inner(name, producer_profiles(business_name, location))`)
        .eq("is_active", true)
        .limit(4);

    return (
        <section className="bg-slate-50 py-24 md:py-32">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <div className="flex flex-wrap items-end justify-between gap-6">
                    <div className="max-w-2xl">
                        <h2 className="font-extrabold text-3xl md:text-4xl">Produk dari Tangan <span className="text-brand-600"> Produsen Nusantara</span></h2>
                        <p className="mt-4 max-w-md text-slate-500">
                            Setiap produk di sini datang langsung dari petani, peternak, dan
                            pengrajin yang telah terverifikasi.
                        </p>
                    </div>
                    <Link href="/marketplace" className="whitespace-nowrap font-medium text-brand-500 hover:underline">
                        Lihat Semua Produk →
                    </Link>
                </div>
                <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {!products || products.length === 0 ? (
                        <div className="col-span-full py-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-100">
                            Belum ada produk yang tersedia saat ini.
                        </div>
                    ) : (
                        products.map((item) => (
                            <div key={item.id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
                                <div className="relative w-full h-48 bg-slate-100">
                                    {item.image_url ? (
                                        <Image src={item.image_url} alt={item.name} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw" className="object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">No Image</div>
                                    )}
                                </div>
                                <div className="p-5 flex flex-col grow">
                                    <h3 className="font-bold text-lg text-slate-900 truncate">{item.name}</h3>
                                    <p className="mt-1 text-brand-600 font-bold text-xl">Rp{item.price_final?.toLocaleString('id-ID')}</p>
                                    <p className="text-sm text-slate-500 truncate mt-auto">
                                        Dijual oleh: {item.users?.producer_profiles?.business_name || 'Anonim'}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </section>
    );
}