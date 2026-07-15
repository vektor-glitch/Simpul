import { NextResponse } from "next/server";
import { coreApi } from '@/lib/midtrans';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // ini buat verifikasi keaslian notifikasi langsung ke midtrans
        const statusResponse = await coreApi.transaction.notification(body);
        const orderID = statusResponse.order_id;
        const transactionStatus = statusResponse.transaction_status;
        const fraudstatus = statusResponse.fraud_status;

        console.log(`Webhook notification from midtrans - Order ID: ${orderID}, Transaction Status: ${transactionStatus}, Fraud Status: ${fraudstatus}`);

        // menentukan status pesenan di database berdasarkan response midtrans
        let paymentStatus = 'Pending';

        if (transactionStatus === 'capture') {
            if (fraudstatus === 'challenge') {
                paymentStatus = 'challenge';
            } else if (fraudstatus === 'accept') {
                paymentStatus = 'success';
            }
        }
        else if (transactionStatus === 'setttlement') {
            paymentStatus = 'success';
        }
        else if (transactionStatus === 'cancel' || transactionStatus === 'deny' || transactionStatus === 'expire') {
            paymentStatus = 'failed';
        }
        else if (transactionStatus === 'pending') {
            paymentStatus = 'pending';
        }

        const { error } = await supabaseAdmin
            .from('orders')
            .update({ status: paymentStatus })
            .eq('id', orderID)
        if (error) {
            console.error('Gagal update status pesanan di Supabase:', error);
        }

        // midtrans butuh response 200 ok agar tau notifikasi berhasil diterima
        return NextResponse.json({ status: 'ok', message: 'Webhook received' }, { status: 200 });
    }
    catch (error) {
        console.error('Midtrans Webhook Error:', error);
        return NextResponse.json({ error: 'Webhook Processing Failed' }, { status: 500 });
    }
}