import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { Users as UsersIcon, ShieldAlert, Phone } from "lucide-react";
import UserSuspendButton from "./UserSuspendButton";

export default async function AdminUsersPage() {
    const supabase = await createClient();
    
    // Auth check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // Fetch users (We need to join buyer_profiles and producer_profiles manually since they are separate tables referencing users)
    const { data: users, error } = await supabaseAdmin
        .from('users')
        .select(`
            *,
            buyer_profiles(default_address),
            producer_profiles(business_name, location)
        `)
        .neq('role', 'admin') // Exclude admins
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching users:", error);
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Manajemen Pengguna</h1>
                    <p className="text-gray-500 mt-1">
                        Pantau aktivitas pengguna dan ambil tindakan pemblokiran bila diperlukan.
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-600 font-medium">
                            <tr>
                                <th className="px-6 py-4">Tipe Pengguna</th>
                                <th className="px-6 py-4">Nama & Kontak</th>
                                <th className="px-6 py-4">Status Akun</th>
                                <th className="px-6 py-4">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {(!users || users.length === 0) ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                                        <UsersIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                        <p>Belum ada pengguna yang terdaftar di platform ini.</p>
                                    </td>
                                </tr>
                            ) : (
                                users.map((item) => {
                                    const isProducer = item.role === 'producer';
                                    const producerProfile = Array.isArray(item.producer_profiles) ? item.producer_profiles[0] : item.producer_profiles;
                                    const buyerProfile = Array.isArray(item.buyer_profiles) ? item.buyer_profiles[0] : item.buyer_profiles;
                                    
                                    const isSuspended = !!item.is_suspended;

                                    return (
                                        <tr key={item.id} className={`transition-colors ${isSuspended ? 'bg-red-50/50 hover:bg-red-50' : 'hover:bg-gray-50'}`}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${isProducer ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                                    {isProducer ? 'PRODUSEN' : 'PEMBELI'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 min-w-[250px]">
                                                <div className="font-bold text-gray-900 text-base">{item.name}</div>
                                                {isProducer && producerProfile?.business_name && (
                                                    <div className="text-xs font-medium text-brand-600 mt-0.5">Toko: {producerProfile.business_name}</div>
                                                )}
                                                <div className="text-xs text-gray-500 mt-1.5 flex items-center gap-1">
                                                    <Phone size={12} /> {item.phone}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {isSuspended ? (
                                                    <div className="flex items-center gap-1.5 text-red-600 text-xs font-bold">
                                                        <ShieldAlert size={14} /> DIBLOKIR
                                                    </div>
                                                ) : (
                                                    <div className="text-gray-500 text-xs font-bold">
                                                        AKTIF
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <UserSuspendButton userId={item.id} isSuspended={isSuspended} />
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
