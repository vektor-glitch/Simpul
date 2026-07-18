"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { loginSchema } from "@/lib/validations/auth-validation";
import Link from 'next/link';
import Image from 'next/image';
import LogoSvg from "@/components/logo/LOGO-SIMPUL.svg";
import { ArrowLeft, Mail, Lock, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const supabase = createClient();

    const [form, setForm] = useState({
        email: "", password: ""
    });
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const [showPassword, setShowPassword] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);

        const parsed = loginSchema.safeParse(form);
        if (!parsed.success) {
            setError(parsed.error.issues[0].message);
            return;
        }

        setLoading(true);

        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: parsed.data.email,
            password: parsed.data.password,
        });

        if (authError) {
            setError(authError.message);
            setLoading(false);
            return;
        }

        const { data: profile } = await supabase
            .from("users")
            .select("role")
            .eq("id", authData.user.id)
            .single();

        if (profile?.role === "producer") {
            router.push("/dashboard/producer");
        }
        else if (profile?.role === "admin") {
            router.push("/dashboard/admin");
        }
        else {
            router.push("/marketplace");
        }
        router.refresh();
    }

    const handleGoogleLogin = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`
            }
        });
        if (error) {
            setError(error.message);
        }
    };

    return (
        <div className="bg-[#FAF7F0] min-h-screen flex">
            {/* left branding */}
            <div
                className="hidden lg:flex w-1/2 text-white flex-col justify-between p-12 relative overflow-hidden bg-cover bg-center"
                style={{
                    backgroundImage: "url('https://images.pexels.com/photos/5529591/pexels-photo-5529591.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2')",
                    backgroundColor: "#14532d" // fallback color (brand-900)
                }}
            >
                {/* Overlay Gelap agar teks terbaca dan gambar terlihat premium */}
                <div className="absolute inset-0 bg-gradient-to-br from-brand-950/80 via-brand-900/60 to-brand-900/90 mix-blend-multiply"></div>
                <div className="absolute inset-0 bg-brand-950/30"></div>

                {/* Decorative Glowing Blobs (Cahaya menyala) */}
                <div className="absolute -top-10 -right-10 w-96 h-96 bg-brand-400/40 rounded-full blur-[80px] pointer-events-none mix-blend-screen"></div>
                <div className="absolute -bottom-10 -left-10 w-80 h-80 bg-earth-400/30 rounded-full blur-[80px] pointer-events-none mix-blend-screen"></div>

                <div className="relative z-10 flex flex-col h-full">
                    <Link href="/" className="inline-flex items-center gap-2 mt-4 group">
                        <Image src={LogoSvg} alt="Logo Simpul" width={48} height={48} className="brightness-0 invert drop-shadow-lg transition-transform group-hover:scale-110" />
                        <span className="text-4xl font-extrabold tracking-tighter text-white drop-shadow-lg">Simpul<span className="text-brand-400">.</span></span>
                    </Link>
                    <div className="py-16">
                        <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight mb-4 text-white drop-shadow-md">
                            Selamat Datang<br />Kembali! 👋
                        </h1>
                        <p className="text-brand-50 text-lg leading-relaxed max-w-md">
                            Lanjutkan transaksi dan pantau pesananmu di Simpul.
                        </p>
                    </div>
                    <p className="mt-auto text-sm text-brand-50/80 max-w-md leading-relaxed">
                        © 2026 Simpul. Dibuat dengan penuh dedikasi untuk petani, peternak, dan pengrajin Indonesia.
                    </p>
                </div>
            </div>

            {/* Right side form */}
            <div style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 60%, #fff7ed 100%)' }} className="w-full lg:w-1/2 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans relative overflow-hidden">
                {/* Background Dekoratif */}
                <div className="absolute top-0 left-0 w-full h-64 bg-brand-600/10 rounded-b-[100%] blur-3xl -z-10"></div>
                {/* Kartu Form Putih */}
                <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
                    {/* Tombol Kembali */}
                    <div className="mb-4">
                        <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-brand-600 transition-colors">
                            <ArrowLeft className="w-4 h-4" /> Kembali ke Beranda
                        </Link>
                    </div>

                    <div className="bg-white py-8 px-4 shadow-xl shadow-brand-900/5 sm:rounded-2xl sm:px-10 border border-gray-100 animate-fade-up">
                        {/* Header Teks Login */}
                        <div className="mb-8">
                            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                                Masuk ke Akun Anda
                            </h2>
                            <p className="mt-2 text-sm text-gray-600">
                                Belum punya akun?{' '}
                                <Link href="/auth/register" className="font-medium text-brand-600 hover:text-brand-500 transition-colors">
                                    Daftar gratis!
                                </Link>
                            </p>
                        </div>

                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                    Alamat Email
                                </label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        value={form.email}
                                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-brand-500 focus:border-brand-500 text-sm bg-gray-50 focus:bg-white transition-colors outline-none"
                                        placeholder="anda@email.com"
                                    />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                    Password
                                </label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        autoComplete="current-password"
                                        required
                                        value={form.password}
                                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                                        className="block w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl focus:ring-brand-500 focus:border-brand-500 text-sm bg-gray-50 focus:bg-white transition-colors outline-none"
                                        placeholder="••••••••"
                                    />
                                    <button 
                                        type="button" 
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center focus:outline-none"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                                        ) : (
                                            <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                                        )}
                                    </button>
                                </div>
                            </div>
                            <div className="flex items-center justify-between !mt-3">
                                <div className="flex items-center">
                                    <input
                                        id="remember-me"
                                        name="remember-me"
                                        type="checkbox"
                                        className="h-4 w-4 text-brand-600 focus:ring-brand-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                                        Ingat saya
                                    </label>
                                </div>
                                <div className="text-sm">
                                    <Link href="/auth/forgot-password" className="font-medium text-brand-600 hover:text-brand-500">
                                        Lupa password?
                                    </Link>
                                </div>
                            </div>
                            <div>
                                <button
                                    type="submit"
                                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-all hover:shadow-lg hover:-translate-y-0.5"
                                >
                                    Masuk
                                </button>
                            </div>
                        </form>
                        {/* Garis Pemisah (Divider) */}
                        <div className="mt-6">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-200" />
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-white text-gray-500">Atau lanjutkan dengan</span>
                                </div>
                            </div>
                            {/* Tombol Login Google */}
                            <div className="mt-6">
                                <button
                                    type="button" onClick={handleGoogleLogin}
                                    className="w-full flex justify-center items-center gap-3 py-3 px-4 border border-gray-200 rounded-xl shadow-sm bg-white text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    {/* Logo Google SVG Asli */}
                                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                                        <path
                                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                            fill="#4285F4"
                                        />
                                        <path
                                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                            fill="#34A853"
                                        />
                                        <path
                                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                            fill="#FBBC05"
                                        />
                                        <path
                                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                            fill="#EA4335"
                                        />
                                    </svg>
                                    Google
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}