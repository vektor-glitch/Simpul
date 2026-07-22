import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import SettingsForm from "./SettingsForm";

export default async function AdminSettingsPage() {
    const supabase = await createClient();
    
    // Auth check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // Ambil pengaturan saat ini
    const { data: settingsRow } = await supabaseAdmin.from("platform_settings").select("*").limit(1).single();
    
    const initialFee = settingsRow?.admin_fee_percentage || 5;

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Pengaturan Platform</h1>
                    <p className="text-gray-500 mt-1">
                        Sesuaikan variabel global platform Simpul.
                    </p>
                </div>
            </div>

            <SettingsForm initialFee={initialFee} />
        </div>
    );
}
