import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import OrdersClient from "./OrdersClient";

export default async function ProducerOrdersPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/auth/login");
    }

    // Ambil semua pesanan yang produknya milik produsen ini
    const { data: orders } = await supabase
        .from("orders")
        .select(`
            *,
            product:products!inner (
                producer_id,
                name,
                price_producer,
                image_url
            ),
            buyer:users!inner (
                name,
                phone
            )
        `)
        .eq("product.producer_id", user.id)
        .order("created_at", { ascending: false });

    return (
        <div className="max-w-6xl mx-auto">
            <OrdersClient initialOrders={orders || []} />
        </div>
    );
}
