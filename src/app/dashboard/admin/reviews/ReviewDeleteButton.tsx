"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { deleteReview } from "@/app/actions/adminActions";
import toast from "react-hot-toast";

export default function ReviewDeleteButton({ reviewId }: { reviewId: string }) {
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        if (!confirm("Apakah Anda yakin ingin menghapus ulasan ini? Tindakan ini tidak dapat dibatalkan.")) return;
        
        setLoading(true);
        try {
            const result = await deleteReview(reviewId);
            if (result.success) {
                toast.success("Ulasan berhasil dihapus");
            } else {
                toast.error("Gagal menghapus ulasan");
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
            onClick={handleDelete}
            disabled={loading}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
            title="Hapus Ulasan"
        >
            <Trash2 size={16} />
        </button>
    );
}
