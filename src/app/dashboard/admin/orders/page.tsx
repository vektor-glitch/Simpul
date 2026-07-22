import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { ShoppingCart, Package } from "lucide-react";
import Link from "next/link";
import OrderCancelButton from "./OrderCancelButton";

export default async function AdminOrdersPage() {
    const supabase = await createClient();
    
    // Auth check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // Fetch orders
    const { data: orders, error } = await supabaseAdmin
        .from('orders')
        .select(`
            *,
            buyer:buyer_id(name, buyer_profiles(name)),
            product:product_id(name, users:producer_id(producer_profiles(business_name))),
            pool:pool_id(title)
        `)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching orders:", error);
    }

    const getStatusBadge = (status: string) => {
        const statuses: Record<string, { label: string, classes: string }> = {
            'pending': { label: 'Menunggu', classes: 'bg-gray-100 text-gray-700' },
            'paid': { label: 'Dibayar', classes: 'bg-blue-100 text-blue-700' },
            'processed': { label: 'Diproses', classes: 'bg-orange-100 text-orange-700' },
            'packed': { label: 'Dikemas', classes: 'bg-yellow-100 text-yellow-700' },
            'shipped': { label: 'Dikirim', classes: 'bg-indigo-100 text-indigo-700' },
            'delivered': { label: 'Selesai', classes: 'bg-green-100 text-green-700' },
            'cancelled': { label: 'Batal', classes: 'bg-red-100 text-red-700' },
        };
        const s = statuses[status] || { label: status, classes: 'bg-gray-100 text-gray-700' };
        return <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${s.classes}`}>{s.label}</span>;
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Semua Pesanan</h1>
                    <p className="text-gray-500 mt-1">
                        Pantau riwayat transaksi antara Pembeli dan Produsen.
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-600 font-medium">
                            <tr>
                                <th className="px-6 py-4">Waktu Transaksi</th>
                                <th className="px-6 py-4">Pembeli</th>
                                <th className="px-6 py-4">Produk & Toko</th>
                                <th className="px-6 py-4">Jumlah & Total</th>
                                <th className="px-6 py-4">Metode</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {(!orders || orders.length === 0) ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                                        <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                        <p>Belum ada transaksi di platform ini.</p>
                                    </td>
                                </tr>
                            ) : (
                                orders.map((item) => {
                                    const buyer = Array.isArray(item.buyer) ? item.buyer[0] : item.buyer;
                                    const buyerProfile = Array.isArray(buyer?.buyer_profiles) ? buyer?.buyer_profiles[0] : buyer?.buyer_profiles;
                                    const buyerName = buyerProfile?.name || buyer?.name || 'Anonim';
                                    
                                    const product = Array.isArray(item.product) ? item.product[0] : item.product;
                                    const producerUser = Array.isArray(product?.users) ? product?.users[0] : product?.users;
                                    const producerProfile = Array.isArray(producerUser?.producer_profiles) ? producerUser?.producer_profiles[0] : producerUser?.producer_profiles;
                                    
                                    const pool = Array.isArray(item.pool) ? item.pool[0] : item.pool;

                                    return (
                                        <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                                                {new Date(item.created_at).toLocaleDateString('id-ID', {
                                                    day: '2-digit', month: 'short', year: 'numeric'
                                                })}
                                                <div className="text-[11px] mt-0.5 font-mono">{new Date(item.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit'})}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-gray-900">{buyerName}</div>
                                                <div className="text-[10px] text-gray-400 mt-0.5 font-mono">ID: {item.buyer_id.split('-')[0]}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-900 line-clamp-1">{product?.name || 'Produk Dihapus'}</div>
                                                <div className="text-xs text-brand-600 font-medium flex items-center gap-1 mt-1">
                                                    <Package className="w-3 h-3" /> {producerProfile?.business_name || 'Toko Anonim'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-gray-900">{item.quantity} Unit</div>
                                                <div className="font-bold text-gray-900 mt-1">Rp{(item.total_price || 0).toLocaleString('id-ID')}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {pool ? (
                                                    <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-1 rounded-md border border-indigo-100 block w-fit">
                                                        GROUP BUYING
                                                    </span>
                                                ) : (
                                                    <span className="text-[11px] font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded-md border border-gray-200 block w-fit">
                                                        REGULER
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                {getStatusBadge(item.status)}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {item.status !== 'delivered' && item.status !== 'cancelled' && (
                                                    <OrderCancelButton orderId={item.id} />
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
