"use client";

import { useState } from "react";
import { X, Star, Loader2, MessageSquare } from "lucide-react";
import { submitReview } from "@/app/actions/buyerActions";
import { toast } from "react-hot-toast";

export default function ReviewModal({ order, onClose, onSuccess }: any) {
    const [loading, setLoading] = useState(false);
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [comment, setComment] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (rating === 0) {
            toast.error("Silakan berikan rating bintang terlebih dahulu.");
            return;
        }

        setLoading(true);

        try {
            const result = await submitReview(order.id, rating, comment);
            if (result.success) {
                toast.success("Terima kasih atas ulasannya!");
                onSuccess();
            } else {
                toast.error(result.error || "Gagal mengirim ulasan.");
            }
        } catch (error) {
            console.error(error);
            toast.error("Terjadi kesalahan sistem.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl flex flex-col overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <MessageSquare className="text-brand-500" size={24} /> 
                        Beri Ulasan
                    </h2>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>
                
                <div className="p-6 overflow-y-auto">
                    <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
                        <div className="w-12 h-12 bg-white border border-gray-200 rounded-lg flex items-center justify-center shrink-0">
                            {order.product?.image_url ? (
                                <img src={order.product.image_url} alt="" className="w-full h-full object-cover rounded-lg" />
                            ) : (
                                <div className="text-xs text-gray-400">Pool</div>
                            )}
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900 line-clamp-1">{order.product?.name || order.pool?.title}</h4>
                            <p className="text-sm text-gray-500">Kuantitas: {order.quantity}</p>
                        </div>
                    </div>

                    <form id="reviewForm" onSubmit={handleSubmit}>
                        <div className="mb-6 flex flex-col items-center">
                            <label className="block text-sm font-bold text-gray-700 mb-2">Bagaimana kualitas pesanan ini?</label>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        type="button"
                                        key={star}
                                        className={`transition-transform hover:scale-110 ${star <= (hover || rating) ? 'text-yellow-400' : 'text-gray-200'}`}
                                        onClick={() => setRating(star)}
                                        onMouseEnter={() => setHover(star)}
                                        onMouseLeave={() => setHover(rating)}
                                    >
                                        <Star size={40} className="fill-current" />
                                    </button>
                                ))}
                            </div>
                            <p className="text-xs text-gray-500 mt-2 font-medium">Klik bintang untuk memberikan nilai</p>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Komentar & Pengalaman Anda</label>
                            <textarea 
                                required
                                rows={4}
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                                placeholder="Ceritakan kepuasan Anda berbelanja produk ini..."
                            ></textarea>
                        </div>
                    </form>
                </div>
                
                <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 rounded-b-3xl mt-auto">
                    <button type="button" onClick={onClose} disabled={loading} className="px-6 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-200 transition-colors">
                        Nanti Saja
                    </button>
                    <button 
                        type="submit" 
                        form="reviewForm" 
                        disabled={loading} 
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-white bg-brand-600 hover:bg-brand-700 transition-colors disabled:opacity-50"
                    >
                        {loading ? <Loader2 size={18} className="animate-spin" /> : <Star size={18} />}
                        Kirim Ulasan
                    </button>
                </div>
            </div>
        </div>
    );
}
