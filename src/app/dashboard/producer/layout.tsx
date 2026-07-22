import ProducerSidebar from "@/components/dashboard/ProducerSidebar";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function ProducerDashboardLayout({ children }: { children: React.ReactNode }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/auth/login");
    }

    // Periksa role, pastikan hanya producer
    const { data: userData } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();

    if (!userData || userData.role !== 'producer') {
        redirect("/dashboard/buyer"); // Redirect non-producer (misal buyer) kembali ke dashboard mereka
    }

    return (
        <div className="min-h-screen bg-[#FAF7F0] font-sans flex">
            <ProducerSidebar />
            
            {/* Main Content Area */}
            <main className="flex-1 ml-64 p-8">
                {children}
            </main>
        </div>
    );
}
