import Link from "next/link";
import Image from "next/image";
import LogoSvg from "@/components/logo/LOGO-SIMPUL.svg";

export default function FooterSection() {
    return (
        <footer className="border-t border-slate-200 pt-16 pb-8" style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 60%, #fff7ed 100%)' }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-8">

                    {/* Brand Info */}
                    <div className="md:col-span-5 lg:col-span-6">
                        <Link href="/" className="inline-flex items-center gap-2 mb-6">
                            <Image src={LogoSvg} alt="Logo Simpul" width={40} height={40} className="object-contain" />
                            <span className="text-2xl font-bold tracking-tighter text-brand-700">
                                Simpul<span className="text-brand-500">.</span>
                            </span>
                        </Link>
                        <p className="text-slate-500 leading-relaxed max-w-sm">
                            Memotong rantai birokrasi tengkulak untuk menghubungkan produsen lokal langsung ke pasar yang lebih luas, dengan harga yang adil dan transparan.
                        </p>
                    </div>

                    {/* Navigation */}
                    <div className="md:col-span-3 lg:col-span-3">
                        <h4 className="text-slate-900 font-bold mb-4">Navigasi</h4>
                        <ul className="space-y-3">
                            <li>
                                <Link href="/marketplace" className="text-slate-500 hover:text-brand-600 transition-colors">Marketplace</Link>
                            </li>
                            <li>
                                <Link href="/pools" className="text-slate-500 hover:text-brand-600 transition-colors">Pool Belanja</Link>
                            </li>
                            <li>
                                <Link href="/#about" className="text-slate-500 hover:text-brand-600 transition-colors">Tentang Kami</Link>
                            </li>
                            <li>
                                <Link href="/#faq" className="text-slate-500 hover:text-brand-600 transition-colors">FAQ</Link>
                            </li>
                        </ul>
                    </div>

                    {/* Users */}
                    <div className="md:col-span-4 lg:col-span-3">
                        <h4 className="text-slate-900 font-bold mb-4">Untuk Pengguna</h4>
                        <ul className="space-y-3">
                            <li>
                                <Link href="/auth/register" className="text-slate-500 hover:text-brand-600 transition-colors">Daftar sebagai Produsen</Link>
                            </li>
                            <li>
                                <Link href="/auth/register" className="text-slate-500 hover:text-brand-600 transition-colors">Daftar sebagai Pembeli</Link>
                            </li>
                            <li>
                                <Link href="/auth/login" className="text-slate-500 hover:text-brand-600 transition-colors">Masuk ke Akun</Link>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-16 pt-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-slate-400 text-sm">
                        &copy; {new Date().getFullYear()} Simpul. Dibuat dengan penuh dedikasi untuk petani, peternak, dan pengrajin Indonesia.
                    </p>
                    <div className="flex gap-4">
                        <span className="text-slate-400 hover:text-brand-600 cursor-pointer transition-colors text-sm">Kebijakan Privasi</span>
                        <span className="text-slate-400 hover:text-brand-600 cursor-pointer transition-colors text-sm">Syarat & Ketentuan</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
