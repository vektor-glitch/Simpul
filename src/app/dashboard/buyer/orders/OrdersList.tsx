"use client";

import { useState } from "react";
import { Package, Truck, CheckCircle2, AlertCircle, Clock, Check, MessageSquare } from "lucide-react";
import Image from "next/image";
import { confirmOrderDelivery } from "@/app/actions/buyerActions";
import ReviewModal from "./ReviewModal";
import toast from "react-hot-toast";

export default function OrdersList({ initialOrders }: { initialOrders: any[] }) {
    const [filter, setFilter] = useState("all");
    const [selectedOrderForReview, setSelectedOrderForReview] = useState<any>(null);
    const [processingId, setProcessingId] = useState<string | null>(null);

    const filteredOrders = filter === "all" 
        ? initialOrders 
        : initialOrders.filter(o => o.status === filter);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending': return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700 flex items-center gap-1.5 w-fit"><Clock size={12}/> Menunggu</span>;
            case 'processed': return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 flex items-center gap-1.5 w-fit"><Package size={12}/> Diproses</span>;
            case 'packed': return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700 flex items-center gap-1.5 w-fit"><Package size={12}/> Dikemas</span>;
            case 'shipped': return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-brand-100 text-brand-700 flex items-center gap-1.5 w-fit"><Truck size={12}/> Dikirim</span>;
            case 'delivered': return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 flex items-center gap-1.5 w-fit"><CheckCircle2 size={12}/> Selesai</span>;
            case 'cancelled': return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 flex items-center gap-1.5 w-fit"><AlertCircle size={12}/> Dibatalkan</span>;
            default: return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700">{status}</span>;
        }
    };

    const handleConfirmDelivery = async (orderId: string) => {
        if (!confirm("Apakah Anda yakin telah menerima pesanan ini dengan baik?")) return;
        setProcessingId(orderId);
        
        try {
            const res = await confirmOrderDelivery(orderId);
            if (res.success) {
                toast.success("Pesanan berhasil diselesaikan!");
                // Let the server component revalidate
            } else {
                toast.error(res.error || "Gagal mengkonfirmasi pesanan");
            }
        } catch (error) {
            console.error(error);
            toast.error("Terjadi kesalahan sistem");
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex overflow-x-auto pb-2 gap-2 hide-scrollbar">
                {[
                    { id: 'all', label: 'Semua Pesanan' },
                    { id: 'pending', label: 'Belum Bayar' },
                    { id: 'processed', label: 'Diproses' },
                    { id: 'shipped', label: 'Dikirim' },
                    { id: 'delivered', label: 'Selesai' },
                ].map(f => (
                    <button
                        key={f.id}
                        onClick={() => setFilter(f.id)}
                        className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors ${
                            filter === f.id ? 'bg-brand-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                        }`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {filteredOrders.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center flex flex-col items-center">
                    <Package className="w-16 h-16 text-gray-300 mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Belum Ada Pesanan</h3>
                    <p className="text-gray-500 max-w-sm">Anda belum memiliki pesanan dengan status ini. Yuk jelajahi marketplace kami!</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredOrders.map((order) => {
                        const itemData = order.product || order.pool;
                        const isProduct = !!order.product;
                        const storeName = isProduct 
                            ? (order.product?.users?.producer_profiles?.[0]?.business_name || "Toko Anonim")
                            : "Pool Grosir Simpul";

                        return (
                            <div key={order.id} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row gap-6 items-start">
                                <div className="w-24 h-24 bg-gray-100 rounded-xl flex-shrink-0 relative overflow-hidden border border-gray-200">
                                    {itemData?.image_url ? (
                                        <Image src={itemData.image_url} alt="" fill className="object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                            <Package size={32} />
                                        </div>
                                    )}
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{storeName}</span>
                                        {getStatusBadge(order.status)}
                                    </div>
                                    
                                    <h3 className="text-lg font-bold text-gray-900 leading-tight mb-1 truncate">
                                        {itemData?.name || itemData?.title || 'Item tidak diketahui'}
                                    </h3>
                                    <p className="text-sm text-gray-500 mb-3">
                                        Kuantitas: <span className="font-medium text-gray-900">{order.quantity} {itemData?.unit}</span>
                                    </p>
                                    
                                    <div className="flex items-end justify-between">
                                        <div>
                                            <p className="text-xs text-gray-500 mb-0.5">Total Belanja</p>
                                            <p className="font-extrabold text-brand-600">Rp{(order.total_price || 0).toLocaleString('id-ID')}</p>
                                        </div>
                                    </div>
                                    
                                    {order.status === 'shipped' && order.receipt_number && (
                                        <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-between">
                                            <div>
                                                <p className="text-xs font-bold text-gray-500 uppercase">No. Resi</p>
                                                <p className="font-bold text-gray-900 tracking-wider">{order.receipt_number}</p>
                                            </div>
                                            <button 
                                                onClick={() => handleConfirmDelivery(order.id)}
                                                disabled={processingId === order.id}
                                                className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold rounded-lg shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50"
                                            >
                                                <Check size={16} /> {processingId === order.id ? 'Memproses...' : 'Pesanan Diterima'}
                                            </button>
                                        </div>
                                    )}

                                    {order.status === 'delivered' && (
                                        <div className="mt-4 flex gap-3">
                                            <button 
                                                onClick={() => setSelectedOrderForReview(order)}
                                                className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 text-sm font-bold rounded-lg shadow-sm transition-colors flex items-center gap-2"
                                            >
                                                <MessageSquare size={16} /> Beri Ulasan
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {selectedOrderForReview && (
                <ReviewModal 
                    order={selectedOrderForReview} 
                    onClose={() => setSelectedOrderForReview(null)} 
                    onSuccess={() => setSelectedOrderForReview(null)} 
                />
            )}
        </div>
    );
}
