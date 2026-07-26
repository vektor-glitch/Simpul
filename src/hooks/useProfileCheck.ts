import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export function useProfileCheck() {
    const [isChecking, setIsChecking] = useState(false);
    const supabase = createClient();
    const router = useRouter();

    const withProfileCheck = async (action: () => void) => {
        try {
            setIsChecking(true);
            const { data: { session } } = await supabase.auth.getSession();

            if (!session?.user) {
                toast.error("Anda harus masuk (login) terlebih dahulu.");
                router.push('/auth/login');
                return;
            }

            const userId = session.user.id;

            // Ambil role & data pengguna dasar
            const { data: userData, error: userError } = await supabase
                .from('users')
                .select('name, phone, role')
                .eq('id', userId)
                .single();

            if (userError || !userData) {
                toast.error("Gagal memverifikasi akun Anda.");
                return;
            }

            // Pengecekan Admin
            if (userData.role === 'admin') {
                if (!userData.name || !userData.phone) {
                    toast.error("Profil admin Anda belum lengkap!");
                    router.push('/dashboard/admin'); // Arahkan ke dashboard admin
                    return;
                }
            }

            // Pengecekan Buyer
            if (userData.role === 'buyer') {
                const { data: addresses } = await supabase
                    .from('addresses')
                    .select('id')
                    .eq('user_id', userId)
                    .limit(1);

                const hasAddress = addresses && addresses.length > 0;

                if (!userData.name || !userData.phone || !hasAddress) {
                    toast.error("Tunggu sebentar! Harap isi Nama, Nomor HP, dan simpan Alamat Anda terlebih dahulu.");
                    router.push('/dashboard/buyer/profile');
                    return;
                }
            }

            // Pengecekan Producer
            if (userData.role === 'producer') {
                const { data: profileData } = await supabase
                    .from('producer_profiles')
                    .select('business_name, location')
                    .eq('user_id', userId)
                    .single();

                if (!userData.name || !userData.phone || !profileData || !profileData.business_name || !profileData.location) {
                    toast.error("Tunggu sebentar! Harap lengkapi profil Penjual Anda terlebih dahulu.");
                    // Sementara arahkan ke dashboard producer utama karena belum ada halamannya
                    router.push('/dashboard/producer');
                    return;
                }
            }

            // Jika lolos semua pengecekan, jalankan aksi yang diminta!
            action();

        } catch (error) {
            console.error("Profile check error:", error);
            toast.error("Terjadi kesalahan sistem saat memverifikasi profil.");
        } finally {
            setIsChecking(false);
        }
    };

    return { withProfileCheck, isChecking };
}
