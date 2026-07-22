"use client";

import { useState } from "react";
import { Ban } from "lucide-react";
import { cancelOrder } from "@/app/actions/adminActions";
import toast from "react-hot-toast";

export default function OrderCancelButton({ orderId }: { orderId: string }) {
    const [loading, setLoading] = useState(false);

    const handleCancel = async () => {
        if (!confirm("Batalkan pesanan ini secara paksa?")) return;
        
        setLoading(true);
        try {
            const result = await cancelOrder(orderId);
            if (result.success) {
                toast.success("Pesanan berhasil dibatalkan");
            } else {
                toast.error("Gagal membatalkan pesanan");
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
            title="Batalkan Pesanan (Force Cancel)"
        >
            <Ban size={16} />
        </button>
    );
}
