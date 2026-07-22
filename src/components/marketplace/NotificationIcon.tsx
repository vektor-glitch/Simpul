"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useProfileCheck } from "@/hooks/useProfileCheck";

export default function NotificationIcon() {
    const supabase = createClient();
    const router = useRouter();
    const { withProfileCheck, isChecking } = useProfileCheck();
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        let isMounted = true;
        let channel: any;

        const fetchNotifications = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { count } = await supabase
                .from('notifications')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id)
                .eq('is_read', false);
            
            if (isMounted && count !== null) {
                setUnreadCount(count);
            }

            // Cegah pembuatan channel jika komponen sudah unmount selama proses await
            if (!isMounted) return;

            // Set up realtime subscription (gunakan random suffix untuk mencegah tabrakan zombie channel)
            channel = supabase.channel(`notifications-${user.id}-${Math.random()}`)
                .on(
                    'postgres_changes',
                    {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'notifications',
                        filter: `user_id=eq.${user.id}`
                    },
                    (payload) => {
                        if (isMounted) setUnreadCount(prev => prev + 1);
                    }
                )
                .subscribe();
        };

        fetchNotifications();

        return () => {
            isMounted = false;
            if (channel) supabase.removeChannel(channel);
        };
    }, [supabase]);

    return (
        <button 
            onClick={() => withProfileCheck(() => router.push('/dashboard/buyer/notifications'))} 
            disabled={isChecking} 
            className="relative p-2 text-gray-600 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
        >
            <Bell className="w-6 h-6" />
            {unreadCount > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold border border-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                </span>
            )}
        </button>
    );
}
