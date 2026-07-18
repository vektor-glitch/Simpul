import { createClient } from "@supabase/supabase-js";
import { notFound, redirect } from "next/navigation";
import MarketNav from "@/components/marketplace/marketplacenav";
import CheckoutClient from "@/components/marketplace/CheckoutClient";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import Script from "next/script";

export const dynamic = 'force-dynamic';

export default async function CheckoutPage({ searchParams }: { searchParams: Promise<{ product_id?: string, qty?: string }> }) {
    const { product_id, qty } = await searchParams;

    if (!product_id || !qty) {
        redirect("/marketplace");
    }

    const quantity = parseInt(qty);
    if (isNaN(quantity) || quantity <= 0) {
        redirect("/marketplace");
    }

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY! // Gunakan service role agar bisa ambil semua data produk
    );

    // Ambil data produk
    const { data: product, error: productError } = await supabase
        .from("products")
        .select(`
            *,
            users!inner(
                name,
                producer_profiles(business_name, location)
            )
        `)
        .eq("id", product_id)
        .eq("is_active", true)
        .single();

    if (productError || !product) {
        notFound();
    }

    // Karena user diarahkan ke sini, kita butuh tahu siapa yang login.
    // Di aplikasi sungguhan kita baca session dari cookie.
    // Namun untuk simulasi demo, kita akan biarkan CheckoutClient yang melakukan fetch user (karena Client Component bisa akses session lokal dengan mudah)
    const snapScriptUrl = process.env.MIDTRANS_IS_PRODUCTION === 'true' 
        ? "https://app.midtrans.com/snap/snap.js"
        : "https://app.sandbox.midtrans.com/snap/snap.js";

    return (
        <div className="min-h-screen bg-[#FAF7F0] flex flex-col font-sans">
            <Script
                src={snapScriptUrl}
                data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
                strategy="afterInteractive"
            />
            <MarketNav />

            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
                <Link href={`/marketplace/${product_id}`} className="inline-flex items-center gap-2 text-gray-500 hover:text-brand-600 font-medium mb-6 transition-colors">
                    <ChevronLeft size={18} />
                    Kembali ke Detail Produk
                </Link>

                <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-8">Checkout Pesanan</h1>

                {/* Bagian Interaktif dikelola oleh Client Component */}
                <CheckoutClient 
                    product={product} 
                    quantity={quantity} 
                />
            </main>
        </div>
    );
}
