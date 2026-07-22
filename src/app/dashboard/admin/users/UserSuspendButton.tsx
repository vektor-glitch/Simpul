"use client";

import { useState } from "react";
import { ShieldAlert, ShieldCheck } from "lucide-react";
import { toggleUserSuspension } from "@/app/actions/adminActions";
import toast from "react-hot-toast";

export default function UserSuspendButton({ userId, isSuspended }: { userId: string, isSuspended: boolean }) {
    const [loading, setLoading] = useState(false);

    const handleToggle = async () => {
        const actionText = isSuspended ? "Buka Blokir (Unsuspend)" : "Blokir (Suspend)";
        if (!confirm(`Apakah Anda yakin ingin melakukan ${actionText} pada pengguna ini?`)) return;
        
        setLoading(true);
        try {
            const result = await toggleUserSuspension(userId, isSuspended);
            if (result.success) {
                toast.success(`Berhasil melakukan ${actionText}`);
            } else {
                toast.error(`Gagal melakukan ${actionText}`);
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
            onClick={handleToggle}
            disabled={loading}
            className={`px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50 ${
                isSuspended 
                    ? "bg-green-50 text-green-700 hover:bg-green-100 border border-green-200" 
                    : "bg-red-50 text-red-700 hover:bg-red-100 border border-red-200"
            }`}
            title={isSuspended ? "Buka Blokir" : "Blokir Akun"}
        >
            {isSuspended ? (
                <>
                    <ShieldCheck size={14} /> Unsuspend
                </>
            ) : (
                <>
                    <ShieldAlert size={14} /> Suspend
                </>
            )}
        </button>
    );
}
