'use client';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Search, Menu, X, User } from 'lucide-react';
import LogoSvg from '@/components/logo/LOGO-SIMPUL.svg';
import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useProfileCheck } from '@/hooks/useProfileCheck';
import { User as AuthUser } from '@supabase/supabase-js';

export default function MarketNav() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [user, setUser] = useState<AuthUser | null>(null);
    const [userRole, setUserRole] = useState<string | null>(null);
    const [cartCount, setCartCount] = useState(0);
    const pathname = usePathname();
    const router = useRouter();
    const supabase = createClient();
    const { withProfileCheck, isChecking } = useProfileCheck();

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user || null);

            if (session?.user) {
                const { data } = await supabase.from('users').select('role').eq('id', session.user.id).single();
                setUserRole(data?.role || null);
                
                // Fetch initial cart count
                const { count } = await supabase.from('cart_items').select('*', { count: 'exact', head: true }).eq('buyer_id', session.user.id);
                setCartCount(count || 0);
            }
        };

        fetchUser();

        const { data: authListener } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                setUser(session?.user || null);
                if (session?.user) {
                    const { data } = await supabase.from('users').select('role').eq('id', session.user.id).single();
                    setUserRole(data?.role || null);
                    const { count } = await supabase.from('cart_items').select('*', { count: 'exact', head: true }).eq('buyer_id', session.user.id);
                    setCartCount(count || 0);
                } else {
                    setUserRole(null);
                    setCartCount(0);
                }
            }
        );
        
        return () => {
            authListener.subscription.unsubscribe();
        };
    }, [supabase]);

    // Realtime listener untuk cart_items terpisah agar tidak dipanggil ulang saat supabase object tidak berubah
    useEffect(() => {
        if (!user) return;
        
        const channel = supabase.channel('cart_updates')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'cart_items', filter: `buyer_id=eq.${user.id}` }, () => {
                supabase.from('cart_items').select('*', { count: 'exact', head: true }).eq('buyer_id', user.id)
                    .then(({ count }) => setCartCount(count || 0));
            })
            .subscribe();
            
        return () => {
            supabase.removeChannel(channel);
        };
    }, [user, supabase]);

    const profileLink = userRole === 'producer' 
        ? '/dashboard/producer' 
        : userRole === 'admin' 
        ? '/dashboard/admin' 
        : '/dashboard/buyer/profile';

    const handleLogoClick = (e: React.MouseEvent) => {
        if (user) {
            e.preventDefault();
            window.location.reload();
        }
    };

    return (
        <nav className="sticky top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16 gap-4 md:gap-8">

                    {/* Logo & Navigasi Kiri */}
                    <div className="shrink-0 flex items-center gap-8">
                        <Link href="/" onClick={handleLogoClick} className="shrink-0 flex items-center gap-2">
                            <Image src={LogoSvg} alt='Logo Simpul' width={36} height={36} className='object-contain' />
                            <span className='hidden md:block text-2xl font-extrabold tracking-tighter text-brand-700'>Simpul<span className="text-brand-500">.</span></span>
                        </Link>

                        <div className="hidden lg:flex items-center gap-6 text-sm font-semibold">
                            <Link href="/marketplace" className={`transition-colors ${pathname === '/marketplace' ? 'text-brand-600' : 'text-gray-600 hover:text-brand-600'}`}>Marketplace</Link>
                            <Link href="/pools" className={`transition-colors ${pathname === '/pools' ? 'text-earth-600' : 'text-gray-600 hover:text-earth-600'}`}>Pool Grosir</Link>
                        </div>
                    </div>

                    {/* Search Bar Tengah (Desktop & Tablet) */}
                    <div className="hidden sm:flex flex-1 max-w-3xl">
                        <form action="/marketplace" method="GET" className="relative w-full flex items-center">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="w-5 h-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                name="q"
                                placeholder="Cari sayur, buah, kerajinan..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
                            />
                        </form>
                    </div>

                    {/* Menu Kanan */}
                    <div className="flex items-center gap-4 shrink-0">
                        {/* Cart Icon */}
                        <button onClick={() => withProfileCheck(() => router.push('/cart'))} disabled={isChecking} className="relative p-2 text-gray-600 hover:text-brand-600 hover:bg-gray-50 rounded-lg transition-colors">
                            <ShoppingCart className="w-6 h-6" />
                            {cartCount > 0 && (
                                <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold border border-white">
                                    {cartCount > 9 ? '9+' : cartCount}
                                </span>
                            )}
                        </button>

                        <div className="hidden md:flex items-center gap-3 border-l border-gray-200 pl-4">
                            {user ? (
                                <Link href={profileLink} className="p-2 text-gray-600 hover:text-brand-600 hover:bg-brand-50 rounded-full transition-colors">
                                    <User className="w-6 h-6" />
                                </Link>
                            ) : (
                                <>
                                    <Link href="/auth/login" className="px-4 py-2 text-sm font-bold text-brand-600 border border-brand-600 rounded-lg hover:bg-brand-50 transition-colors">
                                        Masuk
                                    </Link>
                                    <Link href="/auth/register" className="px-4 py-2 text-sm font-bold text-white bg-brand-600 border border-brand-600 rounded-lg hover:bg-brand-700 transition-colors">
                                        Daftar
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Hamburger (Mobile) */}
                    <div className="sm:hidden flex items-center">
                        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-gray-600 hover:text-brand-600 focus:outline-none">
                            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Search Bar (Only shown on very small screens) */}
                <div className="sm:hidden pb-3">
                    <form action="/marketplace" method="GET" className="relative w-full flex items-center">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="w-4 h-4 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            name="q"
                            placeholder="Cari produk..."
                            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-brand-500"
                        />
                    </form>
                </div>
            </div>

            {/* Mobile View Menu */}
            {isMobileMenuOpen && (
                <div className="sm:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-4 shadow-md absolute w-full">
                    <div className="flex flex-col gap-3">
                        <div className="flex flex-col gap-2 pb-3 border-b border-gray-100">
                            <Link href="/marketplace" className={`px-2 py-2 text-sm font-semibold rounded-lg ${pathname === '/marketplace' ? 'text-brand-600 bg-brand-50' : 'text-gray-700 hover:bg-gray-50'}`} onClick={() => setIsMobileMenuOpen(false)}>
                                Marketplace
                            </Link>
                            <Link href="/pools" className={`px-2 py-2 text-sm font-semibold rounded-lg ${pathname === '/pools' ? 'text-earth-600 bg-earth-50' : 'text-gray-700 hover:bg-gray-50'}`} onClick={() => setIsMobileMenuOpen(false)}>
                                Pool Grosir
                            </Link>
                        </div>

                        {user ? (
                            <Link href={profileLink} className="flex items-center gap-2 w-full px-4 py-2 text-sm font-bold text-brand-600 bg-brand-50 rounded-lg hover:bg-brand-100 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                                <User className="w-5 h-5" /> Profil Akun
                            </Link>
                        ) : (
                            <>
                                <Link href="/auth/login" className="flex items-center justify-center w-full px-4 py-2 text-sm font-bold text-brand-600 border border-brand-600 rounded-lg hover:bg-brand-50 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                                    Masuk
                                </Link>
                                <Link href="/auth/register" className="flex items-center justify-center w-full px-4 py-2 text-sm font-bold text-white bg-brand-600 border border-brand-600 rounded-lg hover:bg-brand-700 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                                    Daftar
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}