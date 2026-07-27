import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ProfileClient from "./ProfileClient";

export default async function ProducerProfilePage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/auth/login");
    }

    // Ambil data user
    const { data: userData } = await supabase
        .from("users")
        .select("name, phone, verified")
        .eq("id", user.id)
        .single();

    // Ambil data producer_profiles
    const { data: profileData } = await supabase
        .from("producer_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();



    const mergedProfile = profileData ? {
        ...profileData,
        users: userData
    } : {
        users: userData
    };

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Profil Usaha</h1>
            <p className="text-gray-500 mb-8">Lengkapi atau perbarui informasi bisnis Anda agar pembeli lebih percaya.</p>
            
            <ProfileClient initialData={mergedProfile} userId={user.id} />
        </div>
    );
}
