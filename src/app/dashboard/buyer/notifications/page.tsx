"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Bell, Loader2, CheckCircle2, ChevronRight, Inbox, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function NotificationsPage() {
    const supabase = createClient();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [notifications, setNotifications] = useState<any[]>([]);

    const fetchNotifications = async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
            .from("notifications")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

        if (!error && data) {
            setNotifications(data);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchNotifications();
    }, [supabase]);

    const markAsRead = async (id: string, link: string | null) => {
        await supabase.from("notifications").update({ is_read: true }).eq("id", id);
        if (link) {
            router.push(link);
        } else {
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        }
    };

    const markAllAsRead = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        
        await supabase.from("notifications").update({ is_read: true }).eq("user_id", user.id).eq("is_read", false);
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        toast.success("Semua notifikasi ditandai sudah dibaca");
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-brand-600 gap-4">
                <div className="relative">
                    <div className="absolute inset-0 bg-brand-400 rounded-full blur-md opacity-30 animate-pulse"></div>
                    <Loader2 className="animate-spin w-10 h-10 relative z-10" />
                </div>
                <p className="text-gray-500 font-medium animate-pulse">Memuat notifikasi...</p>
            </div>
        );
    }

    const unreadCount = notifications.filter(n => !n.is_read).length;

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-10">
                <button onClick={() => router.back()} className="group inline-flex items-center gap-3 text-sm text-gray-500 hover:text-brand-600 font-medium mb-8 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center transition-all duration-300 group-hover:bg-brand-50 group-hover:text-brand-600 group-hover:-translate-x-1 shadow-sm">
                        <ArrowLeft size={16} />
                    </div>
                    Kembali
                </button>
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                    <div className="relative">
                        <div className="absolute -inset-4 rounded-xl bg-gradient-to-r from-brand-100 to-indigo-50 opacity-50 blur-xl -z-10"></div>
                        <h1 className="relative text-3xl sm:text-4xl font-extrabold text-gray-900 flex items-center gap-3 tracking-tight">
                            <Bell className="w-8 h-8 text-green-500 drop-shadow-sm" />
                            Notifikasi
                            {unreadCount > 0 && (
                                <span className="bg-gradient-to-r from-red-500 to-rose-500 text-white text-xs px-3 py-1.5 rounded-full font-bold shadow-md shadow-red-500/20 transform transition-transform hover:scale-105">
                                    {unreadCount} Baru
                                </span>
                            )}
                        </h1>
                        <p className="text-gray-500 mt-4 text-base ml-1">Pemberitahuan aktivitas, promo, dan status pesanan Anda.</p>
                    </div>
                    {unreadCount > 0 && (
                        <button onClick={markAllAsRead} className="text-sm font-bold text-brand-700 bg-white border border-brand-200 shadow-sm hover:shadow-md hover:border-brand-300 hover:text-brand-800 px-6 py-3 rounded-2xl transition-all duration-300 flex items-center gap-2 hover:-translate-y-1 active:translate-y-0">
                            <CheckCircle2 size={18} className="text-brand-500" /> Tandai Semua Dibaca
                        </button>
                    )}
                </div>
            </div>

            {notifications.length === 0 ? (
                <div className="relative overflow-hidden bg-white rounded-3xl border border-gray-100 shadow-sm p-16 text-center transform transition-all duration-500 hover:shadow-md">
                    <div className="absolute inset-0 bg-gradient-to-b from-gray-50/50 to-white pointer-events-none"></div>
                    <div className="relative z-10">
                        <div className="w-24 h-24 bg-gradient-to-tr from-gray-100 to-gray-50 text-gray-300 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner ring-4 ring-white">
                            <Inbox size={40} className="opacity-70" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-3 tracking-tight">Belum Ada Notifikasi</h3>
                        <p className="text-gray-500 max-w-sm mx-auto text-base leading-relaxed">Pemberitahuan pesanan dan info penting lainnya akan muncul di sini.</p>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    {notifications.map((notif, index) => (
                        <div 
                            key={notif.id}
                            onClick={() => markAsRead(notif.id, notif.link)}
                            className={`group p-5 sm:p-6 rounded-2xl border backdrop-blur-sm transition-all duration-300 cursor-pointer flex gap-4 sm:gap-6
                            ${notif.is_read 
                                ? 'bg-white/90 border-gray-100 hover:bg-white hover:shadow-md hover:-translate-y-1 hover:border-gray-200' 
                                : 'bg-gradient-to-br from-brand-50/80 to-white border-brand-200 shadow-sm hover:shadow-md hover:-translate-y-1 hover:border-brand-300'}`}
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            <div className="relative mt-1">
                                {notif.type === 'order_status' ? (
                                    <div className={`w-10 h-10 flex items-center justify-center transition-all duration-500 ${notif.is_read ? 'text-gray-400 group-hover:text-gray-600' : 'text-green-500 group-hover:scale-110'}`}>
                                        <Bell size={26} className={!notif.is_read ? 'animate-pulse' : ''} />
                                    </div>
                                ) : (
                                    <div className="w-10 h-10 flex items-center justify-center transition-all duration-500 group-hover:scale-110 text-gray-400 group-hover:text-gray-600">
                                        <Bell size={26} />
                                    </div>
                                )}
                                {!notif.is_read && (
                                    <span className="absolute top-0 right-1 flex h-3 w-3">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                      <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500 border-2 border-white"></span>
                                    </span>
                                )}
                            </div>
                            <div className="flex-1 pt-1">
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-2">
                                    <h4 className={`font-bold text-base sm:text-lg tracking-tight ${notif.is_read ? 'text-gray-600' : 'text-gray-900'}`}>{notif.title}</h4>
                                    <span className={`text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap self-start sm:self-auto ${notif.is_read ? 'text-gray-500 bg-gray-100' : 'text-brand-700 bg-brand-100 shadow-sm'}`}>
                                        {new Date(notif.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <p className={`text-sm leading-relaxed ${notif.is_read ? 'text-gray-500' : 'text-gray-700 font-medium'}`}>{notif.message}</p>
                            </div>
                            {notif.link && (
                                <div className="flex items-center justify-center ml-2 hidden sm:flex">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${notif.is_read ? 'bg-gray-50 text-gray-400 group-hover:bg-gray-100 group-hover:text-gray-600 group-hover:translate-x-1' : 'bg-brand-50 text-brand-400 group-hover:bg-brand-100 group-hover:text-brand-600 group-hover:translate-x-1'}`}>
                                        <ChevronRight size={20} />
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

