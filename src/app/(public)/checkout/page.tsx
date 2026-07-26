import { createClient } from "@supabase/supabase-js";
import { notFound, redirect } from "next/navigation";
import MarketNav from "@/components/marketplace/marketplacenav";
import CheckoutClient from "@/components/marketplace/CheckoutClient";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import Script from "next/script";

export const dynamic = 'force-dynamic';

export default async function CheckoutPage({ searchParams }: { searchParams: Promise<{ product_id?: string, pool_id?: string, qty?: string }> }) {
    const { product_id, pool_id, qty } = await searchParams;

    if ((!product_id && !pool_id) || !qty) {
        redirect("/marketplace");
    }

    const quantity = parseInt(qty);
    if (isNaN(quantity) || quantity <= 0) {
        redirect("/marketplace");
    }

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    let checkoutItem = null;
    let itemType: 'product' | 'pool' = 'product';

    if (product_id) {
        // Ambil data produk
        const { data: product, error: productError } = await supabase
            .from("products")
            .select(`
                *,
                users!inner(
                    name,
                    producer_profiles(business_name, location, rajaongkir_location_id)
                )
            `)
            .eq("id", product_id)
            .eq("is_active", true)
            .single();

        if (productError || !product) {
            notFound();
        }
        
        const producerProfile = Array.isArray(product.users?.producer_profiles) 
            ? product.users?.producer_profiles[0] 
            : product.users?.producer_profiles;

        checkoutItem = {
            id: product.id,
            name: product.name,
            price: product.price_final,
            image_url: product.image_url,
            unit: product.unit,
            storeName: producerProfile?.business_name || product.users?.name,
            storeLocation: producerProfile?.location || 'Lokasi tidak diketahui',
            storeLocationId: producerProfile?.rajaongkir_location_id || ''
        };
        itemType = 'product';
    } else if (pool_id) {
        // Ambil data pool
        const { data: pool, error: poolError } = await supabase
            .from("pools")
            .select("*")
            .eq("id", pool_id)
            .single();

        if (poolError || !pool) {
            notFound();
        }

        checkoutItem = {
            id: pool.id,
            name: `Pool: ${pool.title}`,
            price: pool.price,
            image_url: pool.image_url,
            unit: pool.unit,
            storeName: "Gabungan Produsen (Pool Grosir)",
            storeLocation: pool.region
        };
        itemType = 'pool';
    }

    // Fetch platform settings for admin fee
    const { data: settings } = await supabase.from("platform_settings").select("admin_fee_percentage").limit(1).single();
    const adminFeePercentage = settings?.admin_fee_percentage || 5;

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
                <Link href={product_id ? `/marketplace/${product_id}` : `/pools/${pool_id}`} className="inline-flex items-center gap-2 text-gray-500 hover:text-brand-600 font-medium mb-6 transition-colors">
                    <ChevronLeft size={18} />
                    Kembali ke Detail
                </Link>

                <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-8">Checkout Pesanan</h1>

                {/* Bagian Interaktif dikelola oleh Client Component */}
                <CheckoutClient item={checkoutItem} quantity={quantity} itemType={itemType} adminFeePercentage={adminFeePercentage} />
            </main>
        </div>
    );
}
