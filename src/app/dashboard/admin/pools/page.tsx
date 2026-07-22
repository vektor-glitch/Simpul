import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { Users, Clock, CheckCircle2, Target, AlertCircle } from "lucide-react";
import PoolCancelButton from "./PoolCancelButton";

export default async function AdminPoolsPage() {
    const supabase = await createClient();
    
    // Auth check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // Fetch pools
    const { data: pools, error } = await supabaseAdmin
        .from('pools')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching pools:", error);
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active': return <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-[11px] font-bold border border-blue-200 flex items-center gap-1 w-fit"><Clock size={12}/> Aktif</span>;
            case 'completed': return <span className="px-2.5 py-1 bg-green-50 text-green-700 rounded-full text-[11px] font-bold border border-green-200 flex items-center gap-1 w-fit"><CheckCircle2 size={12}/> Selesai</span>;
            case 'cancelled': return <span className="px-2.5 py-1 bg-red-50 text-red-700 rounded-full text-[11px] font-bold border border-red-200 w-fit">Dibatalkan</span>;
            case 'expired': return <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-[11px] font-bold border border-gray-300 w-fit">Kedaluwarsa</span>;
            default: return <span className="px-2.5 py-1 bg-gray-50 text-gray-600 rounded-full text-[11px] font-bold w-fit">{status}</span>;
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Kelola Pool</h1>
                    <p className="text-gray-500 mt-1">
                        Pantau seluruh kampanye pool *Group Buying* yang berjalan di platform.
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-600 font-medium">
                            <tr>
                                <th className="px-6 py-4">Informasi Pool</th>
                                <th className="px-6 py-4">Kategori & Wilayah</th>
                                <th className="px-6 py-4">Batas Waktu</th>
                                <th className="px-6 py-4">Progres Pengumpulan</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {(!pools || pools.length === 0) ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                                        <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                        <p>Belum ada pool yang terdaftar di sistem.</p>
                                    </td>
                                </tr>
                            ) : (
                                pools.map((item) => {
                                    const progress = Math.min(100, Math.round((item.current_quantity / item.target_quantity) * 100));
                                    return (
                                        <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-gray-900">{item.title}</div>
                                                <div className="text-xs text-gray-500 mt-1 font-mono">ID: {item.id.split('-')[0]}...</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="inline-block px-2.5 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium mb-1">
                                                    {item.category}
                                                </div>
                                                <div className="text-xs text-gray-500">{item.region}</div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">
                                                {new Date(item.end_time).toLocaleDateString('id-ID', {
                                                    day: '2-digit', month: 'short', year: 'numeric',
                                                    hour: '2-digit', minute: '2-digit'
                                                })}
                                            </td>
                                            <td className="px-6 py-4 min-w-[200px]">
                                                <div className="flex justify-between text-xs mb-1.5">
                                                    <span className="font-medium text-gray-900">{item.current_quantity} {item.unit}</span>
                                                    <span className="text-gray-500">Target: {item.target_quantity} {item.unit}</span>
                                                </div>
                                                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                                    <div 
                                                        className={`h-full rounded-full ${progress >= 100 ? 'bg-green-500' : 'bg-brand-500'}`}
                                                        style={{ width: `${progress}%` }}
                                                    ></div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {getStatusBadge(item.status)}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {item.status !== 'completed' && item.status !== 'cancelled' && (
                                                    <PoolCancelButton poolId={item.id} />
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
