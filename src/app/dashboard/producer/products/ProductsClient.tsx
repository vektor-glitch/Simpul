"use client";

import { useState } from "react";
import { Plus, Package, Edit, Trash2, Search, Loader2 } from "lucide-react";
import ProductFormModal from "./ProductFormModal";
import { createClient } from "@/lib/supabase/client";
import { toast } from "react-hot-toast";

export default function ProductsClient({ initialProducts, userId }: { initialProducts: any[], userId: string }) {
    const [products, setProducts] = useState(initialProducts);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [productToEdit, setProductToEdit] = useState<any | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [loadingAction, setLoadingAction] = useState<string | null>(null);
    const supabase = createClient();

    const filteredProducts = products.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleToggleActive = async (id: string, currentStatus: boolean) => {
        setLoadingAction(id);
        const newStatus = !currentStatus;
        const { error } = await supabase
            .from("products")
            .update({ is_active: newStatus })
            .eq("id", id);
        
        if (error) {
            toast.error("Gagal mengubah status produk");
        } else {
            setProducts(prev => prev.map(p => p.id === id ? { ...p, is_active: newStatus } : p));
            toast.success(`Produk berhasil di${newStatus ? 'aktifkan' : 'nonaktifkan'}`);
        }
        setLoadingAction(null);
    };

    const handleSuccessSave = (savedProduct: any, isEdit: boolean) => {
        if (isEdit) {
            setProducts(prev => prev.map(p => p.id === savedProduct.id ? savedProduct : p));
        } else {
            setProducts(prev => [savedProduct, ...prev]);
        }
        setIsModalOpen(false);
        setProductToEdit(null);
    };

    return (
        <div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-gray-900">Kelola Produk</h1>
                    <p className="text-gray-500">Tambahkan atau perbarui katalog produk Anda.</p>
                </div>
                <button 
                    onClick={() => { setProductToEdit(null); setIsModalOpen(true); }}
                    className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 rounded-xl font-bold transition-colors"
                >
                    <Plus size={20} />
                    Tambah Produk Baru
                </button>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input 
                            type="text" 
                            placeholder="Cari nama produk atau kategori..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                        />
                    </div>
                </div>

                {filteredProducts.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Package size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Produk Tidak Ditemukan</h3>
                        <p className="text-gray-500 mb-6">Anda belum memiliki produk atau pencarian tidak cocok.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Produk</th>
                                    <th className="px-6 py-4">Kategori</th>
                                    <th className="px-6 py-4">Harga Jual</th>
                                    <th className="px-6 py-4">Stok</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredProducts.map(product => (
                                    <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 bg-gray-100 rounded-xl overflow-hidden shrink-0">
                                                    {product.image_url ? (
                                                        <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                            <Package size={20} />
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-900">{product.name}</div>
                                                    <div className="text-xs text-gray-500">{product.unit}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {product.category}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-900">Rp{product.price_final.toLocaleString('id-ID')}</div>
                                            <div className="text-xs text-green-600 font-medium">Nett: Rp{product.price_producer.toLocaleString('id-ID')}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold text-gray-700">
                                            {product.stock}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                                product.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                                            }`}>
                                                {product.is_active ? 'Aktif' : 'Nonaktif'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button 
                                                    onClick={() => { setProductToEdit(product); setIsModalOpen(true); }}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Edit Produk"
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                <button 
                                                    onClick={() => handleToggleActive(product.id, product.is_active)}
                                                    disabled={loadingAction === product.id}
                                                    className={`p-2 rounded-lg transition-colors ${
                                                        product.is_active ? 'text-orange-600 hover:bg-orange-50' : 'text-green-600 hover:bg-green-50'
                                                    }`}
                                                    title={product.is_active ? "Nonaktifkan (Sembunyikan)" : "Aktifkan"}
                                                >
                                                    {loadingAction === product.id ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {isModalOpen && (
                <ProductFormModal 
                    onClose={() => setIsModalOpen(false)} 
                    onSuccess={handleSuccessSave}
                    userId={userId}
                    initialData={productToEdit}
                />
            )}
        </div>
    );
}
