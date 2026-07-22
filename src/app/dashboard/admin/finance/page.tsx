import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { Wallet, TrendingUp, DollarSign, Activity } from "lucide-react";
import Link from "next/link";

export default async function AdminFinancePage() {
    const supabase = await createClient();
    
    // Auth check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // Ambil data pesanan yang sudah selesai ('delivered')
    const { data: completedOrders, error } = await supabaseAdmin
        .from('orders')
        .select('total_price, admin_fee, created_at')
        .eq('status', 'delivered')
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching finance data:", error);
    }

    const orders = completedOrders || [];
    
    // Hitung GMV (Gross Merchandise Value) = total perputaran uang kotor
    const gmv = orders.reduce((acc, curr) => acc + (curr.total_price || 0), 0);
    
    // Hitung Total Pendapatan Platform = total biaya admin
    const totalRevenue = orders.reduce((acc, curr) => acc + (curr.admin_fee || 0), 0);

    // Ambil beberapa pesanan terakhir untuk riwayat
    const recentTransactions = orders.slice(0, 10);

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Laporan Keuangan</h1>
                    <p className="text-gray-500 mt-1">
                        Pantau perputaran uang dan pendapatan platform Simpul.
                    </p>
                </div>
                <Link 
                    href="/dashboard/admin/settings"
                    className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-50 transition-colors"
                >
                    Ubah Biaya Admin
                </Link>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-brand-500 to-brand-700 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
                    <div className="absolute right-0 top-0 opacity-10 transform translate-x-4 -translate-y-4">
                        <TrendingUp size={120} />
                    </div>
                    <div className="flex items-center gap-2 text-brand-100 font-medium mb-4">
                        <Activity size={18} /> Total GMV Keseluruhan
                    </div>
                    <div className="text-4xl font-extrabold tracking-tight">
                        Rp{gmv.toLocaleString('id-ID')}
                    </div>
                    <div className="text-brand-100 text-sm mt-2">
                        Perputaran uang dari {orders.length} pesanan selesai
                    </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm relative overflow-hidden">
                    <div className="absolute right-0 top-0 opacity-[0.03] text-gray-900 transform translate-x-4 -translate-y-4">
                        <DollarSign size={120} />
                    </div>
                    <div className="flex items-center gap-2 text-gray-500 font-medium mb-4">
                        <Wallet size={18} /> Total Pendapatan Bersih (Fee Admin)
                    </div>
                    <div className="text-4xl font-extrabold tracking-tight text-gray-900">
                        Rp{totalRevenue.toLocaleString('id-ID')}
                    </div>
                    <div className="text-gray-500 text-sm mt-2">
                        Akumulasi potongan admin dari transaksi sukses
                    </div>
                </div>
            </div>

            {/* Riwayat Transaksi Selesai */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm mt-8">
                <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="font-bold text-gray-900">Riwayat Transaksi Sukses Terakhir</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-600 font-medium">
                            <tr>
                                <th className="px-6 py-4">Waktu Transaksi</th>
                                <th className="px-6 py-4">Nilai Transaksi (GMV)</th>
                                <th className="px-6 py-4">Potongan Admin</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {recentTransactions.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="px-6 py-12 text-center text-gray-400">
                                        <p>Belum ada transaksi sukses yang menghasilkan pendapatan.</p>
                                    </td>
                                </tr>
                            ) : (
                                recentTransactions.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                                            {new Date(item.created_at).toLocaleDateString('id-ID', {
                                                day: '2-digit', month: 'long', year: 'numeric',
                                                hour: '2-digit', minute: '2-digit'
                                            })}
                                        </td>
                                        <td className="px-6 py-4 font-bold text-gray-900">
                                            Rp{(item.total_price || 0).toLocaleString('id-ID')}
                                        </td>
                                        <td className="px-6 py-4 font-bold text-brand-600">
                                            + Rp{(item.admin_fee || 0).toLocaleString('id-ID')}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
