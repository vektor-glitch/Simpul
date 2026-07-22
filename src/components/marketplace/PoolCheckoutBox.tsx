'use client';

import { useState } from 'react';
import { Minus, Plus, ShoppingBag } from 'lucide-react';
import { useProfileCheck } from '@/hooks/useProfileCheck';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

interface PoolCheckoutBoxProps {
    poolId: string;
    price: number;
    stock: number;
    minOrder: number;
    unit: string;
}

export default function PoolCheckoutBox({ poolId, price, stock, minOrder, unit }: PoolCheckoutBoxProps) {
    const safeMinOrder = Number(minOrder) || 1;
    const safeStock = Number(stock) || 0;
    const [quantity, setQuantity] = useState<number>(safeMinOrder);
    const { withProfileCheck, isChecking } = useProfileCheck();
    const router = useRouter();

    const handleIncrease = () => {
        if (quantity < safeStock) setQuantity(q => Number(q) + 1);
    };

    const handleDecrease = () => {
        if (quantity > safeMinOrder) setQuantity(q => Number(q) - 1);
    };

    const handleBuyNow = () => {
        withProfileCheck(() => {
            router.push(`/checkout?pool_id=${poolId}&qty=${quantity}`);
        });
    };

    const subtotal = price * quantity;

    return (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm sticky top-24">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Atur Jumlah Pengambilan</h3>
            
            <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden h-10 w-32">
                    <button 
                        type="button"
                        onClick={handleDecrease}
                        disabled={quantity <= safeMinOrder || isChecking}
                        className="w-10 h-full flex items-center justify-center bg-gray-50 text-gray-600 hover:bg-gray-100 disabled:opacity-50 transition-colors"
                    >
                        <Minus size={16} />
                    </button>
                    <div className="flex-1 h-full flex items-center justify-center font-bold text-gray-900 text-sm">
                        {quantity}
                    </div>
                    <button 
                        type="button"
                        onClick={handleIncrease}
                        disabled={quantity >= safeStock || isChecking}
                        className="w-10 h-full flex items-center justify-center bg-gray-50 text-gray-600 hover:bg-gray-100 disabled:opacity-50 transition-colors"
                    >
                        <Plus size={16} />
                    </button>
                </div>
                <div className="text-sm text-gray-500">
                    Sisa Stok: <span className="font-bold text-gray-700">{stock} {unit}</span>
                </div>
            </div>

            {quantity === safeMinOrder && (
                <p className="text-xs text-brand-600 font-medium mb-4">Pembelian grosir minimal {safeMinOrder} {unit}</p>
            )}

            <div className="flex items-center justify-between py-4 border-t border-gray-100 mb-4">
                <span className="text-gray-500 font-medium">Subtotal</span>
                <span className="text-xl font-extrabold text-gray-900">
                    Rp{subtotal.toLocaleString('id-ID')}
                </span>
            </div>

            <div className="space-y-3">
                <button 
                    onClick={handleBuyNow}
                    disabled={isChecking || safeStock === 0}
                    className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-brand-600/20 disabled:opacity-70 disabled:shadow-none"
                >
                    {isChecking ? (
                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    ) : (
                        <ShoppingBag size={20} />
                    )}
                    {safeStock === 0 ? "Stok Habis" : "Pesan dari Pool Ini"}
                </button>
            </div>
            
            <p className="text-center text-xs text-gray-400 mt-4">
                Biaya admin dan estimasi pengiriman dihitung di halaman checkout.
            </p>
        </div>
    );
}
