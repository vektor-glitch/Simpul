"use client";

import { useState } from "react";
import { Save } from "lucide-react";
import { updatePlatformSettings } from "@/app/actions/adminActions";
import toast from "react-hot-toast";

export default function SettingsForm({ initialFee }: { initialFee: number }) {
    const [fee, setFee] = useState<number>(initialFee);
    const [loading, setLoading] = useState(false);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (fee < 0 || fee > 100) {
            toast.error("Persentase harus antara 0 dan 100");
            return;
        }
        
        setLoading(true);
        try {
            const result = await updatePlatformSettings(fee);
            if (result.success) {
                toast.success("Pengaturan berhasil disimpan");
            } else {
                toast.error("Gagal menyimpan pengaturan");
            }
        } catch (error) {
            console.error(error);
            toast.error("Terjadi kesalahan sistem");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSave} className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-4">Biaya Admin (Platform Fee)</h2>
                
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Persentase Potongan (%)</label>
                    <p className="text-sm text-gray-500 mb-3">Besaran potongan yang akan dikenakan pada setiap transaksi sukses.</p>
                    
                    <div className="relative w-48">
                        <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            value={fee}
                            onChange={(e) => setFee(parseFloat(e.target.value))}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                            required
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-gray-500">%</span>
                    </div>
                </div>
            </div>

            <button
                type="submit"
                disabled={loading || fee === initialFee}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <Save size={18} />
                {loading ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
        </form>
    );
}
