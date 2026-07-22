import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { Landmark, Clock, CheckCircle2, XCircle } from "lucide-react";
import WithdrawalActions from "./WithdrawalActions";

export default async function WithdrawalsPage() {
    // Kita tetap butuh session user (admin) untuk keamanan, tapi query pakai admin
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return null;

    // Fetch withdrawals from the database menggunakan supabaseAdmin
    const { data: withdrawals, error } = await supabaseAdmin
        .from('withdrawals')
        .select(`
            *,
            users:user_id (
                name,
                phone,
                producer_profiles(business_name)
            )
        `)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching withdrawals:", error);
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending': return <span className="px-2.5 py-1 bg-orange-100 text-orange-800 rounded-full text-[11px] font-bold flex items-center gap-1 w-fit"><Clock size={12}/> Menunggu</span>;
            case 'processing': return <span className="px-2.5 py-1 bg-blue-100 text-blue-800 rounded-full text-[11px] font-bold flex items-center gap-1 w-fit"><Clock size={12}/> Diproses</span>;
            case 'completed': return <span className="px-2.5 py-1 bg-green-100 text-green-800 rounded-full text-[11px] font-bold flex items-center gap-1 w-fit"><CheckCircle2 size={12}/> Selesai</span>;
            case 'rejected': return <span className="px-2.5 py-1 bg-red-100 text-red-800 rounded-full text-[11px] font-bold flex items-center gap-1 w-fit"><XCircle size={12}/> Ditolak</span>;
            default: return null;
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Pencairan Dana</h1>
                    <p className="text-gray-500 mt-1">
                        Tinjau dan setujui permintaan pencairan dana dari Produsen.
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-600 font-medium">
                            <tr>
                                <th className="px-6 py-4">Tanggal & Waktu</th>
                                <th className="px-6 py-4">Produsen</th>
                                <th className="px-6 py-4">Nominal</th>
                                <th className="px-6 py-4">Informasi Rekening</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {(!withdrawals || withdrawals.length === 0) ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                                        <Landmark className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                        <p>Belum ada riwayat pengajuan pencairan dana.</p>
                                    </td>
                                </tr>
                            ) : (
                                withdrawals.map((item) => {
                                    const user = Array.isArray(item.users) ? item.users[0] : item.users;
                                    const profile = Array.isArray(user?.producer_profiles) ? user?.producer_profiles[0] : user?.producer_profiles;

                                    return (
                                        <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                                                {new Date(item.created_at).toLocaleDateString('id-ID', {
                                                    day: '2-digit', month: 'short', year: 'numeric'
                                                })}
                                                <div className="text-[11px] mt-0.5">{new Date(item.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit'})}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-gray-900">{profile?.business_name || 'Anonim'}</div>
                                                <div className="text-xs text-gray-500 mt-0.5">{user?.name}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-black text-gray-900 text-base">
                                                    Rp{item.amount.toLocaleString('id-ID')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-gray-900">{item.bank_name}</div>
                                                <div className="text-xs text-gray-500 font-mono mt-0.5">{item.account_number}</div>
                                                <div className="text-xs text-gray-500 mt-0.5">a.n {item.account_name}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {getStatusBadge(item.status)}
                                            </td>
                                            <td className="px-6 py-4">
                                                {item.status === 'pending' ? (
                                                    <WithdrawalActions withdrawalId={item.id} />
                                                ) : (
                                                    <div className="text-right text-xs text-gray-400 italic">
                                                        Telah diproses
                                                    </div>
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
