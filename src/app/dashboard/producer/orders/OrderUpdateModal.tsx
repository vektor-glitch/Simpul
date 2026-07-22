"use client";

import { useState } from "react";
import { X, Loader2, Package, Truck, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "react-hot-toast";

export default function OrderUpdateModal({ order, onClose, onSuccess }: any) {
    const [loading, setLoading] = useState(false);
    
    // Tentukan status selanjutnya berdasarkan status saat ini
    const getNextStatus = (current: string) => {
        if (current === 'pending') return 'processed';
        if (current === 'processed') return 'packed';
        if (current === 'packed') return 'shipped';
        return current;
    };

    const nextStatus = getNextStatus(order.status);
    const [receiptNumber, setReceiptNumber] = useState(order.receipt_number || "");

    const supabase = createClient();

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setLoading(true);

        if (nextStatus === 'shipped' && !receiptNumber) {
            toast.error("Mohon masukkan nomor resi pengiriman");
            setLoading(false);
            return;
        }

        try {
            const updatePayload: any = { status: nextStatus };
            if (nextStatus === 'shipped') {
                updatePayload.receipt_number = receiptNumber;
            }

            const { data, error } = await supabase
                .from("orders")
                .update(updatePayload)
                .eq("id", order.id)
                .select()
                .single();

            if (error) throw error;

            toast.success("Status pesanan berhasil diperbarui!");
            onSuccess(data);
        } catch (error: any) {
            console.error("Error updating order:", error);
            toast.error(error.message || "Gagal memperbarui pesanan");
        } finally {
            setLoading(false);
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'processed': return "Proses Pesanan";
            case 'packed': return "Selesai Dikemas";
            case 'shipped': return "Kirim Pesanan";
            default: return "Update Status";
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'processed': return <Package size={20} />;
            case 'packed': return <Check size={20} />;
            case 'shipped': return <Truck size={20} />;
            default: return <Check size={20} />;
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl flex flex-col">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">Update Status Pesanan</h2>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>
                
                <div className="p-6">
                    <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
                        <div className="w-12 h-12 bg-white border border-gray-200 rounded-lg flex items-center justify-center shrink-0">
                            {order.product?.image_url ? (
                                <img src={order.product.image_url} alt="" className="w-full h-full object-cover rounded-lg" />
                            ) : (
                                <Package size={20} className="text-gray-400" />
                            )}
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900">{order.product?.name}</h4>
                            <p className="text-sm text-gray-500">Pembeli: {order.buyer?.name}</p>
                        </div>
                    </div>

                    <div className="mb-6 flex justify-between items-center relative before:content-[''] before:absolute before:top-4 before:left-6 before:right-6 before:h-0.5 before:bg-gray-200 before:-z-10">
                        {['pending', 'processed', 'packed', 'shipped'].map((step, index) => {
                            const steps = ['pending', 'processed', 'packed', 'shipped'];
                            const currentIndex = steps.indexOf(order.status);
                            const stepIndex = steps.indexOf(step);
                            
                            const isCompleted = stepIndex <= currentIndex;
                            const isNext = stepIndex === currentIndex + 1;

                            return (
                                <div key={step} className="flex flex-col items-center gap-2">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                                        isCompleted ? 'bg-brand-600 text-white' : 
                                        isNext ? 'bg-brand-100 text-brand-600 ring-2 ring-brand-600 ring-offset-2' : 
                                        'bg-gray-200 text-gray-400'
                                    }`}>
                                        {isCompleted ? <Check size={16} /> : index + 1}
                                    </div>
                                    <span className={`text-[10px] font-bold uppercase ${isCompleted || isNext ? 'text-brand-700' : 'text-gray-400'}`}>
                                        {step}
                                    </span>
                                </div>
                            );
                        })}
                    </div>

                    <form id="updateOrderForm" onSubmit={handleSubmit}>
                        {nextStatus === 'shipped' && (
                            <div className="mb-6">
                                <label className="block text-sm font-bold text-gray-700 mb-2">Nomor Resi Pengiriman</label>
                                <input 
                                    type="text" 
                                    required
                                    value={receiptNumber}
                                    onChange={(e) => setReceiptNumber(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-bold"
                                    placeholder="Masukkan No. Resi JNE/POS/dll"
                                />
                                <p className="text-xs text-gray-500 mt-2">Nomor resi akan dikirimkan ke pembeli agar mereka bisa melacak paket.</p>
                            </div>
                        )}
                        
                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800">
                            Status pesanan saat ini adalah <strong>{order.status.toUpperCase()}</strong>. Klik tombol di bawah untuk mengubahnya menjadi <strong>{nextStatus.toUpperCase()}</strong>.
                        </div>
                    </form>
                </div>
                
                <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 rounded-b-3xl">
                    <button type="button" onClick={onClose} disabled={loading} className="px-6 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-200 transition-colors">
                        Batal
                    </button>
                    <button 
                        type="submit" 
                        form="updateOrderForm" 
                        disabled={loading} 
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-white bg-brand-600 hover:bg-brand-700 transition-colors disabled:opacity-50"
                    >
                        {loading ? <Loader2 size={18} className="animate-spin" /> : getStatusIcon(nextStatus)}
                        {getStatusText(nextStatus)}
                    </button>
                </div>
            </div>
        </div>
    );
}
