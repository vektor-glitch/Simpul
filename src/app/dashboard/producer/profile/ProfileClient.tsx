"use client";

import { useState } from "react";
import { Loader2, Save, BadgeCheck, AlertCircle, Building2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "react-hot-toast";
import LocationAutocomplete from "@/components/marketplace/LocationAutocomplete";

export default function ProfileClient({ initialData, userId }: any) {
    const [loading, setLoading] = useState(false);
    const supabase = createClient();

    const [formData, setFormData] = useState({
        business_name: initialData?.business_name || "",
        location: initialData?.location || "",
        rajaongkir_location_id: initialData?.rajaongkir_location_id || "",
        region: initialData?.region || "",
        category: initialData?.category || "Pertanian",
        description: initialData?.description || "",
        owner_name: initialData?.users?.name || "",
        owner_phone: initialData?.users?.phone || ""
    });

    const isVerified = initialData?.users?.verified;

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Update table users (nama pemilik & telepon)
            const { error: userErr } = await supabase
                .from("users")
                .update({ 
                    name: formData.owner_name,
                    phone: formData.owner_phone
                })
                .eq("id", userId);

            if (userErr) throw userErr;

            // Update table producer_profiles
            const { error: profileErr } = await supabase
                .from("producer_profiles")
                .upsert({
                    user_id: userId,
                    business_name: formData.business_name,
                    location: formData.location,
                    rajaongkir_location_id: formData.rajaongkir_location_id,
                    region: formData.region,
                    category: formData.category,
                    description: formData.description
                });

            if (profileErr) throw profileErr;

            toast.success("Profil usaha berhasil diperbarui!");
        } catch (error: any) {
            console.error("Error updating profile:", error);
            toast.error(error.message || "Gagal memperbarui profil");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
            {isVerified ? (
                <div className="bg-green-50 px-6 py-4 border-b border-green-100 flex items-center gap-3">
                    <BadgeCheck className="text-green-600" size={24} />
                    <div>
                        <h3 className="font-bold text-green-900">Akun Terverifikasi</h3>
                        <p className="text-sm text-green-700">Usaha Anda telah diverifikasi oleh Admin Simpul.</p>
                    </div>
                </div>
            ) : (
                <div className="bg-yellow-50 px-6 py-4 border-b border-yellow-100 flex items-center gap-3">
                    <AlertCircle className="text-yellow-600" size={24} />
                    <div>
                        <h3 className="font-bold text-yellow-900">Menunggu Verifikasi</h3>
                        <p className="text-sm text-yellow-700">Admin akan segera memverifikasi kelengkapan profil usaha Anda.</p>
                    </div>
                </div>
            )}

            <div className="p-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                    
                    {/* Data Pemilik */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
                            <span className="w-8 h-8 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-sm">1</span>
                            Data Pemilik Akun
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Nama Lengkap Pemilik</label>
                                <input 
                                    type="text" 
                                    required
                                    value={formData.owner_name}
                                    onChange={(e) => setFormData({...formData, owner_name: e.target.value})}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Nomor Telepon / WhatsApp</label>
                                <input 
                                    type="text" 
                                    required
                                    value={formData.owner_phone}
                                    onChange={(e) => setFormData({...formData, owner_phone: e.target.value})}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                                    placeholder="Contoh: 08123456789"
                                />
                                <p className="text-xs text-gray-500 mt-2">Penting untuk fitur Chat B2B Pembeli.</p>
                            </div>
                        </div>
                    </div>

                    {/* Data Usaha */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
                            <span className="w-8 h-8 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-sm">2</span>
                            Identitas Usaha
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Nama Usaha / Kelompok Tani</label>
                                <input 
                                    type="text" 
                                    required
                                    value={formData.business_name}
                                    onChange={(e) => setFormData({...formData, business_name: e.target.value})}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Kategori Utama</label>
                                <select 
                                    value={formData.category}
                                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                                >
                                    <option value="Pertanian">Pertanian (Sayur, Buah, Palawija)</option>
                                    <option value="Peternakan">Peternakan (Daging, Susu, Telur)</option>
                                    <option value="Kerajinan">Kerajinan Tangan (Anyaman, Tanah Liat)</option>
                                    <option value="Lainnya">Lainnya</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Provinsi (Wilayah Operasi)</label>
                                <input 
                                    type="text" 
                                    required
                                    value={formData.region}
                                    onChange={(e) => setFormData({...formData, region: e.target.value})}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                                    placeholder="Contoh: Kabupaten Sleman"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Pilih Kecamatan/Kota Pengiriman</label>
                                <LocationAutocomplete
                                    value={formData.rajaongkir_location_id}
                                    labelValue={formData.location}
                                    onChange={(id, label) => setFormData({ ...formData, rajaongkir_location_id: id, location: label })}
                                    placeholder="Cari nama kecamatan atau kota..."
                                />
                                <p className="text-xs text-gray-500 mt-2">Pilih dari dropdown agar perhitungan ongkos kirim akurat.</p>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Deskripsi Usaha</label>
                            <textarea 
                                required
                                rows={4}
                                value={formData.description}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 resize-none"
                                placeholder="Ceritakan sejarah, kapasitas produksi, atau keunikan usaha Anda..."
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="flex items-center gap-2 px-8 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold transition-colors disabled:opacity-50"
                        >
                            {loading ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                            Simpan Perubahan
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}
