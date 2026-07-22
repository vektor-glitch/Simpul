import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ProductsClient from "./ProductsClient";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

export default async function ProducerProductsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/auth/login");
    }

    // Periksa apakah user verified
    const { data: userData } = await supabase
        .from("users")
        .select("verified")
        .eq("id", user.id)
        .single();

    if (!userData?.verified) {
        return (
            <div className="max-w-4xl mx-auto py-12">
                <div className="bg-yellow-50 border border-yellow-200 rounded-3xl p-8 flex flex-col items-center text-center shadow-sm">
                    <div className="w-16 h-16 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mb-4">
                        <AlertCircle size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-yellow-900 mb-2">Akses Terbatas</h2>
                    <p className="text-yellow-700 max-w-md mx-auto mb-6">
                        Akun Anda sedang dalam antrean verifikasi. Anda baru bisa menambahkan dan mengelola produk setelah disetujui oleh tim Admin.
                    </p>
                    <Link href="/dashboard/producer" className="bg-yellow-200 text-yellow-800 font-bold px-6 py-3 rounded-xl hover:bg-yellow-300 transition-colors">
                        Kembali ke Overview
                    </Link>
                </div>
            </div>
        );
    }

    // Ambil data produk
    const { data: products } = await supabase
        .from("products")
        .select("*")
        .eq("producer_id", user.id)
        .order("created_at", { ascending: false });

    return (
        <div className="max-w-6xl mx-auto">
            <ProductsClient initialProducts={products || []} userId={user.id} />
        </div>
    );
}
