"use client";

import { useState } from "react";
import { Search, MapPin, Package, Clock, CheckCircle2, Truck } from "lucide-react";
import OrderUpdateModal from "./OrderUpdateModal";

export default function OrdersClient({ initialOrders }: any) {
    const [orders, setOrders] = useState(initialOrders);
    const [statusFilter, setStatusFilter] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

    const filteredOrders = orders.filter((o: any) => {
        const matchesStatus = statusFilter === "all" || o.status === statusFilter;
        const matchesSearch = 
            o.product?.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
            o.buyer?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            o.id.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const handleUpdateSuccess = (updatedOrder: any) => {
        setOrders((prev: any) => prev.map((o: any) => o.id === updatedOrder.id ? { ...o, ...updatedOrder } : o));
        setSelectedOrder(null);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending': return <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><Clock size={12}/> Menunggu Diproses</span>;
            case 'processed': return <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><Package size={12}/> Diproses</span>;
            case 'packed': return <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><Package size={12}/> Dikemas</span>;
            case 'shipped': return <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><Truck size={12}/> Dikirim</span>;
            case 'delivered': return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><CheckCircle2 size={12}/> Selesai</span>;
            case 'cancelled': return <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-bold w-fit">Dibatalkan</span>;
            default: return <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-bold w-fit">{status}</span>;
        }
    };

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-extrabold text-gray-900">Kelola Pesanan</h1>
                <p className="text-gray-500">Pantau dan perbarui status pesanan dari pembeli.</p>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden mb-6 p-4 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input 
                        type="text" 
                        placeholder="Cari ID pesanan, pembeli, atau produk..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                    />
                </div>
                <select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-medium text-gray-700"
                >
                    <option value="all">Semua Status</option>
                    <option value="pending">Menunggu Diproses</option>
                    <option value="processed">Diproses</option>
                    <option value="packed">Dikemas</option>
                    <option value="shipped">Dikirim</option>
                    <option value="delivered">Selesai</option>
                </select>
            </div>

            {filteredOrders.length === 0 ? (
                <div className="bg-white rounded-3xl border border-dashed border-gray-300 p-12 text-center">
                    <div className="w-16 h-16 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Package size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Tidak Ada Pesanan</h3>
                    <p className="text-gray-500">Belum ada pesanan yang sesuai dengan filter/pencarian Anda.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredOrders.map((order: any) => (
                        <div key={order.id} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex flex-col md:flex-row gap-6">
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-4">
                                        <div>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">ID: {order.id.split('-')[0]}</p>
                                            <h3 className="font-bold text-gray-900">{order.buyer?.name}</h3>
                                        </div>
                                        {getStatusBadge(order.status)}
                                    </div>
                                    
                                    <div className="flex gap-4 mb-4">
                                        <div className="w-16 h-16 bg-gray-100 rounded-xl overflow-hidden shrink-0">
                                            {order.product?.image_url ? (
                                                <img src={order.product.image_url} alt="Produk" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400"><Package size={20}/></div>
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900">{order.product?.name}</h4>
                                            <p className="text-sm text-gray-500">{order.quantity} item x Rp{order.product?.price_producer.toLocaleString('id-ID')}</p>
                                            <p className="text-brand-600 font-bold mt-1">Total Pendapatan: Rp{(order.quantity * order.product?.price_producer).toLocaleString('id-ID')}</p>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 p-4 rounded-xl flex items-start gap-3">
                                        <MapPin className="text-gray-400 shrink-0 mt-0.5" size={18} />
                                        <div className="text-sm">
                                            <p className="font-bold text-gray-700 mb-1">Alamat Pengiriman:</p>
                                            <p className="text-gray-600">{order.shipping_address}</p>
                                        </div>
                                    </div>
                                    
                                    {order.receipt_number && (
                                        <div className="mt-3 text-sm flex items-center gap-2">
                                            <span className="text-gray-500">No. Resi:</span>
                                            <span className="font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded">{order.receipt_number}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-col justify-end border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6 min-w-[200px]">
                                    <button 
                                        onClick={() => setSelectedOrder(order)}
                                        disabled={['delivered', 'cancelled', 'shipped'].includes(order.status)}
                                        className={`w-full font-bold py-3 rounded-xl transition-colors ${
                                            ['delivered', 'cancelled', 'shipped'].includes(order.status)
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            : 'bg-brand-600 hover:bg-brand-700 text-white'
                                        }`}
                                    >
                                        {order.status === 'delivered' ? 'Selesai' : 
                                         order.status === 'cancelled' ? 'Dibatalkan' :
                                         order.status === 'shipped' ? 'Menunggu Feedback' : 
                                         'Update Status'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {selectedOrder && (
                <OrderUpdateModal 
                    order={selectedOrder}
                    onClose={() => setSelectedOrder(null)}
                    onSuccess={handleUpdateSuccess}
                />
            )}
        </div>
    );
}
