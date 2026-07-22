"use client";

import { useState } from "react";
import { CheckCircle, XCircle } from "lucide-react";
import { updateWithdrawalStatus } from "@/app/actions/adminActions";
import toast from "react-hot-toast";

interface WithdrawalActionsProps {
    withdrawalId: string;
}

export default function WithdrawalActions({ withdrawalId }: WithdrawalActionsProps) {
    const [loading, setLoading] = useState(false);

    const handleAction = async (status: 'completed' | 'rejected') => {
        setLoading(true);
        try {
            const result = await updateWithdrawalStatus(withdrawalId, status);
            if (result.success) {
                toast.success(status === 'completed' ? "Pencairan disetujui" : "Pencairan ditolak");
            } else {
                toast.error("Gagal memproses pencairan");
            }
        } catch (error) {
            console.error(error);
            toast.error("Terjadi kesalahan sistem");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex gap-2 justify-end">
            <button
                onClick={() => handleAction('rejected')}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-red-600 bg-red-50 hover:bg-red-100 transition-colors font-medium text-xs disabled:opacity-50"
            >
                <XCircle className="w-3.5 h-3.5" />
                Tolak
            </button>
            <button
                onClick={() => handleAction('completed')}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white bg-green-600 hover:bg-green-700 transition-colors font-medium text-xs disabled:opacity-50"
            >
                <CheckCircle className="w-3.5 h-3.5" />
                Setujui
            </button>
        </div>
    );
}
