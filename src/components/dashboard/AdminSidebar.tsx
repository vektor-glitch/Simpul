"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
    LayoutDashboard, 
    ShieldCheck, 
    PackageSearch, 
    Users, 
    ShoppingCart, 
    Star, 
    Landmark,
    LogOut,
    UserCog,
    LineChart,
    Settings
} from "lucide-react";
import Image from "next/image";
import LogoSvg from "@/components/logo/LOGO-SIMPUL.svg";
import { createClient } from "@/lib/supabase/client";

export default function AdminSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const supabase = createClient();

    const links = [
        { href: "/dashboard/admin", label: "Overview", icon: LayoutDashboard },
        { href: "/dashboard/admin/verifications", label: "Verifikasi Produsen", icon: ShieldCheck },
        { href: "/dashboard/admin/moderation", label: "Moderasi Produk", icon: PackageSearch },
        { href: "/dashboard/admin/pools", label: "Kelola Pool", icon: Users },
        { href: "/dashboard/admin/orders", label: "Semua Pesanan", icon: ShoppingCart },
        { href: "/dashboard/admin/withdrawals", label: "Pencairan Dana", icon: Landmark },
        { href: "/dashboard/admin/reviews", label: "Ulasan & Rating", icon: Star },
        { href: "/dashboard/admin/users", label: "Manajemen Pengguna", icon: UserCog },
        { href: "/dashboard/admin/finance", label: "Laporan Keuangan", icon: LineChart },
        { href: "/dashboard/admin/settings", label: "Pengaturan", icon: Settings },
    ];

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/auth/login');
    };

    return (
        <aside className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col fixed left-0 top-0 z-10">
            {/* BRANDING */}
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <Link href="/dashboard/admin" className="flex items-center gap-2">
                    <Image src={LogoSvg} alt="Logo Simpul" width={36} height={36} className="object-contain" />
                    <span className="font-extrabold text-2xl text-gray-900 tracking-tight ml-1">Simpul</span>
                    <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full ml-1">ADMIN</span>
                </Link>
            </div>

            {/* NAV MENU */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
                {links.map((link) => {
                    const Icon = link.icon;
                    // Khusus overview agar tidak selalu active jika rutenya lebih spesifik
                    const isExactActive = pathname === link.href;
                    const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
                    const finalActive = link.href === '/dashboard/admin' ? isExactActive : isActive;
                    
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm transition-all font-medium ${
                                finalActive 
                                ? "bg-brand-500 text-white shadow-md shadow-brand-500/20" 
                                : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                            }`}
                        >
                            <Icon size={20} className={finalActive ? "text-white" : "text-gray-400"} />
                            {link.label}
                        </Link>
                    );
                })}
            </nav>

            {/* BOTTOM SECTION */}
            <div className="p-4 border-t border-gray-200">
                <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 px-4 py-3 rounded-2xl text-red-600 hover:bg-red-50 transition-colors text-sm font-bold"
                >
                    <LogOut size={20} />
                    Keluar
                </button>
            </div>
        </aside>
    );
}

