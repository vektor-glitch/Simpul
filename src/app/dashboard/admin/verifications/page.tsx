import { createClient } from "@/lib/supabase/server";
import { Store, MapPin, Tag, UserCheck, AlertCircle } from "lucide-react";
import VerificationButton from "./VerificationButton";

export default async function VerificationsPage() {
    const supabase = await createClient();

    // Ambil user produsen yang belum terverifikasi beserta profil mereka
    const { data: producers, error } = await supabase
        .from('users')
        .select(`
            id,
            name,
            phone,
            created_at,
            producer_profiles (
                business_name,
                location,
                category,
                description
            )
        `)
        .eq('role', 'producer')
        .eq('verified', false)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching producers:", error);
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Verifikasi Produsen</h1>
                    <p className="text-gray-500 mt-1">
                        Cek dan validasi pendaftaran produsen baru sebelum mereka bisa mulai berjualan.
                    </p>
                </div>
            </div>

            {(!producers || producers.length === 0) ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
                    <UserCheck className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-gray-900">Semua Produsen Terverifikasi</h3>
                    <p className="text-gray-500 mt-1">Tidak ada pengajuan baru yang menunggu persetujuan saat ini.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {producers.map((producer) => {
                        const profile = Array.isArray(producer.producer_profiles) 
                            ? producer.producer_profiles[0] 
                            : producer.producer_profiles;
                            
                        return (
                            <div key={producer.id} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                <div className="space-y-4 flex-1">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-orange-100 flex flex-shrink-0 items-center justify-center text-orange-600">
                                            <Store className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900">
                                                {profile?.business_name || "Nama Usaha Belum Diisi"}
                                            </h3>
                                            <p className="text-sm text-gray-500 font-medium">
                                                Pemilik: {producer.name || "Anonim"} • {producer.phone || "No HP Kosong"}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                        <div className="flex items-start gap-2 text-gray-600">
                                            <MapPin className="w-4 h-4 mt-0.5 text-gray-400" />
                                            <span>{profile?.location || "Lokasi belum diisi"}</span>
                                        </div>
                                        <div className="flex items-start gap-2 text-gray-600">
                                            <Tag className="w-4 h-4 mt-0.5 text-gray-400" />
                                            <span>Kategori: <span className="font-semibold text-gray-900">{profile?.category || "Belum dipilih"}</span></span>
                                        </div>
                                    </div>

                                    {profile?.description && (
                                        <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                                            <p className="text-sm text-gray-600 italic">"{profile.description}"</p>
                                        </div>
                                    )}
                                </div>

                                {/* Tombol Verifikasi Server Action */}
                                <VerificationButton producerId={producer.id} />
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
