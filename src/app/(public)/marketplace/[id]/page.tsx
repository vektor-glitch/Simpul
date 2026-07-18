import { createClient } from "@supabase/supabase-js";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, MapPin, Star, ShieldCheck, Truck } from "lucide-react";
import MarketNav from "@/components/marketplace/marketplacenav";
import LogoSvg from "@/components/logo/LOGO-SIMPUL.svg";
import CheckoutBox from "@/components/marketplace/CheckoutBox";
import { notFound } from "next/navigation";

// Supabase client instance untuk Server Component
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export const revalidate = 60; // Cache setiap 60 detik

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    // Fetch data produk dan relasi pengguna dan profil produsennya
    const { data: product, error } = await supabase
        .from("products")
        .select(`
            *, 
            users!inner(
                name, 
                producer_profiles(business_name, location, description)
            )
        `)
        .eq("id", id)
        .eq("is_active", true)
        .single();

    if (error || !product) {
        notFound();
    }

    const producer = product.users?.producer_profiles;
    const storeName = producer?.business_name ?? product.users?.name ?? "Produsen Anonim";
    const storeLocation = producer?.location ?? "Lokasi tidak diketahui";
    const rating = product.rating ? Number(product.rating).toFixed(1) : "0.0";
    const reviewsCount = product.review_count || 0;

    // Fetch daftar ulasan untuk produk ini
    const { data: reviewsData } = await supabase
        .from("reviews")
        .select(`
            rating,
            comment,
            created_at,
            orders!inner(product_id),
            buyer:users!reviews_buyer_id_fkey(
                name,
                buyer_profiles(avatar_url)
            )
        `)
        .eq("orders.product_id", id)
        .order("created_at", { ascending: false });

    const reviews = reviewsData || [];

    return (
        <div className="min-h-screen bg-[#FAF7F0] flex flex-col font-sans">
            <MarketNav />

            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">

                {/* Breadcrumb Navigation */}
                <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                    <Link href="/marketplace" className="hover:text-brand-600 transition-colors">Marketplace</Link>
                    <ChevronRight size={14} />
                    <Link href={`/marketplace?category=${encodeURIComponent(product.category)}`} className="hover:text-brand-600 transition-colors">
                        {product.category}
                    </Link>
                    <ChevronRight size={14} />
                    <span className="text-gray-900 font-medium truncate max-w-[200px] sm:max-w-xs">{product.name}</span>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* Kiri: Gambar Produk (Col span 4) */}
                    <div className="lg:col-span-4 flex flex-col gap-4">
                        <div className="relative aspect-square rounded-2xl bg-white border border-gray-200 overflow-hidden shadow-sm flex items-center justify-center">
                            {product.image_url ? (
                                <Image
                                    src={product.image_url}
                                    alt={product.name}
                                    fill
                                    className="object-cover"
                                    priority
                                />
                            ) : (
                                <div className="w-24 h-24 opacity-20 grayscale">
                                    <Image src={LogoSvg} alt="Simpul Logo" width={96} height={96} />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Tengah: Info Produk (Col span 5) */}
                    <div className="lg:col-span-5 flex flex-col">
                        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 leading-tight mb-2">
                            {product.name}
                        </h1>

                        <div className="flex items-center gap-4 text-sm mb-4 border-b border-gray-200 pb-4">
                            <div className="flex items-center gap-1 text-yellow-500">
                                <Star className="w-5 h-5 fill-yellow-400" />
                                <span className="font-bold text-gray-900 text-base">{rating}</span>
                                <span className="text-gray-500">({reviewsCount} ulasan)</span>
                            </div>
                            <div className="w-1 h-1 rounded-full bg-gray-300"></div>
                            <div className="text-gray-600">
                                Terjual <span className="font-bold text-gray-900">100+</span>
                            </div>
                        </div>

                        <div className="mb-6">
                            <span className="text-3xl md:text-4xl font-extrabold text-gray-900">
                                Rp{product.price_final.toLocaleString('id-ID')}
                            </span>
                            <span className="text-gray-500 ml-1">/{product.unit}</span>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <h3 className="font-bold text-gray-900 mb-2">Detail Produk</h3>
                                <div className="grid grid-cols-3 gap-2 text-sm py-3 border-y border-gray-100">
                                    <span className="text-gray-500">Kategori</span>
                                    <span className="col-span-2 text-brand-600 font-medium">{product.category}</span>

                                    <span className="text-gray-500">Minimum Order</span>
                                    <span className="col-span-2 text-gray-900">{product.min_order} {product.unit}</span>
                                </div>
                            </div>

                            <div>
                                <h3 className="font-bold text-gray-900 mb-2">Deskripsi</h3>
                                <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
                                    {product.description || "Tidak ada deskripsi yang disediakan oleh produsen."}
                                </p>
                            </div>
                        </div>

                        {/* Profil Toko / Produsen */}
                        <div className="mt-8 pt-6 border-t border-gray-200 flex items-center gap-4">
                            <div className="w-14 h-14 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-bold text-xl overflow-hidden relative border border-brand-200">
                                {product.users?.avatar_url ? (
                                    <Image src={product.users.avatar_url} alt={storeName} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover" />
                                ) : (
                                    storeName.charAt(0).toUpperCase()
                                )}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-1.5">
                                    <h3 className="font-bold text-gray-900 text-lg">{storeName}</h3>
                                    <ShieldCheck className="w-5 h-5 text-blue-500" />
                                </div>
                                <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                                    <MapPin size={14} /> {storeLocation}
                                </p>
                            </div>
                            <Link href={`/producer/${product.producer_id}`} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors">
                                Kunjungi Toko
                            </Link>
                        </div>
                        
                        {/* Daftar Ulasan Pembeli */}
                        <div className="mt-8 pt-8 border-t border-gray-200">
                            <h3 className="font-bold text-gray-900 mb-6 text-xl">Ulasan Pembeli ({reviewsCount})</h3>
                            
                            {reviews.length === 0 ? (
                                <div className="text-center py-8 bg-white border border-gray-100 rounded-xl">
                                    <p className="text-gray-500 text-sm">Belum ada ulasan untuk produk ini.</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {reviews.map((rev: any, idx: number) => {
                                        const buyerName = rev.buyer?.name || "Pembeli Rahasia";
                                        const buyerAvatar = rev.buyer?.buyer_profiles?.avatar_url;
                                        
                                        return (
                                            <div key={idx} className="flex gap-4 border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-500 overflow-hidden shrink-0 border border-gray-200">
                                                    {buyerAvatar ? (
                                                        <Image src={buyerAvatar} alt={buyerName} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover" />
                                                    ) : (
                                                        buyerName.charAt(0).toUpperCase()
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-bold text-gray-900 text-sm mb-1">{buyerName}</p>
                                                    <div className="flex items-center gap-1 mb-2">
                                                        {Array.from({ length: 5 }).map((_, i) => (
                                                            <Star 
                                                                key={i} 
                                                                className={`w-3.5 h-3.5 ${i < rev.rating ? "fill-yellow-400 text-yellow-500" : "fill-gray-100 text-gray-200"}`} 
                                                            />
                                                        ))}
                                                        <span className="text-xs text-gray-400 ml-2">
                                                            {new Date(rev.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                        </span>
                                                    </div>
                                                    {rev.comment && (
                                                        <p className="text-gray-600 text-sm leading-relaxed">{rev.comment}</p>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                    </div>

                    {/* Kanan: Checkout Box (Col span 3) */}
                    <div className="lg:col-span-3">
                        <CheckoutBox
                            productId={product.id}
                            price={product.price_final}
                            stock={product.stock}
                            minOrder={product.min_order}
                            unit={product.unit}
                        />

                        {/* Info Tambahan */}
                        <div className="mt-4 p-4 rounded-xl border border-brand-100 bg-brand-50 flex gap-3 text-sm text-brand-800">
                            <Truck className="w-5 h-5 shrink-0 text-brand-600 mt-0.5" />
                            <p>Ongkos kirim akan dihitung secara presisi menggunakan sistem <span className="font-bold">RajaOngkir</span> pada halaman selanjutnya.</p>
                        </div>
                    </div>
                </div>

            </main>
        </div>
    );
}
