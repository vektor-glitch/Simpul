"use client";

import { useState } from "react";
import { Ban } from "lucide-react";
import { cancelPool } from "@/app/actions/adminActions";
import toast from "react-hot-toast";

export default function PoolCancelButton({ poolId }: { poolId: string }) {
    const [loading, setLoading] = useState(false);

    const handleCancel = async () => {
        if (!confirm("Tutup paksa kampanye pool ini? Tindakan ini tidak dapat dibatalkan.")) return;
        
        setLoading(true);
        try {
            const result = await cancelPool(poolId);
            if (result.success) {
                toast.success("Pool berhasil dibatalkan");
            } else {
                toast.error("Gagal membatalkan pool");
            }
        } catch (error) {
            console.error(error);
            toast.error("Terjadi kesalahan sistem");
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleCancel}
            disabled={loading}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
            title="Tutup Paksa (Force Cancel)"
        >
            <Ban size={16} />
        </button>
    );
}
