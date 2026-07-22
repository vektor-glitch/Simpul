import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { Star, MessageSquare } from "lucide-react";
import ReviewDeleteButton from "./ReviewDeleteButton";

export default async function AdminReviewsPage() {
    const supabase = await createClient();
    
    // Auth check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // Fetch reviews
    const { data: reviews, error } = await supabaseAdmin
        .from('reviews')
        .select(`
            *,
            buyer:users!reviews_buyer_id_fkey(name),
            producer:users!reviews_producer_id_fkey(name, producer_profiles(business_name)),
            order:orders(product:products(name))
        `)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching reviews:", error);
    }

    const renderStars = (rating: number) => {
        return (
            <div className="flex gap-0.5 text-yellow-400">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                        key={star} 
                        size={14} 
                        fill={star <= rating ? "currentColor" : "none"} 
                        className={star <= rating ? "text-yellow-400" : "text-gray-200"}
                    />
                ))}
            </div>
        );
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Ulasan & Rating</h1>
                    <p className="text-gray-500 mt-1">
                        Pantau *feedback* dan tingkat kepuasan pelanggan di platform.
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-600 font-medium">
                            <tr>
                                <th className="px-6 py-4">Waktu Ulasan</th>
                                <th className="px-6 py-4">Pembeli</th>
                                <th className="px-6 py-4">Rating & Komentar</th>
                                <th className="px-6 py-4">Toko & Produk</th>
                                <th className="px-6 py-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {(!reviews || reviews.length === 0) ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                                        <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                        <p>Belum ada ulasan yang diberikan oleh pembeli.</p>
                                    </td>
                                </tr>
                            ) : (
                                reviews.map((item) => {
                                    const buyer = Array.isArray(item.buyer) ? item.buyer[0] : item.buyer;
                                    const buyerName = buyer?.name || 'Anonim';
                                    
                                    const producer = Array.isArray(item.producer) ? item.producer[0] : item.producer;
                                    const producerProfile = Array.isArray(producer?.producer_profiles) ? producer?.producer_profiles[0] : producer?.producer_profiles;
                                    const storeName = producerProfile?.business_name || 'Toko Anonim';

                                    const order = Array.isArray(item.order) ? item.order[0] : item.order;
                                    const product = Array.isArray(order?.product) ? order?.product[0] : order?.product;
                                    const productName = product?.name || 'Produk tidak diketahui';

                                    return (
                                        <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 text-gray-500 whitespace-nowrap align-top">
                                                {new Date(item.created_at).toLocaleDateString('id-ID', {
                                                    day: '2-digit', month: 'short', year: 'numeric'
                                                })}
                                            </td>
                                            <td className="px-6 py-4 align-top">
                                                <div className="font-bold text-gray-900">{buyerName}</div>
                                            </td>
                                            <td className="px-6 py-4 min-w-[250px] align-top">
                                                <div className="mb-2">{renderStars(item.rating)}</div>
                                                <p className="text-gray-700 leading-relaxed italic">"{item.comment}"</p>
                                            </td>
                                            <td className="px-6 py-4 align-top">
                                                <div className="font-bold text-gray-900">{storeName}</div>
                                                <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">{productName}</div>
                                            </td>
                                            <td className="px-6 py-4 align-top text-right">
                                                <ReviewDeleteButton reviewId={item.id} />
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
