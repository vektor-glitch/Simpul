import { NextResponse } from 'next/server';
import { snap } from '@/lib/midtrans';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(request: Request) {
    try {
        const { order_id } = await request.json();

        if (!order_id) {
            return NextResponse.json({ error: 'Order ID wajib diisi' }, { status: 400 });
        }

        // Ambil detail pesanan dari Supabase
        const { data: order, error } = await supabaseAdmin
            .from('orders')
            .select('*')
            .eq('id', order_id)
            .single();

        if (error || !order) {
            console.error("Order tidak ditemukan:", error);
            return NextResponse.json({ error: 'Pesanan tidak ditemukan' }, { status: 404 });
        }
        
        // Persiapkan parameter untuk Midtrans Snap
        const parameter = {
            transaction_details: {
                order_id: order.id,
                gross_amount: Math.round(order.total_price) // Midtrans butuh integer
            },
            item_details: [
                {
                    id: order.product_id || order.pool_id || 'item-1',
                    price: Math.round(order.total_price),
                    quantity: 1, // Kita gabungkan saja semua harga (termasuk ongkir) ke dalam 1 item untuk kesederhanaan, atau bisa dipecah
                    name: `Pesanan Simpul - ${order.id.substring(0, 8)}`
                }
            ],
            customer_details: {
                first_name: "Pelanggan Simpul",
                // email tidak wajib jika tidak ada
                shipping_address: {
                    address: order.shipping_address
                }
            }
        };

        // Generate Snap Token
        const transaction = await snap.createTransaction(parameter);
        
        return NextResponse.json({ token: transaction.token, redirect_url: transaction.redirect_url });

    } catch (error: any) {
        console.error('Midtrans Snap Error:', error.message);
        return NextResponse.json({ error: 'Gagal membuat token pembayaran' }, { status: 500 });
    }
}
