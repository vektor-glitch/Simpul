"use client";

import { useState } from "react";
import { X, Loader2, Target, Calendar } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "react-hot-toast";

export default function CreatePoolModal({ onClose, onSuccess, userId, userRegion, userCategory }: any) {
    const [loading, setLoading] = useState(false);
    const supabase = createClient();

    const [formData, setFormData] = useState({
        title: "",
        target_quantity: "",
        unit: "kg",
        price: "",
        deadline: ""
    });

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                category: userCategory,
                region: userRegion,
                title: formData.title,
                target_quantity: parseInt(formData.target_quantity),
                price: parseFloat(formData.price.replace(/[^0-9]/g, '')),
                unit: formData.unit,
                deadline: formData.deadline,
                status: 'open',
                collected_quantity: 0,
                sold_quantity: 0
            };

            const { data, error } = await supabase
                .from("pools")
                .insert([payload])
                .select()
                .single();

            if (error) throw error;

            toast.success("Pool baru berhasil dibuat!");
            onSuccess(data);
        } catch (error: any) {
            console.error("Error creating pool:", error);
            toast.error(error.message || "Gagal membuat pool");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between shrink-0">
                    <h2 className="text-xl font-bold text-gray-900">Buat Pool Patungan Baru</h2>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>
                
                <div className="p-6 overflow-y-auto">
                    <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-xl text-sm text-blue-800">
                        Pool ini akan terbuka untuk semua produsen <strong>{userCategory}</strong> di wilayah <strong>{userRegion}</strong>.
                    </div>

                    <form id="createPoolForm" onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Judul Proyek Pool</label>
                            <input 
                                type="text" 
                                required
                                value={formData.title}
                                onChange={(e) => setFormData({...formData, title: e.target.value})}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                                placeholder="Contoh: Pengiriman Tomat Ceri ke Jakarta 5 Ton"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Target Kuantitas</label>
                                <div className="relative">
                                    <Target className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input 
                                        type="number" 
                                        required min="1"
                                        value={formData.target_quantity}
                                        onChange={(e) => setFormData({...formData, target_quantity: e.target.value})}
                                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                                        placeholder="5000"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Satuan (Unit)</label>
                                <input 
                                    type="text" 
                                    required
                                    value={formData.unit}
                                    onChange={(e) => setFormData({...formData, unit: e.target.value})}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                                    placeholder="kg"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Harga Jual per {formData.unit || 'Unit'}</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">Rp</span>
                                <input 
                                    type="text" 
                                    required
                                    value={formData.price}
                                    onChange={(e) => setFormData({...formData, price: e.target.value.replace(/[^0-9]/g, '')})}
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-bold"
                                    placeholder="0"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Batas Waktu Pengumpulan (Deadline)</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input 
                                    type="date" 
                                    required
                                    min={new Date().toISOString().split('T')[0]}
                                    value={formData.deadline}
                                    onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                                />
                            </div>
                        </div>
                    </form>
                </div>
                
                <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 shrink-0 rounded-b-3xl">
                    <button type="button" onClick={onClose} disabled={loading} className="px-6 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-200">
                        Batal
                    </button>
                    <button type="submit" form="createPoolForm" disabled={loading} className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-50">
                        {loading && <Loader2 size={18} className="animate-spin" />}
                        Publikasikan Pool
                    </button>
                </div>
            </div>
        </div>
    );
}
