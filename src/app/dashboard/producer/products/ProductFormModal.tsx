"use client";

import { useState, useRef } from "react";
import { X, Upload, Loader2, Save } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "react-hot-toast";

export default function ProductFormModal({ onClose, onSuccess, userId, initialData }: any) {
    const isEdit = !!initialData;
    const [loading, setLoading] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState(initialData?.image_url || null);
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const supabase = createClient();

    const [formData, setFormData] = useState({
        name: initialData?.name || "",
        category: initialData?.category || "Pertanian",
        price_final: initialData?.price_final?.toString() || "",
        stock: initialData?.stock?.toString() || "",
        unit: initialData?.unit || "kg",
        description: initialData?.description || ""
    });

    const handleImageChange = (e: any) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePriceChange = (e: any) => {
        // Hanya membolehkan angka
        const val = e.target.value.replace(/[^0-9]/g, '');
        setFormData(prev => ({ ...prev, price_final: val }));
    };

    const calculateFees = (finalPriceStr: string) => {
        const finalPrice = parseInt(finalPriceStr) || 0;
        const platformFee = Math.round(finalPrice * 0.05); // 5% fee
        const producerPrice = finalPrice - platformFee;
        return { finalPrice, platformFee, producerPrice };
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setLoading(true);

        try {
            let imageUrl = imagePreview; // Gunakan preview lama (URL lama) jika tidak ada file baru

            // Upload gambar jika ada file baru
            if (imageFile) {
                const fileExt = imageFile.name.split('.').pop();
                const fileName = `${userId}-${Date.now()}.${fileExt}`;
                const { error: uploadError, data } = await supabase.storage
                    .from('products')
                    .upload(fileName, imageFile);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage.from('products').getPublicUrl(fileName);
                imageUrl = publicUrl;
            }

            const { finalPrice, platformFee, producerPrice } = calculateFees(formData.price_final);

            const payload = {
                producer_id: userId,
                name: formData.name,
                category: formData.category,
                price_final: finalPrice,
                price_producer: producerPrice,
                platform_fee: platformFee,
                stock: parseInt(formData.stock) || 0,
                unit: formData.unit,
                description: formData.description,
                image_url: imageUrl,
                is_active: initialData ? initialData.is_active : true
            };

            let savedData;
            let error;

            if (isEdit) {
                const { data: updated, error: updateErr } = await supabase
                    .from("products")
                    .update(payload)
                    .eq("id", initialData.id)
                    .select()
                    .single();
                savedData = updated;
                error = updateErr;
            } else {
                const { data: inserted, error: insertErr } = await supabase
                    .from("products")
                    .insert([payload])
                    .select()
                    .single();
                savedData = inserted;
                error = insertErr;
            }

            if (error) throw error;

            toast.success(`Produk berhasil di${isEdit ? 'perbarui' : 'tambahkan'}`);
            onSuccess(savedData, isEdit);

        } catch (error: any) {
            console.error("Error saving product:", error);
            toast.error(error.message || "Terjadi kesalahan");
        } finally {
            setLoading(false);
        }
    };

    const { platformFee, producerPrice } = calculateFees(formData.price_final);

    return (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between shrink-0">
                    <h2 className="text-xl font-bold text-gray-900">
                        {isEdit ? "Edit Produk" : "Tambah Produk Baru"}
                    </h2>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1">
                    <form id="productForm" onSubmit={handleSubmit} className="space-y-6">
                        
                        {/* Foto Produk */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Foto Produk</label>
                            <div className="flex items-start gap-6">
                                <div className="w-32 h-32 bg-gray-50 border-2 border-dashed border-gray-300 rounded-2xl overflow-hidden shrink-0 flex items-center justify-center relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                    {imagePreview ? (
                                        <>
                                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-gray-900/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Upload className="text-white" />
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-center text-gray-400">
                                            <Upload size={24} className="mx-auto mb-1" />
                                            <span className="text-xs font-medium">Upload Foto</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 text-sm text-gray-500 pt-2">
                                    <p className="mb-2">Gunakan foto dengan rasio 1:1. Format yang diizinkan: JPG, PNG, WEBP.</p>
                                    <button type="button" onClick={() => fileInputRef.current?.click()} className="text-brand-600 font-bold hover:text-brand-700">Pilih dari Komputer</button>
                                    <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Nama Produk</label>
                                <input 
                                    type="text" 
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                                    placeholder="Contoh: Tomat Ceri Segar"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Kategori</label>
                                <select 
                                    value={formData.category}
                                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                                >
                                    <option value="Pertanian">Pertanian</option>
                                    <option value="Peternakan">Peternakan</option>
                                    <option value="Kerajinan">Kerajinan</option>
                                    <option value="Lainnya">Lainnya</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Harga Jual (ke Pembeli)</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">Rp</span>
                                    <input 
                                        type="text" 
                                        required
                                        value={formData.price_final}
                                        onChange={handlePriceChange}
                                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-bold text-gray-900"
                                        placeholder="0"
                                    />
                                </div>
                                {formData.price_final && (
                                    <div className="mt-2 text-xs p-3 bg-blue-50 rounded-lg text-blue-800">
                                        <div className="flex justify-between mb-1">
                                            <span>Platform Fee (5%)</span>
                                            <span className="text-red-500">- Rp{platformFee.toLocaleString('id-ID')}</span>
                                        </div>
                                        <div className="flex justify-between font-bold border-t border-blue-100 pt-1 mt-1">
                                            <span>Pendapatan Bersih Anda</span>
                                            <span className="text-green-600">Rp{producerPrice.toLocaleString('id-ID')}</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Stok Tersedia</label>
                                    <input 
                                        type="number" 
                                        required
                                        min="0"
                                        value={formData.stock}
                                        onChange={(e) => setFormData({...formData, stock: e.target.value})}
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                                        placeholder="0"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Satuan (Unit)</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={formData.unit}
                                        onChange={(e) => setFormData({...formData, unit: e.target.value})}
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                                        placeholder="kg, ikat, pcs"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Deskripsi Produk</label>
                            <textarea 
                                required
                                rows={4}
                                value={formData.description}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all min-h-[120px]"
                                placeholder="Jelaskan kualitas, cara budidaya, atau keunggulan produk Anda..."
                            ></textarea>
                        </div>
                    </form>
                </div>

                <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 shrink-0 rounded-b-3xl">
                    <button 
                        type="button" 
                        onClick={onClose}
                        disabled={loading}
                        className="px-6 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-200 transition-colors"
                    >
                        Batal
                    </button>
                    <button 
                        form="productForm"
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-white bg-brand-600 hover:bg-brand-700 transition-colors disabled:opacity-50"
                    >
                        {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                        Simpan Produk
                    </button>
                </div>
            </div>
        </div>
    );
}
