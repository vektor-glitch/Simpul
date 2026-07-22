import { createClient } from "@/lib/supabase/server";
import { AlertCircle, ArrowUpRight, Package, ShoppingCart, Wallet } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function ProducerDashboardPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    // Cek apakah profil sudah lengkap
    const { data: userData } = await supabase
        .from('users')
        .select('verified, name, phone')
        .eq('id', user.id)
        .single();
        
    const { data: profileData } = await supabase
        .from('producer_profiles')
        .select('business_name, location')
        .eq('user_id', user.id)
        .maybeSingle();

    const isComplete = userData?.name && userData?.phone && profileData?.business_name && profileData?.location;

    if (!isComplete) {
        redirect("/dashboard/producer/profile");
    }
    
    const isVerified = userData?.verified || false;

    // Ambil statistik produk aktif
    const { count: activeProducts } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('producer_id', user.id)
        .eq('is_active', true);

    // Ambil data pesanan untuk statistik (join dengan products untuk memastikan ini pesanan produk dia)
    const { data: orders } = await supabase
        .from('orders')
        .select(`
            id,
            status,
            quantity,
            created_at,
            product:products!inner (
                producer_id,
                name,
                price_producer,
                image_url
            )
        `)
        .eq('product.producer_id', user.id)
        .order('created_at', { ascending: false });

    const allOrders = (orders || []).map(o => ({
        ...o,
        product: (Array.isArray(o.product) ? o.product[0] : o.product) as any
    }));
    
    // Hitung pesanan aktif (berjalan)
    const activeStatuses = ['pending', 'processed', 'packed', 'shipped'];
    const activeOrders = allOrders.filter(o => activeStatuses.includes(o.status));
    const activeCount = activeOrders.length;

    // Hitung total pendapatan (hanya dari yang sudah diproses ke atas, abaikan pending/cancelled)
    const validStatuses = ['processed', 'packed', 'shipped', 'delivered'];
    const totalRevenue = allOrders
        .filter(o => validStatuses.includes(o.status))
        .reduce((sum, o) => sum + (o.quantity * (o.product?.price_producer || 0)), 0);

    // -- Hitung Data Grafik 7 Hari Terakhir ---
    const last7Days = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return {
            date: d.toISOString().split('T')[0],
            dayName: d.toLocaleDateString('id-ID', { weekday: 'short' }),
            revenue: 0
        };
    });

    allOrders.forEach(o => {
        if (validStatuses.includes(o.status)) {
            const orderDate = new Date(o.created_at).toISOString().split('T')[0];
            const dayMatch = last7Days.find(d => d.date === orderDate);
            if (dayMatch) {
                dayMatch.revenue += (o.quantity * (o.product?.price_producer || 0));
            }
        }
    });

    const maxRevenue = Math.max(...last7Days.map(d => d.revenue), 1000); // minimal 1000 agar tidak bagi 0
    // -----------------------------------------

    return (
        <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Overview Usaha</h1>
            <p className="text-gray-500 mb-8">Selamat datang kembali, pantau performa jualan Anda hari ini.</p>

            {!isVerified && (
                <div className="mb-8 bg-yellow-50 border border-yellow-200 rounded-2xl p-6 flex items-start gap-4 shadow-sm">
                    <div className="w-10 h-10 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center shrink-0 mt-1">
                        <AlertCircle size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-yellow-900 mb-1">Akun Menunggu Verifikasi</h3>
                        <p className="text-yellow-700 mb-3">
                            Akun Anda saat ini sedang dalam antrean verifikasi oleh tim Admin. Selama masa tunggu, Anda belum bisa menambahkan produk atau membuat Pool baru.
                        </p>
                        <Link href="/dashboard/producer/profile" className="inline-flex items-center gap-2 text-sm font-bold text-yellow-800 hover:text-yellow-900 bg-yellow-200 hover:bg-yellow-300 px-4 py-2 rounded-lg transition-colors">
                            Lengkapi Profil Usaha Anda
                        </Link>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Card Pendapatan */}
                <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform duration-300">
                        <Wallet size={80} />
                    </div>
                    <div className="flex items-center gap-3 text-gray-500 font-medium mb-4 relative">
                        <Wallet size={20} className="text-brand-600" /> Total Pendapatan Bersih
                    </div>
                    <div className="text-3xl font-black text-gray-900 relative">
                        Rp{totalRevenue.toLocaleString('id-ID')}
                    </div>
                    <div className="mt-4 text-sm text-green-600 font-medium flex items-center gap-1 relative">
                        <ArrowUpRight size={16} /> Data seluruh waktu
                    </div>
                </div>

                {/* Card Pesanan Pending */}
                <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform duration-300">
                        <ShoppingCart size={80} />
                    </div>
                    <div className="flex items-center gap-3 text-gray-500 font-medium mb-4 relative">
                        <ShoppingCart size={20} className="text-orange-500" /> Pesanan Berjalan
                    </div>
                    <div className="text-3xl font-black text-gray-900 relative">
                        {activeCount} <span className="text-xl font-bold text-gray-400">Pesanan</span>
                    </div>
                    <div className="mt-4">
                        <Link href="/dashboard/producer/orders" className="text-sm font-bold text-orange-600 hover:text-orange-700">
                            Lihat Pesanan &rarr;
                        </Link>
                    </div>
                </div>

                {/* Card Produk Aktif */}
                <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform duration-300">
                        <Package size={80} />
                    </div>
                    <div className="flex items-center gap-3 text-gray-500 font-medium mb-4 relative">
                        <Package size={20} className="text-blue-500" /> Produk Aktif
                    </div>
                    <div className="text-3xl font-black text-gray-900 relative">
                        {activeProducts || 0} <span className="text-xl font-bold text-gray-400">Item</span>
                    </div>
                    <div className="mt-4">
                        <Link href="/dashboard/producer/products" className="text-sm font-bold text-blue-600 hover:text-blue-700">
                            Kelola Inventori &rarr;
                        </Link>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-900">Pesanan Terbaru</h2>
                        <Link href="/dashboard/producer/orders" className="text-sm font-bold text-brand-600 hover:text-brand-700">Lihat Semua</Link>
                    </div>
                    
                    {allOrders.slice(0, 5).length === 0 ? (
                        <div className="text-center py-8 text-gray-500">Belum ada pesanan masuk.</div>
                    ) : (
                        <div className="space-y-4">
                            {allOrders.slice(0, 5).map(order => (
                                <div key={order.id} className="flex items-center gap-4 p-4 rounded-2xl border border-gray-100 bg-gray-50 hover:bg-white hover:border-gray-200 transition-colors">
                                    <div className="w-12 h-12 bg-gray-200 rounded-xl overflow-hidden shrink-0">
                                        {order.product?.image_url ? (
                                            <img src={order.product.image_url} alt="Produk" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400"><Package size={20} /></div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-gray-900 truncate">{order.product?.name}</h4>
                                        <p className="text-sm text-gray-500">{order.quantity} item • Rp{(order.product?.price_producer * order.quantity).toLocaleString('id-ID')}</p>
                                    </div>
                                    <div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                            order.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                                            order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                                            'bg-blue-100 text-blue-700'
                                        }`}>
                                            {order.status.toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm flex flex-col">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Pendapatan 7 Hari Terakhir</h2>
                    <div className="flex-1 flex items-end gap-2 h-48 mt-auto pb-6 relative group">
                        {/* Garis bantu background */}
                        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-6">
                            <div className="border-t border-dashed border-gray-200 w-full"></div>
                            <div className="border-t border-dashed border-gray-200 w-full"></div>
                            <div className="border-t border-dashed border-gray-200 w-full"></div>
                        </div>
                        
                        {last7Days.map((day, i) => {
                            const height = `${(day.revenue / maxRevenue) * 100}%`;
                            const isToday = i === 6;
                            return (
                                <div key={day.date} className="bar-chart-item h-full flex flex-col justify-end relative z-10 group/bar">
                                    {/* Tooltip pada hover */}
                                    <div className="opacity-0 group-hover/bar:opacity-100 absolute -top-8 bg-gray-900 text-white text-xs font-bold py-1 px-2 rounded whitespace-nowrap transition-opacity pointer-events-none z-20 shadow-lg">
                                        Rp{day.revenue.toLocaleString('id-ID')}
                                    </div>
                                    <div 
                                        className={`bar-chart-bar w-full ${isToday ? 'active' : ''}`} 
                                        style={{ height: height === '0%' ? '5%' : height }}
                                    ></div>
                                    <span className={`text-xs font-bold mt-2 ${isToday ? 'text-brand-600' : 'text-gray-400'}`}>{day.dayName}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
