"use client";

import { useState } from "react";
import { X, Loader2, Package } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "react-hot-toast";
import { updatePoolProgress } from "@/app/actions/poolActions";

export default function JoinPoolModal({ pool, userId, onClose, onSuccess }: any) {
    const [loading, setLoading] = useState(false);
    const [quantity, setQuantity] = useState("");
    const supabase = createClient();

    const sisaKebutuhan = pool.target_quantity - pool.collected_quantity;

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setLoading(true);

        const qty = parseInt(quantity);
        if (qty > sisaKebutuhan) {
            toast.error(`Kuantitas melebihi sisa kebutuhan (${sisaKebutuhan} ${pool.unit})`);
            setLoading(false);
            return;
        }

        try {
            // Insert kontribusi
            const { data: contrib, error: contribErr } = await supabase
                .from("pool_contributions")
                .insert([{
                    pool_id: pool.id,
                    producer_id: userId,
                    quantity_committed: qty
                }])
                .select()
                .single();

            if (contribErr) throw contribErr;

            // 2. Update kuantitas terkumpul di pool menggunakan Server Action
            // Ini diperlukan karena secara RLS, hanya admin yang boleh melakukan update langsung pada tabel pools
            const updatedPool = await updatePoolProgress(pool.id, qty);

            toast.success("Berhasil bergabung ke Pool!");
            onSuccess(contrib, updatedPool);
        } catch (error: any) {
            console.error("Error joining pool:", error);
            if (error.code === '23505') {
                toast.error("Anda sudah bergabung ke Pool ini sebelumnya");
            } else {
                toast.error(error.message || "Gagal bergabung ke pool");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl flex flex-col">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">Gabung Pool</h2>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>
                
                <div className="p-6">
                    <div className="mb-6">
                        <h3 className="font-bold text-gray-900 text-lg mb-1">{pool.title}</h3>
                        <p className="text-sm text-gray-500">Harga Jual: <span className="font-bold text-gray-700">Rp{pool.price.toLocaleString('id-ID')} / {pool.unit}</span></p>
                    </div>

                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-blue-800">Sisa Kebutuhan:</span>
                            <span className="font-bold text-blue-900">{sisaKebutuhan} {pool.unit}</span>
                        </div>
                        <div className="w-full bg-blue-200 rounded-full h-1.5">
                            <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${(pool.collected_quantity / pool.target_quantity) * 100}%` }}></div>
                        </div>
                    </div>

                    <form id="joinPoolForm" onSubmit={handleSubmit}>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Berapa banyak yang akan Anda suplai?</label>
                        <div className="relative">
                            <Package className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input 
                                type="number" 
                                required min="1" max={sisaKebutuhan}
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                className="w-full pl-10 pr-16 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-bold"
                                placeholder="0"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">{pool.unit}</span>
                        </div>
                        
                        {quantity && (
                            <p className="mt-3 text-sm text-green-600 font-medium text-center bg-green-50 py-2 rounded-lg">
                                Estimasi Pendapatan: <strong>Rp{(parseInt(quantity) * pool.price).toLocaleString('id-ID')}</strong>
                            </p>
                        )}
                    </form>
                </div>
                
                <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 rounded-b-3xl">
                    <button type="button" onClick={onClose} disabled={loading} className="px-6 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-200">
                        Batal
                    </button>
                    <button type="submit" form="joinPoolForm" disabled={loading} className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-white bg-gray-900 hover:bg-black disabled:opacity-50">
                        {loading && <Loader2 size={18} className="animate-spin" />}
                        Konfirmasi Suplai
                    </button>
                </div>
            </div>
        </div>
    );
}
