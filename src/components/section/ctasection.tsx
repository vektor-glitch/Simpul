'use client';

import Link from 'next/link';
import LightRays from '@/components/ui/light-rays';

export default function CTASection() {
    return (
        <section className="bg-slate-50 px-4 sm:px-6 lg:px-8 pb-24 relative overflow-hidden">
            <div className="max-w-7xl mx-auto w-full relative">

                {/* Main CTA Card */}
                <div className="relative z-10 bg-brand-950 rounded-[2.5rem] px-6 py-16 md:p-16 lg:p-20 text-center shadow-2xl overflow-hidden border border-white/10 min-h-[400px] flex flex-col items-center justify-center">

                    {/* Light Rays Background */}
                    <div className="absolute inset-0 z-0 opacity-60">
                        <LightRays
                            raysOrigin="top-center"
                            raysColor="#ffffff"
                            raysSpeed={1}
                            lightSpread={0.5}
                            rayLength={3}
                            followMouse={true}
                            mouseInfluence={0.1}
                            noiseAmount={0}
                            distortion={0}
                            className="w-full h-full"
                            pulsating={false}
                            fadeDistance={1}
                            saturation={1}
                        />
                    </div>

                    {/* Inner subtle glow gradient */}
                    <div className="absolute inset-0 bg-gradient-to-b from-brand-500/10 to-transparent pointer-events-none z-0"></div>

                    {/* card content */}
                    <div className="relative z-10 w-full max-w-3xl mx-auto pointer-events-auto">
                        <h2 className="font-extrabold text-3xl md:text-5xl text-white tracking-tight leading-tight">
                            Siap Menjadi Bagian dari <span className="text-brand-400">Simpul</span>?
                        </h2>

                        <p className="mt-6 text-lg text-brand-50/80 leading-relaxed">
                            Baik kamu produsen yang ingin harga lebih adil, atau pembeli yang ingin produk unggulan langsung dari sumbernya, Simpul hadir untuk menghubungkan keduanya.
                        </p>

                        <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4 sm:gap-6">
                            <Link
                                href="/auth/register"
                                className="inline-flex items-center justify-center rounded-full bg-brand-500 px-8 py-4 text-base font-bold text-white shadow-brand transition-all hover:bg-brand-400 hover:-translate-y-1 hover:shadow-[0_8px_20px_0_rgba(22,163,74,0.4)]"
                            >
                                Daftar Sekarang Secara Gratis
                            </Link>
                            <Link
                                href="/marketplace"
                                className="inline-flex items-center justify-center rounded-full border-2 border-white/20 bg-transparent px-8 py-4 text-base font-bold text-white transition-all hover:border-white hover:bg-white/10"
                            >
                                Jelajahi Marketplace
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}