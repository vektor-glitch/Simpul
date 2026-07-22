"use server";

import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

/**
 * Memverifikasi produsen yang baru mendaftar
 */
export async function verifyProducer(producerId: string) {
    const supabase = await createClient();
    
    // Pastikan yang melakukan aksi adalah admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not authenticated" };

    const { data: adminData } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();
        
    if (adminData?.role !== "admin") return { success: false, error: "Unauthorized" };

    const { error } = await supabaseAdmin
        .from("users")
        .update({ verified: true })
        .eq("id", producerId);

    if (error) {
        console.error("Error verifying producer:", error);
        return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/admin/verifications");
    return { success: true };
}

/**
 * Menolak produsen (opsional bisa hapus atau biarkan verified: false)
 * Untuk saat ini kita biarkan verified: false (bisa ditambah pesan penolakan nanti)
 */
export async function rejectProducer(producerId: string) {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not authenticated" };

    const { data: adminData } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();
        
    if (adminData?.role !== "admin") return { success: false, error: "Unauthorized" };

    // Saat ini sekadar memastikan tetap false (atau bisa ditambahkan aksi lain)
    const { error } = await supabaseAdmin
        .from("users")
        .update({ verified: false })
        .eq("id", producerId);

    if (error) {
        console.error("Error rejecting producer:", error);
        return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/admin/verifications");
    return { success: true };
}

/**
 * Mengubah status aktif/non-aktif sebuah produk
 */
export async function toggleProductStatus(productId: string, currentStatus: boolean) {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not authenticated" };

    const { data: adminData } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();
        
    if (adminData?.role !== "admin") return { success: false, error: "Unauthorized" };

    const { error } = await supabaseAdmin
        .from("products")
        .update({ is_active: !currentStatus })
        .eq("id", productId);

    if (error) {
        console.error("Error toggling product status:", error);
        return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/admin/moderation");
    return { success: true };
}

/**
 * Mengubah status pencairan dana (withdrawal)
 */
export async function updateWithdrawalStatus(withdrawalId: string, status: 'completed' | 'rejected') {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not authenticated" };

    const { data: adminData } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();
        
    if (adminData?.role !== "admin") return { success: false, error: "Unauthorized" };

    const { error } = await supabaseAdmin
        .from("withdrawals")
        .update({ status: status })
        .eq("id", withdrawalId);

    if (error) {
        console.error("Error updating withdrawal status:", error);
        return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/admin/withdrawals");
    return { success: true };
}

/**
 * Moderasi: Menghapus ulasan (Review) yang melanggar
 */
export async function deleteReview(reviewId: string) {
    const supabase = await createClient();
    
    // Auth Check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not authenticated" };
    const { data: adminData } = await supabase.from("users").select("role").eq("id", user.id).single();
    if (adminData?.role !== "admin") return { success: false, error: "Unauthorized" };

    const { error } = await supabaseAdmin.from("reviews").delete().eq("id", reviewId);

    if (error) {
        console.error("Error deleting review:", error);
        return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/admin/reviews");
    return { success: true };
}

/**
 * Moderasi: Membatalkan pesanan secara sepihak
 */
export async function cancelOrder(orderId: string) {
    const supabase = await createClient();
    
    // Auth Check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not authenticated" };
    const { data: adminData } = await supabase.from("users").select("role").eq("id", user.id).single();
    if (adminData?.role !== "admin") return { success: false, error: "Unauthorized" };

    const { error } = await supabaseAdmin.from("orders").update({ status: 'cancelled' }).eq("id", orderId);

    if (error) {
        console.error("Error cancelling order:", error);
        return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/admin/orders");
    return { success: true };
}

/**
 * Moderasi: Menutup paksa pool
 */
export async function cancelPool(poolId: string) {
    const supabase = await createClient();
    
    // Auth Check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not authenticated" };
    const { data: adminData } = await supabase.from("users").select("role").eq("id", user.id).single();
    if (adminData?.role !== "admin") return { success: false, error: "Unauthorized" };

    const { error } = await supabaseAdmin.from("pools").update({ status: 'cancelled' }).eq("id", poolId);

    if (error) {
        console.error("Error cancelling pool:", error);
        return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/admin/pools");
    return { success: true };
}

/**
 * Moderasi: Suspend / Unsuspend Pengguna
 */
export async function toggleUserSuspension(userId: string, currentStatus: boolean) {
    const supabase = await createClient();
    
    // Auth Check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not authenticated" };
    const { data: adminData } = await supabase.from("users").select("role").eq("id", user.id).single();
    if (adminData?.role !== "admin") return { success: false, error: "Unauthorized" };

    const { error } = await supabaseAdmin
        .from("users")
        .update({ is_suspended: !currentStatus })
        .eq("id", userId);

    if (error) {
        console.error("Error toggling user suspension:", error);
        return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/admin/users");
    return { success: true };
}

/**
 * Pengaturan: Memperbarui persentase admin fee
 */
export async function updatePlatformSettings(newFee: number) {
    const supabase = await createClient();
    
    // Auth Check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not authenticated" };
    const { data: adminData } = await supabase.from("users").select("role").eq("id", user.id).single();
    if (adminData?.role !== "admin") return { success: false, error: "Unauthorized" };

    // Get the first settings row
    const { data: settingsRow } = await supabaseAdmin.from("platform_settings").select("id").limit(1).single();
    
    if (settingsRow) {
        const { error } = await supabaseAdmin
            .from("platform_settings")
            .update({ admin_fee_percentage: newFee, updated_at: new Date().toISOString() })
            .eq("id", settingsRow.id);
            
        if (error) return { success: false, error: error.message };
    } else {
        const { error } = await supabaseAdmin
            .from("platform_settings")
            .insert({ admin_fee_percentage: newFee });
            
        if (error) return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/admin/settings");
    return { success: true };
}

