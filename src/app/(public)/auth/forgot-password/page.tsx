"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from 'next/link';
import { ArrowLeft, Mail, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
    const supabase = createClient();

    const [email, setEmail] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            // Arahkan ke halaman update-password setelah mengklik link di email
            redirectTo: `${window.location.origin}/auth/update-password`,
        });

        if (error) {
            setError(error.message);
        } else {
            setSuccess(true);
        }
        setLoading(false);
    }

    return (
        <div style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 60%, #fff7ed 100%)' }} className="min-h-screen flex flex-col pt-24 sm:pt-32 pb-12 sm:px-6 lg:px-8 font-sans relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-64 bg-brand-600/10 rounded-b-[100%] blur-3xl -z-10"></div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
                <div className="mb-4">
                    <Link href="/auth/login" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-brand-600 transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Kembali ke Login
                    </Link>
                </div>

                <div className="bg-white py-8 px-4 shadow-xl shadow-brand-900/5 sm:rounded-2xl sm:px-10 border border-gray-100">
                    <div className="mb-8">
                        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                            Lupa Password?
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Masukkan email yang terdaftar, kami akan mengirimkan tautan untuk mengatur ulang password Anda.
                        </p>
                    </div>

                    {success ? (
                        <div className="text-center py-4 animate-fade-up">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                                <CheckCircle2 className="h-6 w-6 text-green-600" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900">Email Terkirim!</h3>
                            <p className="mt-2 text-sm text-gray-500">
                                Silakan periksa kotak masuk (atau folder spam) pada email <strong>{email}</strong>.
                                Klik tautan di dalamnya untuk membuat password baru.
                            </p>
                        </div>
                    ) : (
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            {error && (
                                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                                    {error}
                                </div>
                            )}

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                    Alamat Email
                                </label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="email" name="email" type="email" required
                                        value={email} onChange={(e) => setEmail(e.target.value)}
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-brand-500 focus:border-brand-500 text-sm bg-gray-50 focus:bg-white outline-none"
                                        placeholder="anda@email.com"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit" disabled={loading}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-70 transition-all"
                            >
                                {loading ? "Mengirim..." : "Kirim Tautan"}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}