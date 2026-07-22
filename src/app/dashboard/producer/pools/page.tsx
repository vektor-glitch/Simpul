import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AlertCircle } from "lucide-react";
import Link from "next/link";
import PoolsClient from "./PoolsClient";

export default async function ProducerPoolsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/auth/login");
    }

    // Periksa status verifikasi & region produsen
    const { data: userData } = await supabase
        .from("users")
        .select(`
            verified,
            producer_profiles (region, category)
        `)
        .eq("id", user.id)
        .single();

    if (!userData?.verified) {
        return (
            <div className="max-w-4xl mx-auto py-12">
                <div className="bg-yellow-50 border border-yellow-200 rounded-3xl p-8 flex flex-col items-center text-center shadow-sm">
                    <div className="w-16 h-16 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mb-4">
                        <AlertCircle size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-yellow-900 mb-2">Akses Terbatas</h2>
                    <p className="text-yellow-700 max-w-md mx-auto mb-6">
                        Fitur kolaborasi Pool (Patungan Supply) hanya terbuka untuk Produsen yang telah diverifikasi oleh Admin.
                    </p>
                    <Link href="/dashboard/producer" className="bg-yellow-200 text-yellow-800 font-bold px-6 py-3 rounded-xl hover:bg-yellow-300 transition-colors">
                        Kembali ke Overview
                    </Link>
                </div>
            </div>
        );
    }

    const profile: any = Array.isArray(userData?.producer_profiles) ? userData.producer_profiles[0] : userData?.producer_profiles;
    const region = profile?.region || "";
    const category = profile?.category || "";

    // Ambil Pool yang terbuka di region & kategori yang sama
    const { data: availablePools } = await supabase
        .from("pools")
        .select("*")
        .eq("status", "open")
        .eq("region", region)
        .eq("category", category)
        .order("created_at", { ascending: false });

    // Ambil Pool yang sudah diikuti produsen ini
    const { data: myContributions } = await supabase
        .from("pool_contributions")
        .select(`
            pool_id,
            quantity_committed,
            pools (*)
        `)
        .eq("producer_id", user.id);

    return (
        <div className="max-w-6xl mx-auto">
            <PoolsClient 
                userId={user.id} 
                availablePools={availablePools || []} 
                myContributions={myContributions || []} 
                userRegion={region}
                userCategory={category}
            />
        </div>
    );
}
