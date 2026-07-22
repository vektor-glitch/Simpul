import AdminSidebar from "@/components/dashboard/AdminSidebar";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/auth/login");
    }

    // Periksa role, pastikan hanya admin
    const { data: userData } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();

    if (!userData || userData.role !== 'admin') {
        // Redirect ke dashboard masing-masing jika bukan admin
        if (userData?.role === 'producer') redirect("/dashboard/producer");
        redirect("/dashboard/buyer");
    }

    return (
        <div className="min-h-screen bg-[#FAF7F0] font-sans flex">
            <AdminSidebar />
            
            {/* Main Content Area */}
            <main className="flex-1 ml-64 p-8">
                {children}
            </main>
        </div>
    );
}
