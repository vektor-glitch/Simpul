'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { MapPin, ShieldCheck, Truck, CreditCard, Loader2, CheckCircle2 } from 'lucide-react';
import LocationAutocomplete from './LocationAutocomplete';
import { createClient } from '@/lib/supabase/client';

export default function CheckoutClient({ item, quantity, itemType = 'product', adminFeePercentage = 5 }: { item: any, quantity: number, itemType?: 'product' | 'pool', adminFeePercentage?: number }) {
    const supabase = createClient();
    const router = useRouter();
    const [buyer, setBuyer] = useState<any>(null);
    const [addresses, setAddresses] = useState<any[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
    const [customDestinationId, setCustomDestinationId] = useState<string>("");
    const [customDestinationLabel, setCustomDestinationLabel] = useState<string>("");
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);

    // status kalkulasi ongkos kirim
    const [shippingCost, setShippingCost] = useState<number>(0);
    const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);
    const [shippingMethod, setShippingMethod] = useState("");
    const [shippingOptions, setShippingOptions] = useState<any[]>([]);

    const subtotal = item.price * quantity;
    const adminFee = subtotal * (adminFeePercentage / 100);

    useEffect(() => {
        const fetchBuyerProfile = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                // alihkan ke halaman login jika belum masuk
                router.push('/auth/login');
                return;
            }

            const { data: profile } = await supabase
                .from('buyer_profiles')
                .select('*')
                .eq('user_id', session.user.id)
                .single();

            const { data: userAddrs } = await supabase.from('addresses').select('*').eq('user_id', session.user.id).order('is_primary', {ascending: false});
            if (userAddrs && userAddrs.length > 0) {
                setAddresses(userAddrs);
                setSelectedAddressId(userAddrs[0].id);
            }

            const { data: user } = await supabase
                .from('users')
                .select('name, phone')
                .eq('id', session.user.id)
                .single();

            setBuyer({ ...profile, name: user?.name, phone: user?.phone });
            setIsLoading(false);

            // hitung ongkos kirim menggunakan integrasi RajaOngkir
            calculateShipping();
        };

        fetchBuyerProfile();
    }, [router]);

    const calculateShipping = async (destinationOverride?: string) => {
        setIsCalculatingShipping(true);
        
        try {
            // helper untuk menerjemahkan nama kota ke ID lokasi RajaOngkir secara otomatis
            const getCityId = async (cityStr?: string) => {
                if (!cityStr) return undefined;
                const lower = cityStr.toLowerCase();
                
                // cache lokal sementara untuk mempercepat pencarian kota yang sering digunakan
                if (lower.includes("sleman")) return "31517";
                if (lower.includes("bantul")) return "31442";
                if (lower.includes("bandung")) return "4878";
                if (lower.includes("yogyakarta") || lower.includes("jogja")) return "31397";
                if (lower.includes("kulon progo") || lower.includes("kulonprogo")) return "31464";
                if (lower.includes("gunung kidul") || lower.includes("gunungkidul")) return "31548";
                if (lower.includes("sewon")) return "31454";
                
                // lakukan pencarian ke API jika nama kota tidak ada di cache lokal
                try {
                    const res = await fetch(`/api/shipping/search?q=${encodeURIComponent(cityStr)}`);
                    if (res.ok) {
                        const data = await res.json();
                        if (data && data.length > 0) {
                            return data[0].id; // ambil kecocokan lokasi yang paling pertama
                        }
                    }
                } catch (e) {
                    console.error("Gagal mencari ID kota via API:", e);
                }
                
                return undefined;
            };

            let originId = item.storeLocationId;
            if (!originId) {
                originId = await getCityId(item.storeLocation);
            }
            if (!originId) originId = "31442"; // Fallback mutlak ke Bantul
            
            let destinationId = destinationOverride || customDestinationId;
            if (!destinationId && addresses.length > 0 && selectedAddressId) {
                const selectedAddr = addresses.find(a => a.id === selectedAddressId);
                if (selectedAddr?.rajaongkir_location_id) {
                    destinationId = selectedAddr.rajaongkir_location_id;
                } else if (selectedAddr?.city) {
                    destinationId = await getCityId(selectedAddr.city);
                }
            }
            if (!destinationId) {
                destinationId = await getCityId(buyer?.city);
            }
            if (!destinationId) destinationId = "31442"; // Fallback mutlak ke Bantul

            const response = await fetch('/api/shipping/cost', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    origin: originId, 
                    destination: destinationId, 
                    weight: 1000 * quantity
                })
            });

            // nilai cadangan jika perhitungan gagal
            const calculateFallbackCost = () => {
                let base = 25000;
                if (originId === destinationId) base = 8000;
                // menggunakan area DIY sebagai asumsi dasar
                else if (["31442", "31397", "31517", "31464", "31548", "31454"].includes(originId) && ["31442", "31397", "31517", "31464", "31548", "31454"].includes(destinationId)) base = 10000;
                else if (originId === "4878" || destinationId === "4878") base = 18000;
                
                const weightKg = Math.ceil(quantity * 1000 / 1000);
                return base * weightKg;
            };

            if (response.ok) {
                const resData = await response.json();
                if (Array.isArray(resData.results) && resData.results.length > 0) {
                    setShippingOptions(resData.results);
                    setShippingCost(resData.results[0].cost);
                    setShippingMethod(`${resData.results[0].code}-${resData.results[0].service}`);
                } else {
                    setShippingOptions([]);
                    setShippingCost(calculateFallbackCost());
                    setShippingMethod("fallback-regular");
                }
            } else {
                setShippingOptions([]);
                setShippingCost(calculateFallbackCost());
                setShippingMethod("fallback-regular");
            }
        } catch (e) {
            console.error(e);
            setShippingOptions([]);
            setShippingCost(25000); // nilai tarif mutlak jika pencarian gagal total
            setShippingMethod("fallback-error");
        } finally {
            setIsCalculatingShipping(false);
        }
    };

    const handleCheckout = async () => {
        setIsProcessing(true);
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) return;

        const total_price = subtotal + adminFee + shippingCost;

        // rekam data pesanan ke dalam database utama
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
                shipping_address: addresses.length > 0 && selectedAddressId ? `${addresses.find(a => a.id === selectedAddressId)?.full_address}, ${addresses.find(a => a.id === selectedAddressId)?.city} - ${addresses.find(a => a.id === selectedAddressId)?.postal_code}` : (buyer?.default_address + ', ' + buyer?.city + ' - ' + buyer?.postal_code),
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
            // ajukan permintaan token pembayaran ke sistem Midtrans
            const response = await fetch('/api/payment/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ order_id: order.id })
            });

            const paymentData = await response.json();

            if (!response.ok) {
                throw new Error(paymentData.error || 'Gagal mengambil token pembayaran');
            }

            // tampilkan antarmuka pembayaran Midtrans ke pengguna
            (window as any).snap.pay(paymentData.token, {
                onSuccess: async function (result: any) {
                    console.log('Payment success:', result);
                    // perbarui status pesanan di database lokal menjadi sukses dibayar
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
                    // alihkan pengguna jika mereka menutup pop-up sebelum membayar
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

            {/* kolom bagian alamat tujuan dan detail produk */}
            <div className="lg:col-span-8 flex flex-col gap-6">

                {/* bagian alamat pengiriman */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <MapPin className="text-brand-600" size={20} />
                            Alamat Pengiriman
                        </h2>
                        <button className="text-sm font-bold text-brand-600 hover:text-brand-700">Ubah Alamat</button>
                    </div>

                    {addresses.length > 0 ? (
                        <div className="space-y-3">
                            {addresses.map((addr) => (
                                <label key={addr.id} className={`block p-4 rounded-xl border cursor-pointer transition-all ${selectedAddressId === addr.id ? 'border-brand-500 bg-brand-50 ring-1 ring-brand-500' : 'border-gray-200 hover:border-brand-300'}`}>
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1">
                                            <input type="radio" name="address" checked={selectedAddressId === addr.id} onChange={() => setSelectedAddressId(addr.id)} className="w-4 h-4 text-brand-600 focus:ring-brand-500 border-gray-300" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-bold text-gray-900">{addr.recipient_name}</span>
                                                <span className="text-xs font-bold px-2 py-0.5 bg-gray-100 text-gray-600 rounded">{addr.label}</span>
                                                {addr.is_primary && <span className="text-xs font-bold px-2 py-0.5 bg-brand-100 text-brand-600 rounded">Utama</span>}
                                            </div>
                                            <p className="text-gray-600 text-sm">{addr.phone}</p>
                                            <p className="text-gray-600 text-sm mt-1">{addr.full_address}</p>
                                            <p className="text-gray-600 text-sm">{addr.city}, {addr.postal_code}</p>
                                        </div>
                                    </div>
                                </label>
                            ))}
                        </div>
                    ) : (
                        buyer?.default_address ? (
                            <div className="bg-brand-50/50 p-4 rounded-xl border border-brand-100">
                                <p className="font-bold text-gray-900 mb-1">{buyer.name} <span className="text-gray-500 font-normal text-sm ml-2">({buyer.phone || "No HP belum diisi"})</span></p>
                                <p className="text-gray-600 text-sm">{buyer.default_address}</p>
                                <p className="text-gray-600 text-sm">{buyer.city} - {buyer.postal_code}</p>
                            </div>
                        ) : (
                            <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium">
                                Anda belum melengkapi alamat pengiriman di profil Anda.
                            </div>
                        )
                    )}

                    {(!addresses.find(a => a.id === selectedAddressId)?.rajaongkir_location_id) && (
                        <div className="mt-4 p-4 border border-brand-200 bg-brand-50 rounded-xl">
                            <label className="block text-sm font-bold text-gray-900 mb-2">Konfirmasi Kota Pengiriman (Untuk Ongkos Kirim)</label>
                            <LocationAutocomplete
                                value={customDestinationId}
                                labelValue={customDestinationLabel}
                                onChange={(id, label) => {
                                    setCustomDestinationId(id);
                                    setCustomDestinationLabel(label);
                                    calculateShipping(id);
                                }}
                                placeholder="Cari nama kecamatan atau kota pengiriman..."
                            />
                            <p className="text-xs text-gray-500 mt-2">Pilih kota untuk menghitung tarif ongkos kirim ke alamat Anda.</p>
                        </div>
                    )}
                </div>

                {/* bagian rincian pesanan */}
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

                {/* opsi layanan pengiriman */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Truck className="text-green-500" size={20} />
                        Metode Pengiriman (RajaOngkir)
                    </h2>
                    {shippingOptions.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {shippingOptions.map((opt, i) => (
                                <button
                                    key={i}
                                    onClick={() => { setShippingMethod(`${opt.code}-${opt.service}`); setShippingCost(opt.cost); }}
                                    className={`p-3 rounded-xl border text-left transition-all ${shippingMethod === `${opt.code}-${opt.service}` ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-500/20' : 'border-gray-200 hover:border-brand-300'}`}
                                >
                                    <p className="font-bold text-gray-900 uppercase">{opt.code}</p>
                                    <p className="text-xs text-gray-500">{opt.service}</p>
                                    <p className="text-sm font-bold text-brand-600 mt-1">Rp{(opt.cost || 0).toLocaleString('id-ID')}</p>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="text-sm text-gray-500">
                           {isCalculatingShipping ? 'Menghitung tarif ongkos kirim...' : 'Tarif ongkos kirim tidak tersedia atau sedang terjadi kesalahan.'}
                        </div>
                    )}
                </div>

            </div>

            {/* kolom ringkasan pesanan dan aksi pembayaran */}
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
                            <span className="text-gray-500">Biaya Admin ({adminFeePercentage}%)</span>
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
                        disabled={isProcessing || isCalculatingShipping || (!buyer?.default_address && addresses.length === 0) || !shippingMethod}
                        className="w-full py-4 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-brand-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isProcessing ? (
                            <><Loader2 className="w-5 h-5 animate-spin" /> Memproses...</>
                        ) : (
                            <><CheckCircle2 className="w-5 h-5" /> Bayar Sekarang</>
                        )}
                    </button>
                    {(!buyer?.default_address && addresses.length === 0) ? (
                        <p className="text-xs text-red-500 text-center mt-3 font-medium">Alamat pengiriman wajib diisi.</p>
                    ) : (!shippingMethod || shippingOptions.length === 0) ? (
                        <p className="text-xs text-red-500 text-center mt-3 font-medium">Pilih kurir & ongkos kirim terlebih dahulu.</p>
                    ) : null}
                </div>
            </div>

        </div>
    );
}
