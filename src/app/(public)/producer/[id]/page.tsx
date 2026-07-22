import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Star, MapPin, Package, CalendarDays, ShieldCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import LogoSvg from "@/components/logo/LOGO-SIMPUL.svg";

export default async function PublicProducerProfile({ params }: { params: Promise<{ id: string }> }) {
    const supabase = await createClient();
    const resolvedParams = await params;
    
    // Fetch producer data
    const { data: producers, error: producerError } = await supabase
        .from('producer_profiles')
        .select(`
            *,
            user:users(name, role)
        `)
        .eq('user_id', resolvedParams.id);
        
    if (producerError || !producers || producers.length === 0) {
        console.error("Error fetching producer:", producerError, "ID:", resolvedParams.id);
        return (
            <div className="max-w-7xl mx-auto px-4 py-12 text-center">
                <h1 className="text-2xl font-bold text-red-600 mb-4">Gagal Memuat Profil Produsen</h1>
                <p className="text-gray-600 mb-2">ID: {resolvedParams.id}</p>
                <p className="text-gray-600 mb-4">Error: {producerError?.message || "Data tidak ditemukan"}</p>
                <Link href="/marketplace" className="text-brand-600 hover:underline">Kembali ke Marketplace</Link>
            </div>
        );
    }
    
    const producer = producers[0];
    
    // Fallback if users is an array (sometimes happens with 1:1 depending on definition)
    const userData = Array.isArray(producer.user) ? producer.user[0] : producer.user;
    
    if (userData?.role !== 'producer') {
        console.error("User is not a producer:", userData, "ID:", resolvedParams.id);
        return (
            <div className="max-w-7xl mx-auto px-4 py-12 text-center">
                <h1 className="text-2xl font-bold text-red-600 mb-4">Pengguna Bukan Produsen</h1>
                <p className="text-gray-600 mb-2">ID: {resolvedParams.id}</p>
                <p className="text-gray-600 mb-4">Role saat ini: {userData?.role || "Tidak diketahui"}</p>
                <Link href="/marketplace" className="text-brand-600 hover:underline">Kembali ke Marketplace</Link>
            </div>
        );
    }
    
    // Re-assign back for component usage
    producer.user = userData;

    // Fetch producer's products
    const { data: products } = await supabase
        .from('products')
        .select('*')
        .eq('producer_id', resolvedParams.id)
        .order('created_at', { ascending: false });
        
    // Fetch producer's reviews to calculate rating
    const { data: reviews } = await supabase
        .from('reviews')
        .select('rating')
        .eq('producer_id', resolvedParams.id);
        
    let avgRating = 0;
    if (reviews && reviews.length > 0) {
        avgRating = reviews.reduce((sum, rev) => sum + rev.rating, 0) / reviews.length;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* Header Profile */}
            <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm mb-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <ShieldCheck size={200} />
                </div>
                
                <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start md:items-center">
                    <div className="w-32 h-32 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center font-black text-5xl shrink-0 border-4 border-white shadow-lg">
                        {producer.user?.name?.charAt(0) || 'P'}
                    </div>
                    
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-3xl font-extrabold text-gray-900">{producer.business_name}</h1>
                            <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                                <ShieldCheck size={14} /> Terverifikasi
                            </span>
                        </div>
                        
                        <p className="text-gray-600 font-medium mb-4">{producer.user?.name} (Pemilik)</p>
                        
                        <div className="flex flex-wrap gap-6 text-sm text-gray-500">
                            <div className="flex items-center gap-2">
                                <MapPin size={16} className="text-gray-400" />
                                {producer.location || 'Alamat belum diatur'}
                            </div>
                            <div className="flex items-center gap-2">
                                <Star size={16} className="fill-yellow-400 text-yellow-400" />
                                <span className="font-bold text-gray-900">{avgRating > 0 ? avgRating.toFixed(1) : 'Baru'}</span>
                                ({reviews?.length || 0} Ulasan)
                            </div>
                            <div className="flex items-center gap-2">
                                <CalendarDays size={16} className="text-gray-400" />
                                Bergabung {new Date(producer.created_at).getFullYear()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Deskripsi & Statistik */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                <div className="lg:col-span-2 bg-white rounded-3xl p-8 border border-gray-200 shadow-sm">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Tentang Usaha</h3>
                    <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                        {producer.description || 'Produsen ini belum menambahkan deskripsi usaha.'}
                    </p>
                </div>
                
                <div className="bg-brand-50 rounded-3xl p-8 border border-brand-100 shadow-sm flex flex-col justify-center items-center text-center">
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-brand-600 mb-4 shadow-sm">
                        <Package size={32} />
                    </div>
                    <h4 className="text-4xl font-black text-brand-900 mb-1">{products?.length || 0}</h4>
                    <p className="font-bold text-brand-700">Produk Aktif</p>
                    <p className="text-sm text-brand-600/70 mt-2">Tersedia untuk pesanan B2B</p>
                </div>
            </div>
            
            {/* Katalog Produk */}
            <div>
                <h3 className="text-2xl font-extrabold text-gray-900 mb-6 flex items-center gap-2">
                    Katalog Produk <span className="text-brand-600">Terbaik</span>
                </h3>
                
                {products && products.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {products.map((product: any) => {
                            const rating = product.rating?.toFixed(1) || "5.0";
                            const reviews = product.review_count || product.reviews_count || product.reviews || 0;
                            
                            return (
                                <Link
                                    href={`/marketplace/${product.id}`}
                                    key={product.id}
                                    className="group flex flex-col bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200"
                                >
                                    <div className="relative aspect-square bg-gray-50 overflow-hidden border-b border-gray-100 flex items-center justify-center">
                                        {product.image_url ? (
                                            <Image
                                                src={product.image_url}
                                                alt={product.name}
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
                                        <h3 className="text-sm text-gray-900 leading-snug line-clamp-2">{product.name}</h3>

                                        <p className="font-bold text-base text-gray-900 mt-1">
                                            Rp{(product.price_final || product.price_buyer || 0).toLocaleString('id-ID')}<span className="text-xs text-gray-500 font-normal">/{product.unit}</span>
                                        </p>

                                        <div className="mt-auto pt-3 flex flex-col gap-1 border-t border-gray-100">
                                            <div className="flex items-center gap-1">
                                                <p className="text-[11px] text-gray-700 font-medium truncate max-w-[130px]">
                                                    {producer.business_name ?? producer.user?.name ?? "Produsen Anonim"}
                                                </p>
                                                <svg className="w-3.5 h-3.5 text-brand-500 shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"></path></svg>
                                            </div>
                                            <p className="text-[11px] text-gray-500 flex items-center gap-1 truncate">
                                                <svg className="w-3 h-3 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                                {producer.location ?? "Lokasi tidak diketahui"}
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
                ) : (
                    <div className="bg-gray-50 rounded-3xl p-12 text-center">
                        <Package size={48} className="mx-auto text-gray-300 mb-4" />
                        <h4 className="text-lg font-bold text-gray-900 mb-2">Belum Ada Produk</h4>
                        <p className="text-gray-500">Produsen ini belum mengunggah produk apapun ke dalam katalog.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
