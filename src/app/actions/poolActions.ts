"use server";

import { createClient } from "@supabase/supabase-js";

// Menggunakan Service Role Key untuk melewati RLS, karena hanya admin yang boleh mengupdate pools secara langsung,
// namun produsen butuh mengupdate collected_quantity saat bergabung.
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function updatePoolProgress(poolId: string, additionalQty: number) {
    // 1. Ambil data pool saat ini
    const { data: pool, error: fetchErr } = await supabaseAdmin
        .from("pools")
        .select("collected_quantity, target_quantity, status")
        .eq("id", poolId)
        .single();

    if (fetchErr || !pool) {
        throw new Error("Pool tidak ditemukan");
    }

    // 2. Hitung jumlah baru
    const newCollected = pool.collected_quantity + additionalQty;
    const newStatus = newCollected >= pool.target_quantity ? "fulfilled" : pool.status;

    // 3. Update pool
    const { data: updatedPool, error: updateErr } = await supabaseAdmin
        .from("pools")
        .update({
            collected_quantity: newCollected,
            status: newStatus
        })
        .eq("id", poolId)
        .select()
        .single();

    if (updateErr) {
        throw new Error("Gagal mengupdate progress pool");
    }

    return updatedPool;
}
