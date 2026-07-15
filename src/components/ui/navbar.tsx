'use client';
import Link from 'next/link';
import Image from 'next/image';
import { LogIn, Menu, X } from 'lucide-react';
import LogoPng from '@/components/logo/LOGO-SIMPUL.png';
import { useState } from 'react';

export default function Navbar() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">

                    {/* Logo Kiri */}
                    <div className="shrink-0 flex items-center gap-2">
                        <Link href="/" className="shirnk-0 flex items-center gap-2">
                            <Image src={LogoPng} alt='Logo Simpul' width={40} height={40} className='object-contain' />
                            <span className='text-xl font-bold tracking-tighter text-brand-700'>Simpul<span className="text-emerald-500">.</span></span>
                        </Link>
                    </div>

                    {/* Menu Tengah (Desktop) */}
                    <div className="hidden md:flex items-center gap-8">
                        <Link href="/marketplace" className="nav-link text-sm font-medium text-gray-600 hover:text-brand-600 transition-colors">
                            Marketplace
                        </Link>
                        <Link href="/pools" className="nav-link text-sm font-medium text-gray-600 hover:text-brand-600 transition-colors">
                            Pool
                        </Link>
                        <Link href="/#about" className="nav-link text-sm font-medium text-gray-600 hover:text-brand-600 transition-colors">
                            Tentang Kami
                        </Link>
                        <Link href="/#faq" className="nav-link text-sm font-medium text-gray-600 hover:text-brand-600 transition-colors">
                            FAQ
                        </Link>
                    </div>

                    {/* Tombol Kanan */}
                    <div className="hidden md:flex items-center gap-4">
                        <Link href="/auth/login" className="hidden md:flex items-center gap-2 text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors px-4 py-2 rounded-lg hover:bg-brand-50">
                            <LogIn className="h-4 w-4" />
                            Masuk
                        </Link>
                        <Link
                            href="/auth/register"
                            className="text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 transition-colors px-4 py-2 rounded-lg shadow-sm hover:shadow-md">
                            Daftar Gratis
                        </Link>
                    </div>

                    {/* hamburger */}
                    <div className='md:hidden flex items-center'>
                        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className='text-brand-600 hover:text-brand-700 focus:outline-none'>
                            {isMobileMenuOpen ? (
                                <X className='h-6 w-6' />
                            ) : (
                                <Menu className='h-6 w-6' />
                            )}
                        </button>
                    </div>
                </div>
            </div>
            {/* Mobile View */}
            {isMobileMenuOpen && (
                <div className='md:hidden bg-white border-b border-gray-100 px-4 pt-2 pb-4 space-y-3 shadow-md'>
                    <Link href="/marketplace" className='block text-base font-medium text-gray-600 hover:text-brand-600' onClick={() => setIsMobileMenuOpen(false)}>
                        Marketplace
                    </Link>
                    <Link href="/pools" className='block text-base font-medium text-gray-600 hover:text-brand-600' onClick={() => setIsMobileMenuOpen(false)}>
                        Pool
                    </Link>
                    <Link href="/#about" className='block text-base font-medium text-gray-600 hover:text-brand-600' onClick={() => setIsMobileMenuOpen(false)}>
                        Tentang Kami
                    </Link>
                    <Link href="/#faq" className='block text-base font-medium text-gray-600 hover:text-brand-600' onClick={() => setIsMobileMenuOpen(false)}>
                        FAQ
                    </Link>
                    <div className='border-t border-gray-100 pt-4 mt-2 flex flex-col gap-3'>
                        <Link href="/auth/login" className="flex items-center justify-center gap-2 text-base font-medium text-brand-600 bg-brand-50 hover:bg-brand-100 rounded-lg px-4 py-2 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                            <LogIn className="h-5 w-5" />
                            Masuk
                        </Link>
                        <Link href="/auth/register" className="flex items-center justify-center gap-2 text-base font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-lg px-4 py-2 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                            Daftar Gratis
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    );
}