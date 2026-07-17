"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { registerSchema } from "@/lib/validations/auth-validation";
import Link from 'next/link';
import Image from 'next/image';
import LogoSvg from "@/components/logo/LOGO-SIMPUL.svg";
import { ArrowLeft, Mail, Lock, User, Phone, Tractor, ShoppingCart } from 'lucide-react';

export default function RegisterPage() {
    const router = useRouter();
    const supabase = createClient();

    const [form, setForm] = useState({
        name: "", email: "", phone: "", password: "", role: "buyer"
    });
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setSuccessMsg(null);

        // 1. Validasi Zod
        const parsed = registerSchema.safeParse(form);
        if (!parsed.success) {
            setError(parsed.error.issues[0].message);
            return;
        }

        setLoading(true);

        // 2. Mendaftarkan Akun Baru ke Supabase
        const { error: signUpError } = await supabase.auth.signUp({
            email: parsed.data.email,
            password: parsed.data.password,
            options: {
                // Sangat Penting: Menyimpan metadata yang dibutuhkan oleh Trigger SQL Anda
                data: {
                    name: parsed.data.name,
                    role: parsed.data.role,
                    phone: parsed.data.phone || null
                }
            }
        });

        if (signUpError) {
            setError(signUpError.message);
            setLoading(false);
            return;
        }

        setSuccessMsg("Pendaftaran berhasil! Silakan periksa email Anda untuk verifikasi.");
        setLoading(false);
    }

    const handleGoogleLogin = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`
            }
        });
        if (error) setError(error.message);
    };

    return (
        <div className="bg-[#FAF7F0] min-h-screen flex">
            {/* Bagian Kiri (Sama seperti Login, tapi letaknya dibalik ke kanan agar tidak membosankan) */}
            <div
                className="hidden lg:flex w-1/2 text-white flex-col justify-between p-12 relative overflow-hidden bg-cover bg-center"
                style={{
                    backgroundImage: "url('https://images.unsplash.com/photo-1659822887922-c1386185cc6b?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
                    backgroundColor: "#14532d"
                }}
            >
                <div className="absolute inset-0 bg-linear-to-br from-brand-950/80 via-brand-900/60 to-brand-900/90 mix-blend-multiply"></div>
                <div className="absolute inset-0 bg-brand-950/30"></div>
                <div className="absolute -top-10 -right-10 w-96 h-96 bg-brand-400/40 rounded-full blur-[80px] mix-blend-screen animate-pulse"></div>
                <div className="absolute -bottom-10 -left-10 w-80 h-80 bg-earth-400/30 rounded-full blur-[80px] mix-blend-screen"></div>

                <div className="relative z-10 flex flex-col h-full">
                    <Link href="/" className="inline-flex items-center gap-2 mt-4 group">
                        <Image src={LogoSvg} alt="Logo Simpul" width={48} height={48} className="brightness-0 invert drop-shadow-lg transition-transform group-hover:scale-110" />
                        <span className="text-4xl font-extrabold tracking-tighter text-white drop-shadow-lg">Simpul<span className="text-brand-400">.</span></span>
                    </Link>

                    <div className="py-16">
                        <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight mb-4 text-white drop-shadow-md">
                            Tumbuh Bersama,<br />Lebih Kuat.
                        </h1>
                        <p className="text-brand-50 text-lg leading-relaxed max-w-md">
                            Bergabung sekarang. Buat pasar yang adil di mana produsen dan pembeli bisa bertransaksi tanpa perantara, dengan transparansi penuh.
                        </p>
                    </div>

                    <p className="mt-auto text-sm text-brand-50/80 max-w-md leading-relaxed">
                        © 2026 Simpul. Dibuat dengan penuh dedikasi untuk petani, peternak, dan pengrajin Indonesia.
                    </p>
                </div>
            </div>

            {/* Bagian Kanan (Form Register) */}
            <div style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 60%, #fff7ed 100%)' }} className="w-full lg:w-1/2 flex flex-col justify-center py-12 sm:px-6 lg:px-12 font-sans relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-64 bg-brand-600/10 rounded-b-[100%] blur-3xl -z-10"></div>

                <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
                    <div className="mb-4">
                        <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-brand-600 transition-colors">
                            <ArrowLeft className="w-4 h-4" /> Kembali ke Beranda
                        </Link>
                    </div>

                    <div className="bg-white py-8 px-4 shadow-xl shadow-brand-900/5 sm:rounded-2xl sm:px-10 border border-gray-100 animate-fade-up">
                        <div className="mb-8">
                            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                                Buat Akun Simpul
                            </h2>
                            <p className="mt-2 text-sm text-gray-600">
                                Sudah punya akun?{' '}
                                <Link href="/auth/login" className="font-medium text-brand-600 hover:text-brand-500 transition-colors">
                                    Masuk di sini
                                </Link>
                            </p>
                        </div>

                        {error && (
                            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">{error}</div>
                        )}
                        {successMsg && (
                            <div className="mb-4 p-3 bg-green-50 text-green-600 text-sm rounded-lg border border-green-100">{successMsg}</div>
                        )}

                        <form className="space-y-5" onSubmit={handleSubmit}>
                            {/* Pemilihan Role */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">Saya ingin mendaftar sebagai:</label>
                                <div className="grid grid-cols-2 gap-4">
                                    {/* Tombol Pembeli */}
                                    <button
                                        type="button"
                                        onClick={() => setForm({ ...form, role: "buyer" })}
                                        className={`flex flex-col items-center justify-center p-4 border-2 rounded-xl transition-all ${form.role === "buyer" ? "border-brand-600 bg-brand-50 text-brand-700 shadow-sm" : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"}`}
                                    >
                                        <ShoppingCart className="w-6 h-6 mb-2" />
                                        <span className="text-sm font-bold">Pembeli B2B</span>
                                    </button>

                                    {/* Tombol Produsen */}
                                    <button
                                        type="button"
                                        onClick={() => setForm({ ...form, role: "producer" })}
                                        className={`flex flex-col items-center justify-center p-4 border-2 rounded-xl transition-all ${form.role === "producer" ? "border-brand-600 bg-brand-50 text-brand-700 shadow-sm" : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"}`}
                                    >
                                        <Tractor className="w-6 h-6 mb-2" />
                                        <span className="text-sm font-bold">Produsen Lokal</span>
                                    </button>
                                </div>
                            </div>

                            {/* Nama Lengkap */}
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <User className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="name" name="name" type="text" required
                                        value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-brand-500 focus:border-brand-500 text-sm bg-gray-50 focus:bg-white outline-none"
                                        placeholder="Lintang Kinasih"
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Alamat Email</label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="email" name="email" type="email" required
                                        value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-brand-500 focus:border-brand-500 text-sm bg-gray-50 focus:bg-white outline-none"
                                        placeholder="anda@email.com"
                                    />
                                </div>
                            </div>

                            {/* Telepon (Opsional) */}
                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Nomor Telepon <span className="text-gray-400 font-normal">(Opsional)</span></label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Phone className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="phone" name="phone" type="tel"
                                        value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-brand-500 focus:border-brand-500 text-sm bg-gray-50 focus:bg-white outline-none"
                                        placeholder="081234567890"
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="password" name="password" type="password" required
                                        value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-brand-500 focus:border-brand-500 text-sm bg-gray-50 focus:bg-white outline-none"
                                        placeholder="Minimal 6 karakter"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit" disabled={loading}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-70 transition-all"
                            >
                                {loading ? "Mendaftarkan..." : "Buat Akun"}
                            </button>
                        </form>

                        <div className="mt-6">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
                                <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">Atau daftar dengan</span></div>
                            </div>
                            <button
                                type="button" onClick={handleGoogleLogin}
                                className="mt-6 w-full flex justify-center items-center gap-3 py-3 px-4 border border-gray-200 rounded-xl shadow-sm bg-white text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                Google
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}