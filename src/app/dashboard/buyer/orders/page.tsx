import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import OrdersList from "./OrdersList";

export const dynamic = 'force-dynamic';

export default async function BuyerOrdersPage() {
    const supabase = await createClient();

    // Pastikan user login dan sebagai buyer
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/auth/login");

    const { data: userData } = await supabase.from("users").select("role").eq("id", user.id).single();
    if (userData?.role !== "buyer") redirect("/dashboard");

    // Ambil semua pesanan milik buyer ini
    const { data: orders, error } = await supabase
        .from("orders")
        .select(`
            *,
            product:products(
                id, name, unit, image_url,
                users(
                    producer_profiles(business_name)
                )
            ),
            pool:pools(
                id, title, unit, image_url
            )
        `)
        .eq("buyer_id", user.id)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching buyer orders:", error);
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Pesanan Saya</h1>
                    <p className="text-gray-500 mt-1">
                        Pantau dan kelola semua transaksi belanja Anda di Simpul.
                    </p>
                </div>
            </div>

            <OrdersList initialOrders={orders || []} />
        </div>
    );
}
