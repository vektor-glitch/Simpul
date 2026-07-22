"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/*  Konfirmasi penerimaan barang oleh pembeli */
export async function confirmOrderDelivery(orderId: string) {
    const supabase = await createClient();

    // Auth Check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not authenticated" };

    // Verifikasi bahwa order ini milik user
    const { data: order } = await supabase.from("orders").select("buyer_id, product_id, pool_id").eq("id", orderId).single();
    if (!order || order.buyer_id !== user.id) return { success: false, error: "Unauthorized" };

    // Update status menjadi 'delivered'
    const { error } = await supabase
        .from("orders")
        .update({ status: "delivered" })
        .eq("id", orderId);

    if (error) {
        console.error("Error confirming delivery:", error);
        return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/buyer/orders");
    return { success: true };
}

/**
 * Mengirimkan ulasan dan rating
 */
export async function submitReview(orderId: string, rating: number, comment: string) {
    const supabase = await createClient();

    // Auth Check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not authenticated" };

    // Verifikasi kepemilikan dan status
    const { data: order } = await supabase.from("orders").select("*, product:products(user_id)").eq("id", orderId).single();
    if (!order || order.buyer_id !== user.id) return { success: false, error: "Unauthorized" };
    if (order.status !== "delivered") return { success: false, error: "Order is not delivered yet" };

    // Tentukan producer_id. Jika product, ambil dari product.user_id. Jika pool, ambil dari pools (tapi asumsikan pool_id saja).
    let producerId = null;
    if (order.product_id) {
        const { data: p } = await supabase.from("products").select("user_id").eq("id", order.product_id).single();
        producerId = p?.user_id;
    }

    // Insert review
    const { error: insertError } = await supabase.from("reviews").insert({
        order_id: orderId,
        buyer_id: user.id,
        producer_id: producerId,
        product_id: order.product_id,
        pool_id: order.pool_id,
        rating: rating,
        comment: comment
    });

    if (insertError) {
        console.error("Error submitting review:", insertError);
        // Bisa jadi karena unique constraint (sudah pernah review)
        if (insertError.code === '23505') {
            return { success: false, error: "Anda sudah memberikan ulasan untuk pesanan ini." };
        }
        return { success: false, error: insertError.message };
    }

    // Hitung ulang rata-rata rating jika ini adalah review untuk produk
    if (order.product_id) {
        const { data: allReviews } = await supabase.from("reviews").select("rating").eq("product_id", order.product_id);
        if (allReviews && allReviews.length > 0) {
            const totalRating = allReviews.reduce((acc, curr) => acc + curr.rating, 0);
            const avgRating = totalRating / allReviews.length;

            await supabase.from("products").update({
                rating: avgRating,
                review_count: allReviews.length
            }).eq("id", order.product_id);
        }
    }

    revalidatePath("/dashboard/buyer/orders");
    return { success: true };
}
