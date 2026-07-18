"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { User, MapPin, Phone, Mail, Save, Loader2, ShieldCheck, Home, Map, Camera, ArrowLeft, LogOut, Info } from "lucide-react";
import Image from "next/image";

export default function BuyerProfilePage() {
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    // State untuk form
    const [userEmail, setUserEmail] = useState("");
    const [form, setForm] = useState({
        name: "",
        phone: "",
        avatar_url: "",
        default_address: "",
        city: "",
        postal_code: "",
    });

    useEffect(() => {
        async function loadProfile() {
            try {
                // 1. Ambil session user saat ini
                const { data: { session } } = await supabase.auth.getSession();
                if (!session?.user) return;
                
                setUserEmail(session.user.email || "");

                // 2. Ambil data dari tabel users
                const { data: userData } = await supabase
                    .from("users")
                    .select("name, phone")
                    .eq("id", session.user.id)
                    .single();

                // 3. Ambil data dari tabel buyer_profiles
                const { data: profileData } = await supabase
                    .from("buyer_profiles")
                    .select("avatar_url, default_address, city, postal_code")
                    .eq("user_id", session.user.id)
                    .single();

                // 4. Gabungkan data ke dalam form state
                setForm({
                    name: userData?.name || "",
                    phone: userData?.phone || "",
                    avatar_url: profileData?.avatar_url || "",
                    default_address: profileData?.default_address || "",
                    city: profileData?.city || "",
                    postal_code: profileData?.postal_code || "",
                });

            } catch (error) {
                console.error("Gagal memuat profil:", error);
            } finally {
                setLoading(false);
            }
        }

        loadProfile();
    }, [supabase]);

    async function handleUploadAvatar(e: React.ChangeEvent<HTMLInputElement>) {
        try {
            setUploading(true);
            setMessage({ type: "", text: "" });
            
            if (!e.target.files || e.target.files.length === 0) {
                return;
            }
            
            const file = e.target.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${userEmail}/${fileName}`; // Folder berdasarkan email

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
            
            setForm({ ...form, avatar_url: data.publicUrl });
            setMessage({ type: "success", text: "Foto berhasil diunggah! Jangan lupa klik Simpan Perubahan." });
            setTimeout(() => setMessage({ type: "", text: "" }), 3000);

        } catch (error: any) {
            setMessage({ type: "error", text: error.message || "Gagal mengunggah foto." });
        } finally {
            setUploading(false);
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: "", text: "" });

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user) throw new Error("Anda belum login");

            const userId = session.user.id;

            // 1. Update tabel users (Nama & HP)
            const { error: userError } = await supabase
                .from("users")
                .update({ 
                    name: form.name, 
                    phone: form.phone 
                })
                .eq("id", userId);

            if (userError) throw userError;

            // 2. Upsert (Update atau Insert) tabel buyer_profiles
            const { error: profileError } = await supabase
                .from("buyer_profiles")
                .upsert({
                    user_id: userId,
                    avatar_url: form.avatar_url,
                    default_address: form.default_address,
                    city: form.city,
                    postal_code: form.postal_code,
                    updated_at: new Date().toISOString(),
                });

            if (profileError) throw profileError;

            setMessage({ type: "success", text: "Profil berhasil diperbarui! 🎉" });
            
            // Hilangkan pesan sukses setelah 3 detik
            setTimeout(() => setMessage({ type: "", text: "" }), 3000);

        } catch (error: any) {
            setMessage({ type: "error", text: error.message || "Terjadi kesalahan saat menyimpan profil." });
        } finally {
            setSaving(false);
        }
    }

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/auth/login");
        router.refresh();
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#FAF7F0] relative overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-200 rounded-full blur-[100px] opacity-60 animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-earth-200 rounded-full blur-[100px] opacity-60 animate-pulse delay-700"></div>
                <div className="relative flex flex-col items-center gap-4">
                    <div className="w-16 h-16 relative">
                        <div className="absolute inset-0 border-4 border-brand-200 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-brand-600 rounded-full border-t-transparent animate-spin"></div>
                    </div>
                    <p className="text-brand-700 font-medium tracking-wide">Memuat profil Anda...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FAF7F0] py-8 md:py-12 px-4 sm:px-6 lg:px-8 font-sans relative overflow-hidden">
            
            {/* Background Decorative Blobs */}
            <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-brand-900/5 to-transparent pointer-events-none"></div>
            <div className="absolute -top-20 -left-20 w-[500px] h-[500px] bg-brand-300/20 rounded-full blur-[120px] pointer-events-none mix-blend-multiply"></div>
            <div className="absolute top-40 -right-20 w-[600px] h-[600px] bg-earth-300/20 rounded-full blur-[120px] pointer-events-none mix-blend-multiply"></div>

            <div className="max-w-4xl mx-auto relative z-10">
                
                {/* Header Section */}
                <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                    <div>
                        <button 
                            onClick={() => router.back()}
                            className="group flex items-center gap-2 px-4 py-2 bg-white/60 hover:bg-white/90 backdrop-blur-md border border-white/40 shadow-sm rounded-full text-brand-700 transition-all mb-6 hover:shadow-md hover:-translate-x-1"
                        >
                            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                            <span className="text-sm font-semibold tracking-wide">Kembali</span>
                        </button>
                        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                            Profil Akun 
                            <span className="inline-flex items-center justify-center bg-brand-100 text-brand-700 text-xs px-3 py-1 rounded-full font-bold tracking-widest uppercase border border-brand-200">
                                Buyer
                            </span>
                        </h1>
                        <p className="mt-2 text-slate-600 text-lg">Kelola informasi pribadi dan alamat pengiriman Anda dengan mudah.</p>
                    </div>
                    
                    <button 
                        onClick={handleLogout}
                        className="group flex items-center gap-2 px-5 py-2.5 bg-white/80 hover:bg-red-50 backdrop-blur-md border border-red-100 text-red-600 rounded-xl font-bold shadow-sm hover:shadow-md hover:border-red-200 transition-all text-sm"
                    >
                        <LogOut className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
                        Keluar Akun
                    </button>
                </div>

                <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-2xl shadow-brand-900/5 border border-white overflow-hidden relative">
                    
                    {/* Top Decorative Banner */}
                    <div className="h-40 md:h-48 bg-gradient-to-br from-brand-700 via-brand-600 to-earth-600 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
                        <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-700"></div>
                        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-black/10 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-700"></div>
                    </div>

                    <form onSubmit={handleSubmit} className="px-6 sm:px-12 pb-12">
                        
                        {/* Avatar Section (Floating & Uploadable) */}
                        <div className="relative flex flex-col md:flex-row justify-between items-center md:items-end -mt-20 md:-mt-24 mb-12 gap-6">
                            <div className="relative w-40 h-40 md:w-48 md:h-48 rounded-full ring-8 ring-white/80 bg-slate-100 shadow-xl overflow-hidden flex items-center justify-center group z-10">
                                {form.avatar_url ? (
                                    <Image src={form.avatar_url} alt="Avatar" fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-brand-100 to-brand-50 flex items-center justify-center">
                                        <User className="w-16 h-16 text-brand-300" />
                                    </div>
                                )}
                                
                                {/* Layar Hitam Transparan (Muncul saat di-hover) */}
                                <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-all duration-300">
                                    {uploading ? (
                                        <Loader2 className="w-8 h-8 text-white animate-spin" />
                                    ) : (
                                        <>
                                            <Camera className="w-8 h-8 text-white mb-2 transform -translate-y-2 group-hover:translate-y-0 transition-transform duration-300" />
                                            <span className="text-xs text-white font-bold tracking-wider transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">UBAH FOTO</span>
                                        </>
                                    )}
                                    <input 
                                        type="file" 
                                        accept="image/jpeg, image/png, image/webp" 
                                        className="hidden" 
                                        onChange={handleUploadAvatar} 
                                        disabled={uploading} 
                                    />
                                </label>
                            </div>
                            
                            {/* Tombol Simpan (Desktop) */}
                            <button
                                type="submit"
                                disabled={saving}
                                className="hidden md:flex items-center gap-3 px-8 py-3.5 bg-gradient-to-r from-brand-600 to-brand-500 text-white rounded-2xl font-bold shadow-lg shadow-brand-500/30 hover:shadow-xl hover:shadow-brand-500/40 hover:-translate-y-1 transition-all disabled:opacity-70 disabled:cursor-not-allowed group"
                            >
                                {saving ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Save className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                )}
                                <span className="text-sm tracking-wide uppercase">{saving ? "Menyimpan..." : "Simpan Perubahan"}</span>
                            </button>
                        </div>

                        {/* Tampilkan Pesan Notifikasi */}
                        <div className={`transition-all duration-500 overflow-hidden ${message.text ? 'max-h-24 opacity-100 mb-8' : 'max-h-0 opacity-0 mb-0'}`}>
                            <div className={`p-4 rounded-2xl border backdrop-blur-sm flex items-center gap-3 ${
                                message.type === 'success' 
                                ? 'bg-green-50/80 border-green-200/50 text-green-700' 
                                : 'bg-red-50/80 border-red-200/50 text-red-700'
                            }`}>
                                {message.type === 'success' ? (
                                    <ShieldCheck className="w-5 h-5 shrink-0" />
                                ) : (
                                    <Info className="w-5 h-5 shrink-0" />
                                )}
                                <p className="font-semibold text-sm">{message.text}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                            
                            {/* Kiri: Info Dasar */}
                            <div className="space-y-7 relative">
                                {/* Vertical line separator for desktop */}
                                <div className="hidden lg:block absolute top-10 -right-5 w-px h-[calc(100%-40px)] bg-gradient-to-b from-transparent via-gray-200 to-transparent"></div>
                                
                                <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                                    <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center">
                                        <User className="w-5 h-5 text-brand-600" />
                                    </div>
                                    <h3 className="text-xl font-extrabold text-slate-800">Informasi Pribadi</h3>
                                </div>
                                
                                <div className="space-y-5">
                                    <div className="group">
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Email Terdaftar</label>
                                        <div className="relative">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                                                <Mail className="w-4 h-4 text-slate-400" />
                                            </div>
                                            <input 
                                                type="email" 
                                                value={userEmail}
                                                disabled
                                                className="w-full pl-14 pr-4 py-3.5 bg-slate-50/50 border border-slate-200/60 rounded-2xl text-sm text-slate-500 cursor-not-allowed font-medium"
                                            />
                                        </div>
                                        <p className="text-[11px] font-medium text-slate-400 mt-2 ml-1 flex items-center gap-1">
                                            <Info className="w-3 h-3" /> Email dikelola oleh Google dan tidak dapat diubah
                                        </p>
                                    </div>

                                    <div className="group">
                                        <label className="block text-sm font-bold text-slate-700 mb-2 group-focus-within:text-brand-600 transition-colors">Nama Lengkap</label>
                                        <div className="relative">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-brand-50 flex items-center justify-center group-focus-within:bg-brand-100 transition-colors">
                                                <User className="w-4 h-4 text-brand-600" />
                                            </div>
                                            <input 
                                                type="text" 
                                                value={form.name}
                                                onChange={(e) => setForm({...form, name: e.target.value})}
                                                className="w-full pl-14 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all shadow-sm hover:shadow-md"
                                                placeholder="Contoh: Budi Santoso"
                                            />
                                        </div>
                                    </div>

                                    <div className="group">
                                        <label className="block text-sm font-bold text-slate-700 mb-2 group-focus-within:text-brand-600 transition-colors">Nomor Telepon / WhatsApp</label>
                                        <div className="relative">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-brand-50 flex items-center justify-center group-focus-within:bg-brand-100 transition-colors">
                                                <Phone className="w-4 h-4 text-brand-600" />
                                            </div>
                                            <input 
                                                type="text" 
                                                value={form.phone}
                                                onChange={(e) => setForm({...form, phone: e.target.value})}
                                                className="w-full pl-14 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all shadow-sm hover:shadow-md"
                                                placeholder="0812xxxxxx"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Kanan: Alamat */}
                            <div className="space-y-7">
                                <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                                    <div className="w-10 h-10 rounded-xl bg-earth-50 flex items-center justify-center">
                                        <MapPin className="w-5 h-5 text-earth-600" />
                                    </div>
                                    <h3 className="text-xl font-extrabold text-slate-800">Alamat Pengiriman</h3>
                                </div>
                                
                                <div className="space-y-5">
                                    <div className="group">
                                        <label className="block text-sm font-bold text-slate-700 mb-2 group-focus-within:text-earth-600 transition-colors">Alamat Lengkap</label>
                                        <div className="relative">
                                            <div className="absolute left-4 top-4 w-8 h-8 rounded-full bg-earth-50 flex items-center justify-center group-focus-within:bg-earth-100 transition-colors">
                                                <Home className="w-4 h-4 text-earth-600" />
                                            </div>
                                            <textarea 
                                                rows={4}
                                                value={form.default_address}
                                                onChange={(e) => setForm({...form, default_address: e.target.value})}
                                                className="w-full pl-14 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-earth-500/10 focus:border-earth-500 outline-none transition-all shadow-sm hover:shadow-md resize-none"
                                                placeholder="Detail jalan, RT/RW, nomor rumah, blok, atau patokan..."
                                            ></textarea>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-5">
                                        <div className="group">
                                            <label className="block text-sm font-bold text-slate-700 mb-2 group-focus-within:text-earth-600 transition-colors">Kota / Kab</label>
                                            <div className="relative">
                                                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-earth-50 flex items-center justify-center group-focus-within:bg-earth-100 transition-colors">
                                                    <MapPin className="w-3.5 h-3.5 text-earth-600" />
                                                </div>
                                                <input 
                                                    type="text" 
                                                    value={form.city}
                                                    onChange={(e) => setForm({...form, city: e.target.value})}
                                                    className="w-full pl-12 pr-3 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-earth-500/10 focus:border-earth-500 outline-none shadow-sm hover:shadow-md transition-all"
                                                    placeholder="Jakarta Selatan"
                                                />
                                            </div>
                                        </div>
                                        <div className="group">
                                            <label className="block text-sm font-bold text-slate-700 mb-2 group-focus-within:text-earth-600 transition-colors">Kode Pos</label>
                                            <div className="relative">
                                                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-earth-50 flex items-center justify-center group-focus-within:bg-earth-100 transition-colors">
                                                    <Map className="w-3.5 h-3.5 text-earth-600" />
                                                </div>
                                                <input 
                                                    type="text" 
                                                    value={form.postal_code}
                                                    onChange={(e) => setForm({...form, postal_code: e.target.value})}
                                                    className="w-full pl-12 pr-3 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-earth-500/10 focus:border-earth-500 outline-none shadow-sm hover:shadow-md transition-all"
                                                    placeholder="12345"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tombol Simpan (Mobile) */}
                        <div className="mt-10 pt-8 border-t border-slate-100 md:hidden">
                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full flex justify-center items-center gap-3 px-6 py-4 bg-gradient-to-r from-brand-600 to-brand-500 text-white rounded-2xl font-bold shadow-lg shadow-brand-500/30 active:scale-95 transition-all disabled:opacity-70 disabled:scale-100"
                            >
                                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                <span className="tracking-wide uppercase text-sm">{saving ? "Menyimpan..." : "Simpan Perubahan"}</span>
                            </button>
                        </div>
                    </form>
                </div>
                
                {/* Footer / Branding Tip */}
                <div className="mt-8 text-center text-sm font-medium text-slate-400">
                    <p>Informasi profil Anda tersimpan aman dengan enkripsi.</p>
                </div>
            </div>
        </div>
    );
}
