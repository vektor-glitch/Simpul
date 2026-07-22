"use client";

import { useEffect, useState } from "react";
import { Star, MessageSquare, Package, User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function ReviewsPage() {
    const supabase = createClient();
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ average: 0, total: 0 });

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('reviews')
                .select(`
                    id,
                    rating,
                    comment,
                    created_at,
                    buyer:users!reviews_buyer_id_fkey (name),
                    order:orders (
                        product:products (name, image_url)
                    )
                `)
                .eq('producer_id', user.id)
                .order('created_at', { ascending: false });

            if (data) {
                setReviews(data);
                
                if (data.length > 0) {
                    const avg = data.reduce((acc, curr) => acc + curr.rating, 0) / data.length;
                    setStats({ average: Number(avg.toFixed(1)), total: data.length });
                }
            }
        } catch (error) {
            console.error("Error fetching reviews:", error);
        } finally {
            setLoading(false);
        }
    };

    const renderStars = (rating: number) => {
        return (
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                        key={star} 
                        size={16} 
                        className={star <= rating ? "fill-yellow-400 text-yellow-400" : "fill-gray-100 text-gray-200"} 
                    />
                ))}
            </div>
        );
    };

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Memuat ulasan...</div>;
    }

    return (
        <div className="max-w-5xl mx-auto pb-12">
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Ulasan Pembeli</h1>
                <p className="text-gray-500">Pantau reputasi usaha Anda dan lihat apa kata pembeli tentang produk Anda.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                <div className="bg-gradient-to-br from-yellow-400 to-orange-400 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-20">
                        <Star size={100} className="fill-white" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-yellow-100 font-bold mb-1">Rata-rata Rating</p>
                        <div className="flex items-end gap-2 mb-4">
                            <h2 className="text-5xl font-black">{stats.average.toFixed(1)}</h2>
                            <span className="text-yellow-100 font-medium mb-1">/ 5.0</span>
                        </div>
                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star 
                                    key={star} 
                                    size={20} 
                                    className={star <= Math.round(stats.average) ? "fill-white text-white" : "fill-yellow-500 text-yellow-500 opacity-50"} 
                                />
                            ))}
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm flex flex-col justify-center">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-12 h-12 bg-gray-100 text-gray-600 rounded-xl flex items-center justify-center">
                            <MessageSquare size={24} />
                        </div>
                        <div>
                            <p className="text-gray-500 font-medium">Total Ulasan</p>
                            <h3 className="text-3xl font-black text-gray-900">{stats.total}</h3>
                        </div>
                    </div>
                </div>
                
                <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm flex flex-col justify-center">
                    <p className="text-gray-500 text-sm font-medium mb-3">Sebaran Rating</p>
                    <div className="space-y-2">
                        {[5, 4, 3, 2, 1].map(star => {
                            const count = reviews.filter(r => r.rating === star).length;
                            const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
                            return (
                                <div key={star} className="flex items-center gap-2 text-sm">
                                    <div className="flex items-center gap-1 w-8 text-gray-600 font-medium">
                                        {star} <Star size={12} className="fill-gray-400 text-gray-400"/>
                                    </div>
                                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${percentage}%` }}></div>
                                    </div>
                                    <div className="w-8 text-right text-gray-500">{count}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900">Daftar Ulasan Terbaru</h3>
                </div>
                
                {reviews.length === 0 ? (
                    <div className="p-16 text-center flex flex-col items-center">
                        <div className="w-20 h-20 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mb-4">
                            <MessageSquare size={40} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Belum Ada Ulasan</h3>
                        <p className="text-gray-500">Pembeli belum memberikan ulasan untuk produk Anda.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {reviews.map((review) => (
                            <div key={review.id} className="p-6 hover:bg-gray-50 transition-colors flex flex-col md:flex-row gap-6">
                                {/* Profil Pembeli & Info */}
                                <div className="md:w-64 shrink-0">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center font-bold text-lg">
                                            {review.buyer?.name?.charAt(0) || <User size={20}/>}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900">{review.buyer?.name || 'Anonim'}</h4>
                                            <p className="text-xs text-gray-400">
                                                {new Date(review.created_at).toLocaleDateString('id-ID', {
                                                    day: 'numeric', month: 'long', year: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    {/* Info Produk yang direview */}
                                    <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-3">
                                        <div className="w-10 h-10 bg-white rounded-lg border border-gray-200 overflow-hidden flex items-center justify-center shrink-0">
                                            {review.order?.product?.image_url ? (
                                                <img src={review.order.product.image_url} alt="Produk" className="w-full h-full object-cover" />
                                            ) : (
                                                <Package size={16} className="text-gray-400" />
                                            )}
                                        </div>
                                        <p className="text-xs font-bold text-gray-700 line-clamp-2">
                                            {review.order?.product?.name || 'Produk dihapus'}
                                        </p>
                                    </div>
                                </div>

                                {/* Konten Review */}
                                <div className="flex-1">
                                    <div className="mb-3">
                                        {renderStars(review.rating)}
                                    </div>
                                    <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                                        {review.comment ? `"${review.comment}"` : <span className="text-gray-400 italic">Pembeli tidak meninggalkan pesan tertulis.</span>}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
