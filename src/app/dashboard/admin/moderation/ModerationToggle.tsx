"use client";

import { toggleProductStatus } from "@/app/actions/adminActions";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface ModerationToggleProps {
    productId: string;
    isActive: boolean;
}

export default function ModerationToggle({ productId, isActive }: ModerationToggleProps) {
    const [loading, setLoading] = useState(false);

    const handleToggle = async () => {
        setLoading(true);
        try {
            await toggleProductStatus(productId, isActive);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleToggle}
            disabled={loading}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors font-medium text-sm disabled:opacity-50 border ${
                isActive 
                ? "bg-white border-gray-200 text-gray-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200" 
                : "bg-red-50 border-red-200 text-red-600 hover:bg-white hover:text-gray-700 hover:border-gray-200"
            }`}
        >
            {isActive ? (
                <>
                    <EyeOff className="w-4 h-4" />
                    Nonaktifkan
                </>
            ) : (
                <>
                    <Eye className="w-4 h-4" />
                    Aktifkan Kembali
                </>
            )}
        </button>
    );
}
