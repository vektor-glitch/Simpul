import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import Link from "next/link";
import { ArrowUpRight, CheckCircle2, XCircle, AlertCircle, Package, UserPlus, Landmark } from "lucide-react";
import Image from "next/image";

export default async function AdminOverviewPage() {
    const supabase = await createClient();

    // Ambil data statistik dasar
    const { count: verifiedProducers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'producer')
        .eq('verified', true);
        
    const { count: pendingProducers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'producer')
        .eq('verified', false);
        
    const { count: activePools } = await supabase
        .from('pools')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');
        
    const { count: totalOrders } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true });

    // Ambil 3 pendaftar terbaru yang belum diverifikasi
    const { data: recentPendingProducers } = await supabase
        .from('users')
        .select(`
            id,
            name,
            created_at,
            producer_profiles(business_name, location, category)
        `)
        .eq('role', 'producer')
        .eq('verified', false)
        .order('created_at', { ascending: false })
        .limit(3);

    // Ambil 4 produk terbaru
    const { data: recentProducts } = await supabase
        .from('products')
        .select(`
            id, name, is_active, image_url, created_at,
            users:producer_id (
                name,
                producer_profiles(business_name)
            )
        `)
        .order('created_at', { ascending: false })
        .limit(4);

    // Ambil 3 pendaftaran produsen terbaru (untuk aktivitas)
    const { data: recentAllProducers } = await supabase
        .from('users')
        .select(`id, name, created_at, producer_profiles(business_name)`)
        .eq('role', 'producer')
        .order('created_at', { ascending: false })
        .limit(3);

    // Ambil 3 withdrawal terbaru (harus pakai supabaseAdmin)
    const { data: recentWithdrawals } = await supabaseAdmin
        .from('withdrawals')
        .select(`id, amount, status, created_at, users:user_id(producer_profiles(business_name))`)
        .order('created_at', { ascending: false })
        .limit(3);

    // Susun aktivitas terbaru
    const activities: any[] = [];
    
    if (recentAllProducers) {
        recentAllProducers.forEach((u: any) => {
            const profile = Array.isArray(u.producer_profiles) ? u.producer_profiles[0] : u.producer_profiles;
            activities.push({
                id: `u-${u.id}`,
                type: 'user',
                title: `Produsen baru mendaftar`,
                desc: `${profile?.business_name || u.name} bergabung`,
                time: new Date(u.created_at),
                icon: UserPlus,
                color: 'bg-blue-50 text-blue-600'
            });
        });
    }

    if (recentProducts) {
        recentProducts.forEach((p: any) => {
            const profile = Array.isArray(p.users?.producer_profiles) ? p.users?.producer_profiles[0] : p.users?.producer_profiles;
            activities.push({
                id: `p-${p.id}`,
                type: 'product',
                title: `Produk baru ditambahkan`,
                desc: `${p.name} oleh ${profile?.business_name || 'Anonim'}`,
                time: new Date(p.created_at),
                icon: Package,
                color: 'bg-green-50 text-green-600'
            });
        });
    }

    if (recentWithdrawals) {
        recentWithdrawals.forEach((w: any) => {
            const user = Array.isArray(w.users) ? w.users[0] : w.users;
            const profile = Array.isArray(user?.producer_profiles) ? user?.producer_profiles[0] : user?.producer_profiles;
            activities.push({
                id: `w-${w.id}`,
                type: 'withdrawal',
                title: `Pengajuan pencairan dana`,
                desc: `Rp${w.amount.toLocaleString('id-ID')} dari ${profile?.business_name || 'Anonim'}`,
                time: new Date(w.created_at),
                icon: Landmark,
                color: 'bg-orange-50 text-orange-600'
            });
        });
    }

    // Urutkan aktivitas dari yang terbaru
    activities.sort((a, b) => b.time.getTime() - a.time.getTime());
    const topActivities = activities.slice(0, 4); // Ambil 4 teratas

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            {/* TOPBAR */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Overview</h1>
                    <p className="text-sm text-gray-500 mt-1">Ringkasan aktivitas platform Simpul hari ini</p>
                </div>
                <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-full py-1.5 px-1.5 pr-4 shadow-sm">
                    <div className="w-7 h-7 rounded-full bg-green-600 text-white flex items-center justify-center text-[10px] font-bold">
                        AD
                    </div>
                    <span className="text-sm font-medium text-gray-700">Admin Simpul</span>
                </div>
            </div>

            {/* STAT CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
                    <div className="text-[13px] text-gray-500 mb-1.5 font-medium">Total Produsen Terverifikasi</div>
                    <div className="text-3xl font-bold text-gray-900">{verifiedProducers || 0}</div>
                    <div className="text-[12px] text-green-700 mt-1 font-medium flex items-center gap-1">
                        <ArrowUpRight className="w-3 h-3" /> Stabil
                    </div>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
                    <div className="text-[13px] text-gray-500 mb-1.5 font-medium">Menunggu Verifikasi</div>
                    <div className="text-3xl font-bold text-gray-900">{pendingProducers || 0}</div>
                    <div className="text-[12px] text-orange-600 mt-1 font-medium flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> Perlu ditinjau
                    </div>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
                    <div className="text-[13px] text-gray-500 mb-1.5 font-medium">Total Transaksi (Unit)</div>
                    <div className="text-3xl font-bold text-gray-900">{totalOrders || 0}</div>
                    <div className="text-[12px] text-green-700 mt-1 font-medium flex items-center gap-1">
                        <ArrowUpRight className="w-3 h-3" /> Tumbuh
                    </div>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
                    <div className="text-[13px] text-gray-500 mb-1.5 font-medium">Pool Aktif</div>
                    <div className="text-3xl font-bold text-gray-900">{activePools || 0}</div>
                    <div className="text-[12px] text-green-700 mt-1 font-medium flex items-center gap-1">
                        <ArrowUpRight className="w-3 h-3" /> Mendekati target
                    </div>
                </div>
            </div>

            {/* TWO COLUMNS: VERIFIKASI & AKTIVITAS */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                
                {/* Tabel Verifikasi (Lebih Lebar) */}
                <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                        <h2 className="font-bold text-gray-900">Menunggu Verifikasi Produsen</h2>
                        <Link href="/dashboard/admin/verifications" className="text-xs font-medium text-green-700 hover:text-green-800">Lihat semua →</Link>
                    </div>
                    
                    <div className="flex-1 overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50/50">
                                <tr>
                                    <th className="px-5 py-3 font-medium text-gray-500 border-b border-gray-100">Produsen</th>
                                    <th className="px-5 py-3 font-medium text-gray-500 border-b border-gray-100">Kategori</th>
                                    <th className="px-5 py-3 font-medium text-gray-500 border-b border-gray-100">Wilayah</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {recentPendingProducers && recentPendingProducers.length > 0 ? (
                                    recentPendingProducers.map((user) => {
                                        const profile = Array.isArray(user.producer_profiles) ? user.producer_profiles[0] : user.producer_profiles;
                                        return (
                                            <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-5 py-3.5">
                                                    <div className="font-semibold text-gray-900">{profile?.business_name || user.name || 'Tanpa Nama'}</div>
                                                    <div className="text-[11px] text-gray-500 mt-0.5">Daftar: {new Date(user.created_at).toLocaleDateString('id-ID')}</div>
                                                </td>
                                                <td className="px-5 py-3.5 text-gray-700">{profile?.category || '-'}</td>
                                                <td className="px-5 py-3.5 text-gray-700">{profile?.location || '-'}</td>
                                            </tr>
                                        )
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={3} className="px-5 py-8 text-center text-gray-400">Tidak ada pengajuan verifikasi baru.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Aktivitas Terbaru (Lebih Sempit) */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col">
                    <div className="p-5 border-b border-gray-100">
                        <h2 className="font-bold text-gray-900">Aktivitas Terbaru</h2>
                    </div>
                    <div className="p-5 flex-1 flex flex-col justify-center space-y-5">
                        {topActivities.length > 0 ? (
                            topActivities.map((act) => {
                                const Icon = act.icon;
                                // Hitung selisih waktu
                                const diffMs = Date.now() - act.time.getTime();
                                const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
                                const diffMins = Math.floor(diffMs / (1000 * 60));
                                const timeStr = diffHrs > 24 
                                    ? `${Math.floor(diffHrs / 24)} hari lalu` 
                                    : diffHrs > 0 ? `${diffHrs} jam lalu` : diffMins > 0 ? `${diffMins} mnt lalu` : 'Baru saja';
                                    
                                return (
                                    <div key={act.id} className="flex gap-3 items-start">
                                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${act.color}`}>
                                            <Icon size={18} />
                                        </div>
                                        <div>
                                            <p className="text-[13px] text-gray-900 font-bold leading-snug">{act.title}</p>
                                            <p className="text-[12px] text-gray-500 mt-0.5 leading-snug">{act.desc}</p>
                                            <p className="text-[10px] text-gray-400 mt-1">{timeStr}</p>
                                        </div>
                                    </div>
                                )
                            })
                        ) : (
                            <div className="text-center text-gray-400 text-sm">Belum ada aktivitas hari ini.</div>
                        )}
                    </div>
                </div>
            </div>

            {/* MODERASI PRODUK */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="font-bold text-gray-900">Produk Terbaru <span className="font-normal text-gray-400 text-sm ml-2">(Moderasi)</span></h2>
                    <Link href="/dashboard/admin/moderation" className="text-xs font-medium text-green-700 hover:text-green-800">Lihat semua →</Link>
                </div>
                <div className="p-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {recentProducts && recentProducts.length > 0 ? (
                            recentProducts.map((product) => {
                                const producerUser = Array.isArray(product.users) ? product.users[0] : product.users;
                                const profile = Array.isArray(producerUser?.producer_profiles) ? producerUser?.producer_profiles[0] : producerUser?.producer_profiles;
                                
                                return (
                                    <div key={product.id} className="border border-gray-200 rounded-xl overflow-hidden group">
                                        <div className="h-28 bg-gray-50 relative border-b border-gray-100">
                                            {product.image_url ? (
                                                <Image src={product.image_url} alt={product.name} fill className="object-cover" />
                                            ) : (
                                                <div className="absolute inset-0 flex items-center justify-center text-gray-300">
                                                    <Package className="w-8 h-8" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-3">
                                            <h3 className="font-bold text-sm text-gray-900 truncate">{product.name}</h3>
                                            <p className="text-[11px] text-gray-500 mt-0.5 truncate">{profile?.business_name || 'Anonim'}</p>
                                            
                                            <div className="mt-3 flex gap-2">
                                                {product.is_active ? (
                                                    <span className="w-full text-center block bg-green-50 text-green-700 text-[10px] font-bold py-1.5 rounded-lg">AKTIF</span>
                                                ) : (
                                                    <span className="w-full text-center block bg-red-50 text-red-700 text-[10px] font-bold py-1.5 rounded-lg">NONAKTIF</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })
                        ) : (
                            <div className="col-span-4 py-8 text-center text-gray-400 text-sm">
                                Belum ada produk di platform.
                            </div>
                        )}
                    </div>
                </div>
            </div>

        </div>
    );
}
