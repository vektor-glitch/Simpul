'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { MapPin, ShieldCheck, Truck, CreditCard, Loader2, CheckCircle2 } from 'lucide-react';
import { supabaseClient } from '@/lib/supabase'; // Assuming there is a client initialized somewhere, or I can recreate it
// Wait, I will use a direct createClient here
import { createClient } from '@/lib/supabase/client';

export default function CheckoutClient({ item, quantity, itemType = 'product' }: { item: any, quantity: number, itemType?: 'product' | 'pool' }) {
    const supabase = createClient();
    const router = useRouter();
    const [buyer, setBuyer] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);

    // Ongkir State
    const [shippingCost, setShippingCost] = useState<number>(0);
    const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);
    const [shippingMethod, setShippingMethod] = useState("jne");

    const subtotal = item.price * quantity;
    const adminFee = subtotal * 0.05; // 5% dari subtotal

    useEffect(() => {
        const fetchBuyerProfile = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                // Not logged in? Redirect to login
                router.push('/auth/login');
                return;
            }

            const { data: profile } = await supabase
                .from('buyer_profiles')
                .select('*')
                .eq('user_id', session.user.id)
                .single();

            const { data: user } = await supabase
                .from('users')
                .select('name, phone')
                .eq('id', session.user.id)
                .single();

            setBuyer({ ...profile, name: user?.name, phone: user?.phone });
            setIsLoading(false);

            // Calculate shipping using RajaOngkir
            calculateShipping();
        };

        fetchBuyerProfile();
    }, [router]);

    const calculateShipping = async () => {
        setIsCalculatingShipping(true);
        try {
            const response = await fetch('/api/shipping/cost', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    origin: "152", // Mock: Jakarta Pusat
                    destination: "114", // Mock: Denpasar
                    weight: 1000 * quantity, // Asumsi 1 unit = 1kg
                    courier: shippingMethod
                })
            });

            if (response.ok) {
                const data = await response.json();
                // Ambil harga layanan pertama (biasanya REG)
                if (data.results && data.results.length > 0 && data.results[0].costs.length > 0) {
                    setShippingCost(data.results[0].costs[0].cost[0].value);
                } else {
                    setShippingCost(20000); // Fallback
                }
            } else {
                setShippingCost(20000); // Fallback jika API error
            }
        } catch (e) {
            console.error(e);
            setShippingCost(20000); // Fallback 
        } finally {
            setIsCalculatingShipping(false);
        }
    };

    const handleCheckout = async () => {
        setIsProcessing(true);
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) return;

        const total_price = subtotal + adminFee + shippingCost;

        // Simpan ke orders
        const { data: order, error } = await supabase
            .from('orders')
            .insert({
                buyer_id: session.user.id,
                product_id: itemType === 'product' ? item.id : null,
                pool_id: itemType === 'pool' ? item.id : null,
                quantity: quantity,
                shipping_cost: shippingCost,
                subtotal: subtotal,
                admin_fee: adminFee,
                unit_price: item.price,
                total_price: total_price,
                shipping_address: buyer?.default_address + ', ' + buyer?.city + ' - ' + buyer?.postal_code,
                status: 'pending'
            })
            .select()
            .single();

        if (error || !order) {
            console.error("Gagal membuat pesanan", error);
            alert("Terjadi kesalahan saat memproses pesanan.");
            setIsProcessing(false);
            return;
        }

        try {
            // Minta Token Midtrans Snap
            const response = await fetch('/api/payment/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ order_id: order.id })
            });

            const paymentData = await response.json();

            if (!response.ok) {
                throw new Error(paymentData.error || 'Gagal mengambil token pembayaran');
            }

            // Panggil Pop-up Snap Midtrans
            (window as any).snap.pay(paymentData.token, {
                onSuccess: async function (result: any) {
                    console.log('Payment success:', result);
                    // Sinkronisasi status pesanan lokal
                    try {
                        await fetch('/api/payment/sync', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ order_id: order.id })
                        });
                    } catch (e) {
                        console.error('Gagal sinkronisasi:', e);
                    }

                    alert("Pembayaran Berhasil!");
                    router.push('/cart');
                },
                onPending: async function (result: any) {
                    console.log('Payment pending:', result);
                    alert("Pembayaran tertunda (menunggu transfer).");
                    router.push('/cart');
                },
                onError: function (result: any) {
                    console.log('Payment error:', result);
                    alert("Pembayaran gagal!");
                    setIsProcessing(false);
                },
                onClose: function () {
                    console.log('User closed the popup without finishing the payment');
                    alert("Anda menutup jendela pembayaran sebelum selesai.");
                    setIsProcessing(false);
                    // Boleh juga di-redirect ke halaman pesanan jika dianggap pesanan sudah dibuat tapi belum dibayar
                    router.push('/cart');
                }
            });

        } catch (err: any) {
            console.error(err);
            alert(err.message || "Gagal memuat sistem pembayaran Midtrans");
            setIsProcessing(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-24">
                <Loader2 className="w-10 h-10 text-brand-600 animate-spin mb-4" />
                <p className="text-gray-500 font-medium">Menyiapkan halaman checkout...</p>
            </div>
        );
    }

    const totalPrice = subtotal + adminFee + shippingCost;
    const storeName = item.storeName || "Penjual Anonim";

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* Bagian Kiri: Alamat & Produk */}
            <div className="lg:col-span-8 flex flex-col gap-6">

                {/* Alamat Pengiriman */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <MapPin className="text-brand-600" size={20} />
                            Alamat Pengiriman
                        </h2>
                        <button className="text-sm font-bold text-brand-600 hover:text-brand-700">Ubah Alamat</button>
                    </div>

                    {buyer?.default_address ? (
                        <div className="bg-brand-50/50 p-4 rounded-xl border border-brand-100">
                            <p className="font-bold text-gray-900 mb-1">{buyer.name} <span className="text-gray-500 font-normal text-sm ml-2">({buyer.phone || "No HP belum diisi"})</span></p>
                            <p className="text-gray-600 text-sm">{buyer.default_address}</p>
                            <p className="text-gray-600 text-sm">{buyer.city} - {buyer.postal_code}</p>
                        </div>
                    ) : (
                        <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium">
                            Anda belum melengkapi alamat pengiriman di profil Anda.
                        </div>
                    )}
                </div>

                {/* Detail Pesanan */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
                        <ShieldCheck size={18} className="text-brand-600" />
                        {storeName}
                    </h3>
                    <div className="flex gap-4">
                        <div className="w-24 h-24 bg-gray-100 rounded-xl flex-shrink-0 relative overflow-hidden border border-gray-200">
                            {item.image_url ? (
                                <Image src={item.image_url} alt={item.name} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">No Image</div>
                            )}
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-gray-900 text-lg">{item.name}</h3>

                            <div className="flex justify-between items-end mt-2">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Harga Satuan</p>
                                    <span className="font-bold text-gray-900">Rp{(item.price || 0).toLocaleString('id-ID')}</span>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-500 mb-1">Kuantitas</p>
                                    <span className="font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded-lg">
                                        {quantity} {item.unit}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Pengiriman */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Truck className="text-green-500" size={20} />
                        Metode Pengiriman (RajaOngkir)
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        <button
                            onClick={() => { setShippingMethod('jne'); calculateShipping(); }}
                            className={`p-3 rounded-xl border text-left transition-all ${shippingMethod === 'jne' ? 'border-green-500 bg-green-50 ring-2 ring-green-500/20' : 'border-gray-200 hover:border-green-300'}`}
                        >
                            <p className="font-bold text-gray-900">JNE</p>
                            <p className="text-xs text-gray-500">Reguler</p>
                        </button>
                        <button
                            onClick={() => { setShippingMethod('pos'); calculateShipping(); }}
                            className={`p-3 rounded-xl border text-left transition-all ${shippingMethod === 'pos' ? 'border-orange-500 bg-orange-50 ring-2 ring-orange-500/20' : 'border-gray-200 hover:border-orange-300'}`}
                        >
                            <p className="font-bold text-gray-900">POS Indonesia</p>
                            <p className="text-xs text-gray-500">Reguler</p>
                        </button>
                        <button
                            onClick={() => { setShippingMethod('tiki'); calculateShipping(); }}
                            className={`p-3 rounded-xl border text-left transition-all ${shippingMethod === 'tiki' ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500/20' : 'border-gray-200 hover:border-blue-300'}`}
                        >
                            <p className="font-bold text-gray-900">TIKI</p>
                            <p className="text-xs text-gray-500">Reguler</p>
                        </button>
                    </div>
                </div>

            </div>

            {/* Bagian Kanan: Ringkasan & Pembayaran */}
            <div className="lg:col-span-4">
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm sticky top-24">
                    <h2 className="text-lg font-bold text-gray-900 mb-6">Ringkasan Belanja</h2>

                    <div className="space-y-4 mb-6">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500">Total Harga ({quantity} barang)</span>
                            <span className="font-bold text-gray-900">Rp{subtotal.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500 flex items-center gap-1">
                                Ongkos Kirim
                                {isCalculatingShipping && <Loader2 className="w-3 h-3 animate-spin text-gray-400" />}
                            </span>
                            <span className="font-bold text-gray-900">Rp{shippingCost.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500">Biaya Admin (5%)</span>
                            <span className="font-bold text-gray-900">Rp{adminFee.toLocaleString('id-ID')}</span>
                        </div>
                    </div>

                    <div className="border-t border-gray-200 py-4 mb-6">
                        <div className="flex justify-between items-center">
                            <span className="font-bold text-gray-900">Total Tagihan</span>
                            <span className="text-2xl font-extrabold text-brand-600">Rp{totalPrice.toLocaleString('id-ID')}</span>
                        </div>
                    </div>

                    <div className="mb-6">
                        <h3 className="font-bold text-gray-900 mb-3 text-sm flex items-center gap-2">
                            <CreditCard size={16} />
                            Metode Pembayaran
                        </h3>
                        <div className="bg-gray-50 border border-gray-200 p-3 rounded-xl">
                            <p className="font-bold text-gray-900 text-sm">Transfer Bank Manual</p>
                            <p className="text-xs text-gray-500 mt-1">Verifikasi manual oleh sistem Simpul</p>
                        </div>
                    </div>

                    <button
                        onClick={handleCheckout}
                        disabled={isProcessing || isCalculatingShipping || !buyer?.default_address}
                        className="w-full py-4 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-brand-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isProcessing ? (
                            <><Loader2 className="w-5 h-5 animate-spin" /> Memproses...</>
                        ) : (
                            <><CheckCircle2 className="w-5 h-5" /> Bayar Sekarang</>
                        )}
                    </button>
                    {!buyer?.default_address && (
                        <p className="text-xs text-red-500 text-center mt-3 font-medium">Alamat pengiriman wajib diisi.</p>
                    )}
                </div>
            </div>

        </div>
    );
}
