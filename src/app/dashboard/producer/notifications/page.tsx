"use client";

import { useEffect, useState } from "react";
import { Bell, ShoppingCart, Package, Info, AlertTriangle, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function NotificationsPage() {
    const supabase = createClient();
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (data) {
                setNotifications(data);
                
                // Tandai semua sebagai sudah dibaca
                const unreadIds = data.filter(n => !n.is_read).map(n => n.id);
                if (unreadIds.length > 0) {
                    await supabase
                        .from('notifications')
                        .update({ is_read: true })
                        .in('id', unreadIds);
                }
            }
        } catch (error) {
            console.error("Error fetching notifications:", error);
        } finally {
            setLoading(false);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'order': return <ShoppingCart className="text-brand-600" />;
            case 'pool': return <Package className="text-blue-600" />;
            case 'system': return <Info className="text-gray-600" />;
            case 'alert': return <AlertTriangle className="text-red-600" />;
            case 'success': return <CheckCircle2 className="text-green-600" />;
            default: return <Bell className="text-brand-600" />;
        }
    };

    const getBgColor = (type: string) => {
        switch (type) {
            case 'order': return 'bg-brand-50 border-brand-100';
            case 'pool': return 'bg-blue-50 border-blue-100';
            case 'system': return 'bg-gray-50 border-gray-100';
            case 'alert': return 'bg-red-50 border-red-100';
            case 'success': return 'bg-green-50 border-green-100';
            default: return 'bg-brand-50 border-brand-100';
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Memuat notifikasi...</div>;
    }

    return (
        <div className="max-w-4xl mx-auto pb-12">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Pusat Notifikasi</h1>
                    <p className="text-gray-500">Pembaruan terkini seputar pesanan dan kolaborasi Pool Anda.</p>
                </div>
                <div className="w-12 h-12 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center">
                    <Bell size={24} />
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
                {notifications.length === 0 ? (
                    <div className="p-16 text-center flex flex-col items-center">
                        <div className="w-20 h-20 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mb-4">
                            <Bell size={40} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Belum Ada Notifikasi</h3>
                        <p className="text-gray-500">Saat ini Anda tidak memiliki pemberitahuan baru.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {notifications.map((notif) => (
                            <div key={notif.id} className={`p-6 flex items-start gap-4 hover:bg-gray-50 transition-colors ${!notif.is_read ? 'bg-blue-50/30' : ''}`}>
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${getBgColor(notif.type)}`}>
                                    {getIcon(notif.type)}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-start justify-between gap-4">
                                        <h4 className={`font-bold text-gray-900 ${!notif.is_read ? 'text-brand-700' : ''}`}>
                                            {notif.title}
                                        </h4>
                                        <span className="text-xs font-medium text-gray-400 whitespace-nowrap">
                                            {new Date(notif.created_at).toLocaleDateString('id-ID', {
                                                day: 'numeric', month: 'short', year: 'numeric',
                                                hour: '2-digit', minute: '2-digit'
                                            })}
                                        </span>
                                    </div>
                                    <p className="text-gray-600 mt-1">{notif.message}</p>
                                    
                                    {notif.link && (
                                        <a href={notif.link} className="inline-block mt-3 text-sm font-bold text-brand-600 hover:text-brand-700">
                                            Lihat Detail &rarr;
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
