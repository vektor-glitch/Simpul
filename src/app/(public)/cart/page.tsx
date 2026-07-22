import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import MarketNav from "@/components/marketplace/marketplacenav";
import CartClient from "./CartClient";

export default async function CartPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/auth/login");
    }

    // Ambil data pesanan pembeli
    const { data: orders, error } = await supabase
        .from("orders")
        .select(`
            *,
            reviews(id, rating),
            product:products(
                name,
                image_url,
                price_final,
                users!inner(
                    phone,
                    producer_profiles(business_name)
                )
            )
        `)
        .eq("buyer_id", user.id)
        .order("created_at", { ascending: false });

    // Ambil data cart items
    const { data: cartItems, error: cartError } = await supabase
        .from("cart_items")
        .select(`
            *,
            product:products(
                id,
                name,
                image_url,
                price_final,
                unit,
                stock,
                users!inner(
                    phone,
                    producer_profiles(business_name)
                )
            )
        `)
        .eq("buyer_id", user.id)
        .order("created_at", { ascending: false });

    if (error) console.error("Gagal mengambil pesanan:", error);
    if (cartError) console.error("Gagal mengambil keranjang:", cartError);

    return (
        <div className="min-h-screen bg-[#FAF7F0] flex flex-col font-sans">
            <MarketNav />
            <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
                <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-8">Keranjang & Pesanan Saya</h1>
                <CartClient initialOrders={orders || []} initialCartItems={cartItems || []} />
            </main>
        </div>
    );
}
