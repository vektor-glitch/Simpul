'use client';
import { useState } from 'react';
import Image from "next/image";
import Link from "next/link";
import { Package, Clock, CheckCircle2, XCircle, ShoppingCart, RefreshCw, Trash2, ShoppingBag, Star, MessageSquare, ArrowLeft } from "lucide-react";
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

export default function CartClient({ initialOrders, initialCartItems }: { initialOrders: any[], initialCartItems: any[] }) {
    const [orders, setOrders] = useState(initialOrders);
    const [cartItems, setCartItems] = useState(initialCartItems);
    const [isSyncing, setIsSyncing] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [isReceiving, setIsReceiving] = useState<string | null>(null);

    // State untuk Modal Ulasan
    const [reviewOrder, setReviewOrder] = useState<any | null>(null);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);

    const router = useRouter();
    const supabase = createClient();

    const pendingOrders = orders.filter(o => o.status === 'pending');
    const historyOrders = orders.filter(o => o.status !== 'pending');

    const handleSubmitReview = async () => {
        if (!reviewOrder) return;
        setIsSubmittingReview(true);
        try {
            // Dapatkan informasi producer_id. Product pasti punya producer_id, bisa diambil dari relasi jika belum diproject, 
            // tapi kita bisa ambil dari server, atau karena kita tahu order_id, kita bisa insert saja 
            // ke reviews dan biarkan trigger yg handle. Sayangnya producer_id itu NOT NULL di tabel reviews.
            // Kita cari dari product_id di order.
            const { data: productData, error: prodError } = await supabase.from('products').select('producer_id').eq('id', reviewOrder.product_id).single();
            if (prodError) throw prodError;

            const { error } = await supabase.from('reviews').insert({
                order_id: reviewOrder.id,
                buyer_id: reviewOrder.buyer_id,
                producer_id: productData.producer_id,
                rating: rating,
                comment: comment
            });

            if (error) throw error;

            toast.success("Ulasan berhasil dikirim!");
            // Update UI lokal: tandai bahwa pesanan ini sudah memiliki review
            setOrders(prev => prev.map(o => o.id === reviewOrder.id ? { ...o, reviews: [{ id: 'new', rating }] } : o));
            setReviewOrder(null);
            setRating(5);
            setComment("");
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Gagal mengirim ulasan.");
        } finally {
            setIsSubmittingReview(false);
            router.refresh();
        }
    };

    const handleSync = async (orderId: string) => {
        setIsSyncing(orderId);
        try {
            const res = await fetch('/api/payment/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ order_id: orderId })
            });
            const data = await res.json();

            if (res.ok) {
                // Update state lokal agar UI langsung berubah tanpa refresh
                setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: data.status } : o));
                if (data.status === 'pending') {
                    toast('Status masih tertunda (belum dibayar).', { icon: '⏳' });
                } else {
                    toast.success(`Pembayaran berhasil disinkronisasi! Status: ${data.status}`);
                }
            } else {
                toast.error(data.error || 'Gagal sinkronisasi');
            }
        } catch (err) {
            console.error(err);
            toast.error('Terjadi kesalahan jaringan.');
        } finally {
            setIsSyncing(null);
            router.refresh(); // refresh data server untuk memastikan sinkronisasi menyeluruh
        }
    };

    const handleDeleteCartItem = async (cartItemId: string) => {
        setIsDeleting(cartItemId);
        try {
            const { error } = await supabase.from('cart_items').delete().eq('id', cartItemId);
            if (error) throw error;
            setCartItems(prev => prev.filter(item => item.id !== cartItemId));
            toast.success("Barang dihapus dari keranjang");
        } catch (error) {
            console.error(error);
            toast.error("Gagal menghapus barang");
        } finally {
            setIsDeleting(null);
        }
    };

    const handleDeleteOrder = async (orderId: string) => {
        setIsDeleting(orderId);
        try {
            const { error } = await supabase.from('orders').delete().eq('id', orderId).eq('status', 'pending');
            if (error) throw error;
            setOrders(prev => prev.filter(order => order.id !== orderId));
            toast.success("Pesanan berhasil dibatalkan dan dihapus.");
        } catch (error) {
            console.error(error);
            toast.error("Gagal membatalkan pesanan.");
        } finally {
            setIsDeleting(null);
            router.refresh();
        }
    };

    const handleReceiveOrder = async (orderId: string) => {
        setIsReceiving(orderId);
        try {
            const { error } = await supabase.from('orders').update({ status: 'delivered', delivered_at: new Date().toISOString() }).eq('id', orderId).eq('status', 'shipped');
            if (error) throw error;
            setOrders(prev => prev.map(order => order.id === orderId ? { ...order, status: 'delivered', delivered_at: new Date().toISOString() } : order));
            toast.success("Pesanan berhasil dikonfirmasi selesai.");
        } catch (error) {
            console.error(error);
            toast.error("Gagal mengonfirmasi pesanan.");
        } finally {
            setIsReceiving(null);
            router.refresh();
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending': return <span className="flex items-center gap-1 text-yellow-700 bg-yellow-100 px-3 py-1 rounded-full text-xs font-bold"><Clock size={14} /> Menunggu Pembayaran</span>;
            case 'processed': return <span className="flex items-center gap-1 text-blue-700 bg-blue-100 px-3 py-1 rounded-full text-xs font-bold"><Package size={14} /> Diproses Penjual</span>;
            case 'shipped': return <span className="flex items-center gap-1 text-indigo-700 bg-indigo-100 px-3 py-1 rounded-full text-xs font-bold"><Package size={14} /> Sedang Dikirim</span>;
            case 'delivered': return <span className="flex items-center gap-1 text-green-700 bg-green-100 px-3 py-1 rounded-full text-xs font-bold"><CheckCircle2 size={14} /> Pesanan Selesai</span>;
            case 'cancelled': return <span className="flex items-center gap-1 text-red-700 bg-red-100 px-3 py-1 rounded-full text-xs font-bold"><XCircle size={14} /> Dibatalkan</span>;
            default: return <span className="text-gray-700 bg-gray-100 px-3 py-1 rounded-full text-xs font-bold">{status}</span>;
        }
    };

    const OrderTimeline = ({ order }: { order: any }) => {
        // Simulasi waktu jika data di DB masih kosong (karena fitur input dari penjual belum dibuat)
        const createdDate = new Date(order.created_at);
        const tProcessed = order.processed_at ? new Date(order.processed_at) : new Date(createdDate.getTime() + 1000 * 60 * 60 * 2);
        const tPacked = order.packed_at ? new Date(order.packed_at) : new Date(createdDate.getTime() + 1000 * 60 * 60 * 6);
        const tShipped = order.shipped_at ? new Date(order.shipped_at) : new Date(createdDate.getTime() + 1000 * 60 * 60 * 24);
        const tDelivered = order.delivered_at ? new Date(order.delivered_at) : new Date(createdDate.getTime() + 1000 * 60 * 60 * 72);

        const formatTime = (d: Date) => {
            return `${d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}, ${d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`;
        }

        const statusLevels = ['processed', 'packed', 'shipped', 'delivered'];
        const currentLevelIndex = statusLevels.indexOf(order.status);

        if (order.status === 'cancelled') {
            return (
                <div className="bg-red-50 rounded-lg p-4 text-center border border-red-100 mt-2">
                    <p className="text-sm text-red-700 font-bold">❌ Pesanan ini dibatalkan</p>
                </div>
            );
        }

        const resi = order.receipt_number || "JNE1234567890"; // Simulasi resi

        return (
            <div className="flex flex-col gap-3 mt-4 p-4 bg-gray-50 rounded-xl border border-gray-100 text-sm">
                <div className="flex items-start gap-3">
                    <span className="shrink-0 text-base">{currentLevelIndex >= 0 ? '✅' : '⚪'}</span>
                    <div className="flex flex-col">
                        <span className={`font-semibold ${currentLevelIndex >= 0 ? 'text-gray-900' : 'text-gray-400'}`}>Diproses</span>
                        {currentLevelIndex >= 0 && <span className="text-xs text-gray-500">— {formatTime(tProcessed)}</span>}
                    </div>
                </div>

                <div className="flex items-start gap-3">
                    <span className="shrink-0 text-base">{currentLevelIndex >= 1 ? '✅' : '⚪'}</span>
                    <div className="flex flex-col">
                        <span className={`font-semibold ${currentLevelIndex >= 1 ? 'text-gray-900' : 'text-gray-400'}`}>Dikemas</span>
                        {currentLevelIndex >= 1 && <span className="text-xs text-gray-500">— {formatTime(tPacked)}</span>}
                    </div>
                </div>

                <div className="flex items-start gap-3">
                    <span className="shrink-0 text-base">{currentLevelIndex >= 2 ? (currentLevelIndex === 2 ? '🔵' : '✅') : '⚪'}</span>
                    <div className="flex flex-col">
                        <span className={`font-semibold ${currentLevelIndex >= 2 ? 'text-gray-900' : 'text-gray-400'}`}>Dikirim</span>
                        {currentLevelIndex >= 2 && <span className="text-xs text-gray-500">— {formatTime(tShipped)} <span className="text-brand-600 font-medium">(resi: {resi})</span></span>}
                    </div>
                </div>

                <div className="flex items-start gap-3">
                    <span className="shrink-0 text-base">{currentLevelIndex >= 3 ? '✅' : '⚪'}</span>
                    <div className="flex flex-col">
                        <span className={`font-semibold ${currentLevelIndex >= 3 ? 'text-green-600' : 'text-gray-400'}`}>Diterima</span>
                        {currentLevelIndex >= 3 && <span className="text-xs text-green-600 font-medium">— selesai</span>}
                    </div>
                </div>
            </div>
        );
    };

    const OrderCard = ({ order }: { order: any }) => {
        const storeName = order.product?.users?.producer_profiles?.business_name || "Toko Tidak Diketahui";
        return (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col md:flex-row gap-6 hover:shadow-md transition-shadow">
                <div className="flex-1">
                    <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-4">
                        <div>
                            <p className="text-xs font-bold text-gray-400 mb-1">
                                ID: {order.id.split('-')[0].toUpperCase()} • {new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                            <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                {storeName}
                                {order.product?.users?.phone && (
                                    <a 
                                        href={`https://wa.me/${order.product.users.phone.replace(/^0/, '62')}`} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-green-500 hover:text-green-600 transition-colors ml-2"
                                        title="Chat WA"
                                    >
                                        <MessageSquare size={16} />
                                    </a>
                                )}
                            </h3>
                        </div>
                        {getStatusBadge(order.status)}
                    </div>

                    <div className="flex gap-4">
                        <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200 shrink-0">
                            {order.product?.image_url ? (
                                <Image src={order.product.image_url} alt={order.product.name} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover" />
                            ) : (
                                <div className="w-full h-full bg-gray-100"></div>
                            )}
                        </div>
                        <div className="flex flex-col justify-center">
                            <h4 className="font-bold text-gray-900 text-lg">{order.product?.name || "Produk Tidak Ditemukan"}</h4>
                            <p className="text-gray-500 text-sm">
                                {order.quantity} x Rp{(order.unit_price || order.product?.price_final || 0).toLocaleString('id-ID')}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="md:w-64 flex flex-col justify-between md:border-l md:border-gray-100 md:pl-6 border-t md:border-t-0 pt-4 md:pt-0">
                    <div>
                        <p className="text-xs text-gray-500 mb-1">Total Tagihan</p>
                        <p className="text-xl font-extrabold text-brand-600 mb-2">Rp{order.total_price.toLocaleString('id-ID')}</p>
                    </div>

                    {order.status === 'pending' ? (
                        <div className="space-y-2 mt-4">
                            <button
                                onClick={() => handleSync(order.id)}
                                disabled={isSyncing === order.id}
                                className="w-full py-2 flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-600 disabled:bg-yellow-300 text-white rounded-lg font-bold text-sm transition-colors"
                            >
                                {isSyncing === order.id ? <RefreshCw className="animate-spin" size={16} /> : <RefreshCw size={16} />}
                                Cek Pembayaran
                            </button>
                            <button
                                onClick={() => {
                                    if (confirm("Apakah Anda yakin ingin membatalkan pesanan ini?")) {
                                        handleDeleteOrder(order.id);
                                    }
                                }}
                                disabled={isDeleting === order.id}
                                className="w-full py-2 flex items-center justify-center gap-2 bg-white border border-gray-300 hover:bg-red-50 text-red-600 hover:text-red-700 hover:border-red-200 rounded-lg font-bold text-sm transition-colors"
                            >
                                {isDeleting === order.id ? <RefreshCw className="animate-spin" size={16} /> : <Trash2 size={16} />}
                                Batalkan
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col h-full justify-between mt-4 md:mt-0">
                            <OrderTimeline order={order} />

                            {order.status === 'shipped' && (
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    <button
                                        onClick={() => handleReceiveOrder(order.id)}
                                        disabled={isReceiving === order.id}
                                        className="w-full py-2 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg font-bold text-sm transition-colors"
                                    >
                                        {isReceiving === order.id ? <RefreshCw className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}
                                        Pesanan Diterima
                                    </button>
                                </div>
                            )}

                            {order.status === 'delivered' && (
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    {order.reviews && (Array.isArray(order.reviews) ? order.reviews.length > 0 : true) ? (
                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                            <CheckCircle2 className="w-4 h-4 text-brand-500" />
                                            Anda sudah memberikan ulasan
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setReviewOrder(order)}
                                            className="w-full py-2 flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-bold text-sm transition-colors"
                                        >
                                            <Star size={16} className="fill-white" />
                                            Beri Ulasan
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-12">
            <div className="mb-6">
                <Link href="/marketplace" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-brand-600 transition-colors font-medium">
                    <ArrowLeft className="w-4 h-4" /> Kembali ke Marketplace
                </Link>
            </div>
            {/* Sesi Keranjang */}
            <section>
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <ShoppingCart className="text-brand-600" />
                    Keranjang Belanja
                </h2>

                {cartItems.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center shadow-sm">
                        <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 font-medium">Keranjang Anda masih kosong</p>
                        <Link href="/marketplace" className="inline-block mt-4 text-brand-600 hover:text-brand-700 font-bold">
                            Jelajahi Produk
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {cartItems.map((item) => {
                            const storeName = item.product?.users?.producer_profiles?.business_name || "Toko Tidak Diketahui";
                            const subtotal = (item.product?.price_final || 0) * item.quantity;

                            return (
                                <div key={item.id} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col md:flex-row gap-6 hover:shadow-md transition-shadow">
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-4">
                                            <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                                {storeName}
                                                {item.product?.users?.phone && (
                                                    <a 
                                                        href={`https://wa.me/${item.product.users.phone.replace(/^0/, '62')}`} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="text-green-500 hover:text-green-600 transition-colors ml-2"
                                                        title="Chat WA"
                                                    >
                                                        <MessageSquare size={16} />
                                                    </a>
                                                )}
                                            </h3>
                                            <button
                                                onClick={() => handleDeleteCartItem(item.id)}
                                                disabled={isDeleting === item.id}
                                                className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                                                title="Hapus dari keranjang"
                                            >
                                                {isDeleting === item.id ? <RefreshCw className="animate-spin" size={18} /> : <Trash2 size={18} />}
                                            </button>
                                        </div>

                                        <div className="flex gap-4">
                                            <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200 shrink-0 cursor-pointer" onClick={() => router.push(`/marketplace/${item.product_id}`)}>
                                                {item.product?.image_url ? (
                                                    <Image src={item.product.image_url} alt={item.product.name} fill sizes="80px" className="object-cover" />
                                                ) : (
                                                    <div className="w-full h-full bg-gray-100"></div>
                                                )}
                                            </div>
                                            <div className="flex flex-col justify-center">
                                                <h4 className="font-bold text-gray-900 text-lg cursor-pointer hover:text-brand-600 transition-colors" onClick={() => router.push(`/marketplace/${item.product_id}`)}>
                                                    {item.product?.name || "Produk Tidak Ditemukan"}
                                                </h4>
                                                <p className="text-gray-500 text-sm">
                                                    {item.quantity} {item.product?.unit} x Rp{(item.product?.price_final || 0).toLocaleString('id-ID')}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="md:w-56 flex flex-col justify-end md:border-l md:border-gray-100 md:pl-6 border-t md:border-t-0 pt-4 md:pt-0">
                                        <p className="text-xs text-gray-500 mb-1">Subtotal (belum ongkir)</p>
                                        <p className="text-xl font-extrabold text-brand-600 mb-4">Rp{subtotal.toLocaleString('id-ID')}</p>
                                        <button
                                            onClick={() => router.push(`/checkout?product_id=${item.product_id}&qty=${item.quantity}`)}
                                            className="w-full py-2 flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-bold text-sm transition-colors"
                                        >
                                            <ShoppingBag size={16} />
                                            Beli Sekarang
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>

            {/* Sesi Belum Dibayar */}
            {pendingOrders.length > 0 && (
                <section>
                    <h2 className="text-xl font-bold text-yellow-700 mb-4 flex items-center gap-2">
                        <Clock className="text-yellow-500" />
                        Belum Dibayar
                    </h2>
                    <div className="space-y-4">
                        {pendingOrders.map(order => <OrderCard key={order.id} order={order} />)}
                    </div>
                </section>
            )}

            {/* Sesi Riwayat Pesanan */}
            {historyOrders.length > 0 && (
                <section>
                    <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Package className="text-brand-600" />
                        Riwayat Pesanan
                    </h2>
                    <div className="space-y-4">
                        {historyOrders.map(order => <OrderCard key={order.id} order={order} />)}
                    </div>
                </section>
            )}

            {/* Modal Ulasan */}
            {reviewOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                                <MessageSquare className="w-5 h-5 text-brand-600" />
                                Nilai Produk Ini
                            </h3>
                            <button
                                onClick={() => setReviewOrder(null)}
                                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                            >
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-6">
                            <div className="flex gap-4 mb-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <div className="w-16 h-16 relative rounded-lg overflow-hidden shrink-0 border border-gray-200">
                                    {reviewOrder.product?.image_url ? (
                                        <Image src={reviewOrder.product.image_url} alt={reviewOrder.product.name} fill sizes="64px" className="object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-gray-200" />
                                    )}
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 line-clamp-1">{reviewOrder.product?.name}</h4>
                                    <p className="text-sm text-gray-500">{reviewOrder.product?.users?.producer_profiles?.business_name}</p>
                                </div>
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Berapa bintang untuk produk ini?</label>
                                <div className="flex gap-2 justify-center py-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            onClick={() => setRating(star)}
                                            className="focus:outline-none transition-transform hover:scale-110"
                                        >
                                            <Star
                                                className={`w-10 h-10 ${rating >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 fill-gray-100'}`}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Tulis ulasan Anda (Opsional)</label>
                                <textarea
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="Bagaimana kualitas produk ini? Apakah pengirimannya cepat?"
                                    className="w-full border border-gray-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all min-h-[100px] resize-y"
                                />
                            </div>

                            <button
                                onClick={handleSubmitReview}
                                disabled={isSubmittingReview}
                                className="w-full bg-brand-600 hover:bg-brand-700 disabled:bg-brand-400 text-white font-bold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
                            >
                                {isSubmittingReview ? (
                                    <>
                                        <RefreshCw className="animate-spin w-5 h-5" />
                                        Menyimpan...
                                    </>
                                ) : (
                                    "Kirim Ulasan"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

