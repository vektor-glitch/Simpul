'use client';

import { useState } from 'react';
import { Minus, Plus, ShoppingBag, ShoppingCart } from 'lucide-react';
import { useProfileCheck } from '@/hooks/useProfileCheck';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

interface CheckoutBoxProps {
    productId: string;
    price: number;
    stock: number;
    minOrder: number;
    unit: string;
}

export default function CheckoutBox({ productId, price, stock, minOrder, unit }: CheckoutBoxProps) {
    const safeMinOrder = Number(minOrder) || 1;
    const safeStock = Number(stock) || 0;
    const [quantity, setQuantity] = useState<number>(safeMinOrder);
    const [isAdding, setIsAdding] = useState(false);
    const { withProfileCheck, isChecking } = useProfileCheck();
    const router = useRouter();
    const supabase = createClient();

    const handleIncrease = () => {
        if (quantity < safeStock) setQuantity(q => Number(q) + 1);
    };

    const handleDecrease = () => {
        if (quantity > safeMinOrder) setQuantity(q => Number(q) - 1);
    };

    const handleBuyNow = () => {
        withProfileCheck(() => {
            router.push(`/checkout?product_id=${productId}&qty=${quantity}`);
        });
    };

    const handleAddToCart = () => {
        withProfileCheck(async () => {
            setIsAdding(true);
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                setIsAdding(false);
                return;
            }
            
            // Periksa apakah produk sudah ada di keranjang
            const { data: existing } = await supabase
                .from('cart_items')
                .select('id, quantity')
                .eq('buyer_id', session.user.id)
                .eq('product_id', productId)
                .single();
                
            if (existing) {
                // Tambahkan kuantitas
                const { error } = await supabase
                    .from('cart_items')
                    .update({ quantity: existing.quantity + quantity })
                    .eq('id', existing.id);
                if (error) toast.error("Gagal memperbarui keranjang");
                else toast.success("Kuantitas produk di keranjang diperbarui!");
            } else {
                // Masukkan produk baru
                const { error } = await supabase
                    .from('cart_items')
                    .insert({
                        buyer_id: session.user.id,
                        product_id: productId,
                        quantity: quantity
                    });
                if (error) toast.error("Gagal memasukkan ke keranjang");
                else toast.success("Berhasil ditambahkan ke keranjang!");
            }
            setIsAdding(false);
        });
    };

    const subtotal = price * quantity;

    return (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm sticky top-24">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Atur Jumlah Pembelian</h3>
            
            <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden h-10 w-32">
                    <button 
                        type="button"
                        onClick={handleDecrease}
                        disabled={quantity <= safeMinOrder || isChecking || isAdding}
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
                        disabled={quantity >= safeStock || isChecking || isAdding}
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
                <p className="text-xs text-brand-600 font-medium mb-4">Minimal pembelian {safeMinOrder} {unit}</p>
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
                    disabled={isChecking || isAdding}
                    className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-brand-600/20 disabled:opacity-70"
                >
                    {isChecking ? (
                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    ) : (
                        <ShoppingBag size={20} />
                    )}
                    Beli Langsung
                </button>
                <button 
                    onClick={handleAddToCart}
                    disabled={isChecking || isAdding}
                    className="w-full py-3.5 bg-white border-2 border-brand-600 text-brand-600 hover:bg-brand-50 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-70"
                >
                    {isAdding ? (
                        <span className="w-5 h-5 border-2 border-brand-600/30 border-t-brand-600 rounded-full animate-spin"></span>
                    ) : (
                        <ShoppingCart size={20} />
                    )}
                    Masukkan Keranjang
                </button>
            </div>
            
            <p className="text-center text-xs text-gray-400 mt-4">
                Biaya admin dan ongkir akan dihitung di halaman berikutnya.
            </p>
        </div>
    );
}
