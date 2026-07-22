"use client";

import { useEffect, useState } from "react";
import { Wallet, ArrowUpRight, ArrowDownRight, Clock, CheckCircle2, XCircle, CreditCard, Landmark } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatRupiah } from "@/lib/utils/format";
import toast from "react-hot-toast";

export default function WalletPage() {
    const supabase = createClient();
    const [balance, setBalance] = useState<number>(0);
    const [withdrawals, setWithdrawals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isWithdrawing, setIsWithdrawing] = useState(false);
    
    const [form, setForm] = useState({
        amount: "",
        bank_name: "",
        account_number: "",
        account_name: ""
    });

    useEffect(() => {
        fetchWalletData();
    }, []);

    const fetchWalletData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Hitung Total Pendapatan dari Pesanan (Selesai/Dikirim/Diproses)
            const validStatuses = ['processed', 'packed', 'shipped', 'delivered'];
            const { data: ordersData } = await supabase
                .from('orders')
                .select(`
                    status,
                    quantity,
                    product:products!inner (producer_id, price_producer)
                `)
                .eq('product.producer_id', user.id)
                .in('status', validStatuses);
            
            let totalRevenue = 0;
            if (ordersData) {
                totalRevenue = ordersData.reduce((sum, o) => sum + (o.quantity * (o.product?.price_producer || 0)), 0);
            }

            // Fetch semua riwayat penarikan dana
            const { data: withdrawalData, error: withdrawError } = await supabase
                .from('withdrawals')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            let totalWithdrawn = 0;
            if (withdrawalData) {
                setWithdrawals(withdrawalData);
                // Hitung total dana yang ditarik (hanya yang pending, processing, atau completed. Yang rejected dikembalikan ke saldo)
                const validWithdrawals = withdrawalData.filter(w => w.status !== 'rejected');
                totalWithdrawn = validWithdrawals.reduce((sum, w) => sum + w.amount, 0);
            }

            // Saldo Tersedia = Total Pendapatan - Total Penarikan
            setBalance(Math.max(0, totalRevenue - totalWithdrawn));
        } catch (error) {
            console.error("Error fetching wallet data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleWithdraw = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const amountNum = parseInt(form.amount.replace(/[^0-9]/g, ''));
        if (isNaN(amountNum) || amountNum <= 0) {
            toast.error("Masukkan nominal yang valid");
            return;
        }

        if (amountNum > balance && balance > 0) {
            toast.error("Saldo tidak mencukupi");
            return;
        }

        if (!form.bank_name || !form.account_number || !form.account_name) {
            toast.error("Lengkapi semua informasi rekening");
            return;
        }

        setIsWithdrawing(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            
            const { error } = await supabase
                .from('withdrawals')
                .insert({
                    user_id: user?.id,
                    amount: amountNum,
                    bank_name: form.bank_name,
                    account_number: form.account_number,
                    account_name: form.account_name,
                    status: 'pending'
                });

            if (error) throw error;

            // Karena perhitungan saldo sekarang dinamis (pendapatan dikurangi withdrawals), 
            // kita tidak perlu mengupdate tabel wallets lagi.

            toast.success("Permintaan penarikan dana berhasil dikirim!");
            setForm({ amount: "", bank_name: "", account_number: "", account_name: "" });
            fetchWalletData();
        } catch (error: any) {
            toast.error("Gagal meminta penarikan dana: " + error.message);
        } finally {
            setIsWithdrawing(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending': return <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-bold flex items-center gap-1"><Clock size={12}/> Menunggu</span>;
            case 'processing': return <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold flex items-center gap-1"><Clock size={12}/> Diproses</span>;
            case 'completed': return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold flex items-center gap-1"><CheckCircle2 size={12}/> Selesai</span>;
            case 'rejected': return <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-bold flex items-center gap-1"><XCircle size={12}/> Ditolak</span>;
            default: return null;
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Memuat data dompet...</div>;
    }

    return (
        <div className="max-w-5xl mx-auto pb-12">
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Dompet & Pencairan</h1>
                <p className="text-gray-500">Kelola saldo pendapatan dan tarik dana ke rekening bank Anda.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Balance & Withdraw Form */}
                <div className="lg:col-span-1 space-y-8">
                    {/* Balance Card */}
                    <div className="bg-gradient-to-br from-brand-600 to-brand-800 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-6 opacity-10">
                            <Wallet size={120} />
                        </div>
                        <div className="relative z-10">
                            <p className="text-brand-100 font-medium mb-1">Saldo Tersedia</p>
                            <h2 className="text-4xl font-black mb-6">Rp{(balance || 0).toLocaleString('id-ID')}</h2>
                            
                            <div className="flex items-center gap-2 text-sm text-brand-100 bg-black/10 w-fit px-3 py-1.5 rounded-lg">
                                <Landmark size={16} />
                                <span>Aman dalam Escrow</span>
                            </div>
                        </div>
                    </div>

                    {/* Withdraw Form */}
                    <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <ArrowDownRight className="text-brand-600" />
                            Tarik Dana
                        </h3>

                        <form onSubmit={handleWithdraw} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Nominal Penarikan (Rp)</label>
                                <input 
                                    type="text" 
                                    value={form.amount}
                                    onChange={(e) => setForm({...form, amount: e.target.value.replace(/[^0-9]/g, '')})}
                                    placeholder="Contoh: 1000000"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Nama Bank</label>
                                <select 
                                    value={form.bank_name}
                                    onChange={(e) => setForm({...form, bank_name: e.target.value})}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                                >
                                    <option value="">Pilih Bank</option>
                                    <option value="BCA">BCA</option>
                                    <option value="Mandiri">Mandiri</option>
                                    <option value="BNI">BNI</option>
                                    <option value="BRI">BRI</option>
                                    <option value="BSI">BSI</option>
                                    <option value="Jago">Bank Jago</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Nomor Rekening</label>
                                <input 
                                    type="text" 
                                    value={form.account_number}
                                    onChange={(e) => setForm({...form, account_number: e.target.value.replace(/[^0-9]/g, '')})}
                                    placeholder="1234567890"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Nama Pemilik Rekening</label>
                                <input 
                                    type="text" 
                                    value={form.account_name}
                                    onChange={(e) => setForm({...form, account_name: e.target.value})}
                                    placeholder="Sesuai buku tabungan"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                                />
                            </div>

                            <button 
                                type="submit"
                                disabled={isWithdrawing}
                                className="w-full mt-4 bg-gray-900 hover:bg-black text-white font-bold py-3.5 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isWithdrawing ? 'Memproses...' : 'Ajukan Penarikan'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Right Column: History */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden h-full">
                        <div className="p-6 border-b border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900">Riwayat Penarikan Dana</h3>
                        </div>
                        
                        {withdrawals.length === 0 ? (
                            <div className="p-12 text-center flex flex-col items-center">
                                <div className="w-16 h-16 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mb-4">
                                    <CreditCard size={32} />
                                </div>
                                <h4 className="font-bold text-gray-900 mb-1">Belum Ada Riwayat</h4>
                                <p className="text-gray-500 text-sm">Anda belum pernah melakukan penarikan dana.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {withdrawals.map((item) => (
                                    <div key={item.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50 transition-colors">
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                                                <Landmark className="text-gray-500" size={24} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-900">Penarikan ke {item.bank_name}</h4>
                                                <p className="text-sm text-gray-500 font-mono mt-1">{item.account_number} a.n {item.account_name}</p>
                                                <p className="text-xs text-gray-400 mt-2">
                                                    {new Date(item.created_at).toLocaleDateString('id-ID', {
                                                        day: 'numeric', month: 'long', year: 'numeric',
                                                        hour: '2-digit', minute: '2-digit'
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col sm:items-end gap-2">
                                            <span className="font-black text-gray-900 text-lg">Rp{item.amount.toLocaleString('id-ID')}</span>
                                            {getStatusBadge(item.status)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
