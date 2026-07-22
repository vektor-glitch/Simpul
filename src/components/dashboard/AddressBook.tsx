"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { MapPin, Plus, Trash2, Edit2, Loader2, Star } from "lucide-react";
import { toast } from "react-hot-toast";
import LocationAutocomplete from "@/components/marketplace/LocationAutocomplete";

interface Address {
    id: string;
    label: string;
    recipient_name: string;
    phone: string;
    full_address: string;
    city: string;
    postal_code: string;
    is_primary: boolean;
    rajaongkir_location_id?: string;
}

export default function AddressBook() {
    const supabase = createClient();
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState({
        label: "",
        recipient_name: "",
        phone: "",
        full_address: "",
        city: "",
        postal_code: "",
        is_primary: false,
        rajaongkir_location_id: "",
    });

    const fetchAddresses = async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
            .from("addresses")
            .select("*")
            .eq("user_id", user.id)
            .order("is_primary", { ascending: false })
            .order("created_at", { ascending: false });

        if (!error && data) {
            setAddresses(data);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchAddresses();
    }, [supabase]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const addressData = {
            user_id: user.id,
            ...form
        };

        if (addressData.is_primary && addresses.length > 0) {
            // Unset current primary
            await supabase.from("addresses").update({ is_primary: false }).eq("user_id", user.id);
        } else if (addresses.length === 0) {
            addressData.is_primary = true;
        }

        if (editingId) {
            const { error } = await supabase.from("addresses").update(addressData).eq("id", editingId);
            if (error) {
                toast.error("Gagal memperbarui alamat");
            } else {
                toast.success("Alamat diperbarui");
                setIsFormOpen(false);
                fetchAddresses();
            }
        } else {
            const { error } = await supabase.from("addresses").insert(addressData);
            if (error) {
                toast.error("Gagal menambahkan alamat");
            } else {
                toast.success("Alamat berhasil ditambahkan");
                setIsFormOpen(false);
                fetchAddresses();
            }
        }
    };

    const handleDelete = async (id: string) => {
        const { error } = await supabase.from("addresses").delete().eq("id", id);
        if (error) {
            toast.error("Gagal menghapus alamat");
        } else {
            toast.success("Alamat dihapus");
            fetchAddresses();
        }
    };

    const handleSetPrimary = async (id: string) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        
        await supabase.from("addresses").update({ is_primary: false }).eq("user_id", user.id);
        await supabase.from("addresses").update({ is_primary: true }).eq("id", id);
        fetchAddresses();
        toast.success("Alamat utama diperbarui");
    };

    const openEditForm = (addr: Address) => {
        setForm({
            label: addr.label,
            recipient_name: addr.recipient_name,
            phone: addr.phone,
            full_address: addr.full_address,
            city: addr.city,
            postal_code: addr.postal_code,
            is_primary: addr.is_primary,
            rajaongkir_location_id: addr.rajaongkir_location_id || "",
        });
        setEditingId(addr.id);
        setIsFormOpen(true);
    };

    const openAddForm = () => {
        setForm({
            label: "",
            recipient_name: "",
            phone: "",
            full_address: "",
            city: "",
            postal_code: "",
            is_primary: false,
            rajaongkir_location_id: "",
        });
        setEditingId(null);
        setIsFormOpen(true);
    };

    if (loading) return <div className="py-4 flex justify-center"><Loader2 className="animate-spin text-brand-600" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-earth-50 flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-earth-600" />
                    </div>
                    <h3 className="text-xl font-extrabold text-slate-800">Buku Alamat</h3>
                </div>
                {!isFormOpen && (
                    <button onClick={openAddForm} className="text-brand-600 bg-brand-50 hover:bg-brand-100 px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-colors">
                        <Plus size={16} /> Tambah Alamat
                    </button>
                )}
            </div>

            {isFormOpen ? (
                <form onSubmit={handleSave} className="bg-gray-50 p-6 rounded-2xl border border-gray-200 space-y-4">
                    <h4 className="font-bold text-gray-800 mb-4">{editingId ? "Edit Alamat" : "Tambah Alamat Baru"}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Label Alamat</label>
                            <input required type="text" placeholder="Contoh: Rumah, Kantor" value={form.label} onChange={e => setForm({...form, label: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:border-brand-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Nama Penerima</label>
                            <input required type="text" value={form.recipient_name} onChange={e => setForm({...form, recipient_name: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:border-brand-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Nomor Telepon</label>
                            <input required type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:border-brand-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Kota/Kabupaten/Kecamatan</label>
                            <LocationAutocomplete
                                value={form.rajaongkir_location_id}
                                labelValue={form.city}
                                onChange={(id, label) => setForm({ ...form, rajaongkir_location_id: id, city: label })}
                                placeholder="Cari nama kecamatan atau kota..."
                            />
                            <p className="text-xs text-gray-500 mt-1">Pilih dari dropdown agar ongkos kirim akurat.</p>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-slate-700 mb-1">Alamat Lengkap</label>
                            <textarea required rows={3} value={form.full_address} onChange={e => setForm({...form, full_address: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:border-brand-500 outline-none"></textarea>
                        </div>
                        <div className="md:col-span-2 flex items-center justify-between">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Kode Pos</label>
                                <input required type="text" value={form.postal_code} onChange={e => setForm({...form, postal_code: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:border-brand-500 outline-none" />
                            </div>
                            <label className="flex items-center gap-2 cursor-pointer mt-4">
                                <input type="checkbox" checked={form.is_primary} onChange={e => setForm({...form, is_primary: e.target.checked})} className="w-5 h-5 accent-brand-600 rounded" />
                                <span className="text-sm font-medium text-slate-700">Jadikan Alamat Utama</span>
                            </label>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 mt-6 pt-4 border-t border-gray-200">
                        <button type="submit" className="px-6 py-2 bg-brand-600 text-white rounded-lg font-bold text-sm hover:bg-brand-700">Simpan</button>
                        <button type="button" onClick={() => setIsFormOpen(false)} className="px-6 py-2 bg-white text-gray-600 border border-gray-300 rounded-lg font-bold text-sm hover:bg-gray-50">Batal</button>
                    </div>
                </form>
            ) : (
                <div className="space-y-4">
                    {addresses.length === 0 ? (
                        <p className="text-gray-500 text-sm italic">Belum ada alamat tersimpan.</p>
                    ) : (
                        addresses.map((addr) => (
                            <div key={addr.id} className={`p-5 rounded-xl border-2 transition-all ${addr.is_primary ? 'border-brand-500 bg-brand-50/50' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="font-extrabold text-slate-800 bg-gray-100 px-2 py-1 rounded-md text-xs">{addr.label}</span>
                                            {addr.is_primary && <span className="bg-brand-100 text-brand-700 px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1"><Star size={12} className="fill-brand-600" /> Utama</span>}
                                        </div>
                                        <p className="font-bold text-gray-900">{addr.recipient_name}</p>
                                        <p className="text-gray-600 text-sm mt-1">{addr.phone}</p>
                                        <p className="text-gray-600 text-sm mt-1">{addr.full_address}</p>
                                        <p className="text-gray-600 text-sm">{addr.city}, {addr.postal_code}</p>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <button onClick={() => openEditForm(addr)} className="p-2 text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"><Edit2 size={16} /></button>
                                        <button onClick={() => handleDelete(addr.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                                    </div>
                                </div>
                                {!addr.is_primary && (
                                    <button onClick={() => handleSetPrimary(addr.id)} className="mt-4 text-xs font-bold text-brand-600 hover:text-brand-700 underline">Jadikan Utama</button>
                                )}
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
