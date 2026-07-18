import Link from 'next/link';
import { ShieldCheck, TrendingUp, Users, ArrowRight, Star } from 'lucide-react';

export default function HeroSection() {
    return (
        < section className="relative pt-24 pb-20 min-h-[95vh] overflow-hidden flex items-center" style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 60%, #fff7ed 100%)' }}>

            {/* Decorative Background Blobs */}
            <div className="absolute top-0 right-0 w-125 h-125 bg-brand-100 rounded-full blur-3xl opacity-40 -z-10"></div>
            <div className="absolute bottom-0 left-0 w-100 h-100 bg-orange-100 rounded-full blur-3xl opacity-40 -z-10"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <div className="grid lg:grid-cols-2 gap-16 items-center">

                    {/*  KOLOM KIRI  */}
                    <div className="flex flex-col animate-fade-up">
                        {/* KICKER */}
                        <div className="inline-flex self-start items-center gap-2 bg-red-50 text-red-600 text-xs font-bold px-4 py-2 rounded-full mb-8 border border-red-100">
                            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                            Tengkulak memangkas hingga 40% keuntungan Anda!
                        </div>

                        {/* HEADLINE */}
                        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1] mb-6">
                            Rantai Pasok yang{' '}
                            <span className="relative inline-block">
                                <span className="text-brand-600">
                                    Lebih Adil
                                </span>
                                {/* Garis Bawah Dekoratif */}
                                <svg className="absolute -bottom-2 left-0 w-full" height="8" viewBox="0 0 200 8">
                                    <path d="M0 6 Q50 0 100 4 Q150 8 200 2" stroke="#10b981" strokeWidth="3" fill="none" strokeLinecap="round" />
                                </svg>
                            </span>
                            {' '}untuk Produsen Lokal
                        </h1>

                        {/* SUB-HEADLINE */}
                        <p className="text-lg text-slate-500 leading-relaxed mb-10 max-w-xl">
                            Simpul menghubungkan petani, peternak, dan pengrajin Indonesia langsung ke pembeli skala besar tanpa perantara, dengan harga yang sepenuhnya transparan.
                        </p>

                        {/* CTA */}
                        <div className="flex flex-wrap gap-4 mb-12">
                            <Link href="/marketplace" className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold px-7 py-3.5 rounded-xl shadow-lg shadow-brand-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5">
                                Jelajahi Produk <ArrowRight className="w-5 h-5" />
                            </Link>
                            <Link href="/auth/register" className="inline-flex items-center gap-2 bg-white text-gray-700 font-semibold px-7 py-3.5 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 shadow-sm transition-all duration-300 hover:-translate-y-0.5">
                                Daftar Sebagai Produsen
                            </Link>
                        </div>

                        {/* SOCIAL PROOF & TRUST SIGNALS */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-6 pt-8 border-t border-gray-100">
                            {/* Avatar Tumpuk */}
                            <div className="flex -space-x-3">
                                {['BU', 'SM', 'AH', 'RD'].map((initials, i) => (
                                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-brand-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                                        {initials}
                                    </div>
                                ))}
                                <div className="w-10 h-10 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600 shadow-sm">
                                    +1K
                                </div>
                            </div>
                            <div>
                                <div className="flex items-center gap-1 mb-0.5">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                    ))}
                                </div>
                                <p className="text-xs text-gray-500">
                                    Dipercaya <span className="font-semibold text-gray-700">1.000+ produsen lokal</span> Indonesia (Dummy)
                                </p>
                            </div>
                        </div>
                    </div>

                    {/*  KOLOM KANAN (MOCK UI CARD)  */}
                    <div className="relative hidden lg:flex justify-center items-center">
                        {/* Card Utama: Breakdown Harga */}
                        <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 w-full max-w-sm z-10 transition hover:rotate-3">

                            {/* Header Card */}
                            <div className="flex items-center justify-between mb-5">
                                <div>
                                    <p className="text-xs text-gray-400 font-medium">PRODUK</p>
                                    <p className="font-bold text-gray-900">Beras Organik Merah · 10 kg</p>
                                </div>
                                <span className="bg-brand-100 text-brand-700 text-xs font-semibold px-3 py-1 rounded-full">✓ Aktif</span>
                            </div>

                            {/* Breakdown Harga (Fitur Utama!) */}
                            <div className="bg-gray-50 rounded-xl p-4 mb-5 space-y-2.5">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Rincian Harga Transparan</p>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-600">Harga Produsen</span>
                                    <span className="font-semibold text-gray-900">Rp 85.000</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-600">Biaya Kirim (JNE)</span>
                                    <span className="font-semibold text-gray-900">Rp 12.000</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-600">Fee Platform</span>
                                    <span className="font-semibold text-gray-900">Rp 3.000</span>
                                </div>
                                <div className="border-t border-gray-200 pt-2 flex justify-between items-center">
                                    <span className="font-bold text-gray-900 text-sm">Total Pembeli</span>
                                    <span className="font-extrabold text-brand-600">Rp 100.000</span>
                                </div>
                            </div>

                            {/* Progress Pool */}
                            <div className="bg-brand-50 rounded-xl p-4 border border-brand-100">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <Users className="w-4 h-4 text-brand-600" />
                                        <span className="text-xs font-bold text-brand-700">Pool Aktif</span>
                                    </div>
                                    <span className="text-xs font-bold text-brand-600">320 / 500 kg</span>
                                </div>
                                <div className="w-full bg-brand-100 rounded-full h-2 mb-2">
                                    <div className="bg-brand-600 h-2 rounded-full" style={{ width: '64%' }}></div>
                                </div>
                                <p className="text-xs text-brand-600">3 produsen bergabung · 64% terpenuhi</p>
                            </div>
                        </div>

                        {/* Floating Badge (Floating di atas card) */}
                        <div className="absolute -top-4 -right-4 bg-white rounded-xl shadow-lg border border-gray-100 p-3 flex items-center gap-2 z-20 animate-float">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                <TrendingUp className="w-4 h-4 text-green-600" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-800">+34% Pendapatan</p>
                                <p className="text-xs text-gray-400">vs jalur tengkulak</p>
                            </div>
                        </div>

                        {/* Floating Badge (Floating di bawah card) */}
                        <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-lg border border-gray-100 p-3 flex items-center gap-2 z-20 animate-float">
                            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                                <ShieldCheck className="w-4 h-4 text-yellow-600" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-800">Produsen Terverifikasi</p>
                                <p className="text-xs text-gray-400">Admin Simpul</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section >
    );
}