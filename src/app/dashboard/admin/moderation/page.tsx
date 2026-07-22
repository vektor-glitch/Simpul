import { createClient } from "@/lib/supabase/server";
import { PackageSearch, AlertTriangle, Info } from "lucide-react";
import ModerationToggle from "./ModerationToggle";
import Image from "next/image";

export default async function ModerationPage() {
    const supabase = await createClient();

    // Mengambil semua produk beserta data produsennya
    const { data: products, error } = await supabase
        .from('products')
        .select(`
            *,
            users:producer_id (
                producer_profiles ( business_name )
            )
        `)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching products:", error);
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Moderasi Produk</h1>
                    <p className="text-gray-500 mt-1">
                        Pantau dan kelola katalog produk. Sembunyikan produk yang melanggar aturan.
                    </p>
                </div>
            </div>

            {(!products || products.length === 0) ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
                    <PackageSearch className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-gray-900">Belum Ada Produk</h3>
                    <p className="text-gray-500 mt-1">Produsen belum mengunggah produk apapun ke platform.</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-gray-600 font-medium">
                                <tr>
                                    <th className="px-6 py-4">Produk</th>
                                    <th className="px-6 py-4">Kategori</th>
                                    <th className="px-6 py-4">Harga Final</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {products.map((product) => {
                                    // Handle array structure from Supabase join
                                    const producerUser = Array.isArray(product.users) ? product.users[0] : product.users;
                                    const profile = producerUser?.producer_profiles;
                                    const businessName = Array.isArray(profile) ? profile[0]?.business_name : profile?.business_name;

                                    return (
                                        <tr key={product.id} className={`hover:bg-gray-50 transition-colors ${!product.is_active ? 'bg-red-50/30' : ''}`}>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    {product.image_url ? (
                                                        <div className="w-12 h-12 rounded-lg relative overflow-hidden bg-gray-100 flex-shrink-0">
                                                            <Image 
                                                                src={product.image_url} 
                                                                alt={product.name}
                                                                fill
                                                                className="object-cover"
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                                                            <PackageSearch className="w-5 h-5 text-gray-400" />
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="font-bold text-gray-900">{product.name}</p>
                                                        <p className="text-xs text-gray-500">{businessName || 'Produsen Tidak Diketahui'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                    {product.category}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="font-medium text-gray-900">
                                                    Rp{product.price_final?.toLocaleString('id-ID')}
                                                </p>
                                                <p className="text-xs text-gray-500">/{product.unit}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                {product.is_active ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                                        Aktif Publik
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                                                        <AlertTriangle className="w-3.5 h-3.5" />
                                                        Disembunyikan
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end">
                                                    <ModerationToggle productId={product.id} isActive={product.is_active} />
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
