"use client";

import { verifyProducer, rejectProducer } from "@/app/actions/adminActions";
import { useState } from "react";
import { CheckCircle, XCircle } from "lucide-react";

export default function VerificationButton({ producerId }: { producerId: string }) {
    const [isLoading, setIsLoading] = useState(false);

    const handleApprove = async () => {
        setIsLoading(true);
        try {
            await verifyProducer(producerId);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleReject = async () => {
        setIsLoading(true);
        try {
            await rejectProducer(producerId);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex gap-2 mt-4 md:mt-0">
            <button
                onClick={handleReject}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-red-600 bg-red-50 hover:bg-red-100 transition-colors font-medium text-sm disabled:opacity-50"
            >
                <XCircle className="w-4 h-4" />
                Tolak
            </button>
            <button
                onClick={handleApprove}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-white bg-orange-600 hover:bg-orange-700 transition-colors font-medium text-sm disabled:opacity-50"
            >
                <CheckCircle className="w-4 h-4" />
                Setujui
            </button>
        </div>
    );
}
