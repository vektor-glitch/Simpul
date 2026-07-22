"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Package, Users, ShoppingCart, UserCircle, Store, LogOut, Wallet, Bell, Star } from "lucide-react";
import Image from "next/image";
import LogoSvg from "@/components/logo/LOGO-SIMPUL.svg";
import { createClient } from "@/lib/supabase/client";

export default function ProducerSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const supabase = createClient();

    const links = [
        { href: "/dashboard/producer", label: "Overview", icon: LayoutDashboard },
        { href: "/dashboard/producer/products", label: "Kelola Produk", icon: Package },
        { href: "/dashboard/producer/pools", label: "Kelola Pool", icon: Users },
        { href: "/dashboard/producer/orders", label: "Pesanan Masuk", icon: ShoppingCart },
        { href: "/dashboard/producer/wallet", label: "Dompet & Pencairan", icon: Wallet },
        { href: "/dashboard/producer/notifications", label: "Pusat Notifikasi", icon: Bell },
        { href: "/dashboard/producer/reviews", label: "Ulasan Pembeli", icon: Star },
        { href: "/dashboard/producer/profile", label: "Profil Usaha", icon: UserCircle },
    ];

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/auth/login');
    };

    return (
        <aside className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col fixed left-0 top-0">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <Link href="/dashboard/producer" className="flex items-center gap-2">
                    <Image src={LogoSvg} alt="Logo Simpul" width={36} height={36} className="object-contain" />
                    <span className="font-extrabold text-2xl text-gray-900 tracking-tight ml-1">Simpul</span>
                </Link>
            </div>

            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-3 mt-4">Menu Produsen</div>
                {links.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href;
                    
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-medium ${
                                isActive 
                                ? "bg-brand-50 text-brand-700 font-bold" 
                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            }`}
                        >
                            <Icon size={20} className={isActive ? "text-brand-600" : "text-gray-400"} />
                            {link.label}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-gray-200 flex flex-col gap-2">
                <Link 
                    href="/marketplace" 
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                >
                    <Store size={20} className="text-gray-400" />
                    Marketplace Publik
                </Link>
                <button 
                    onClick={handleLogout}
                    className="flex items-center w-full gap-3 px-3 py-2.5 rounded-xl transition-all font-medium text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                    <LogOut size={20} className="text-red-500" />
                    Keluar (Logout)
                </button>
            </div>
        </aside>
    );
}
