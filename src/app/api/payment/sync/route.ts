import { NextResponse } from 'next/server';
import { coreApi } from '@/lib/midtrans';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(request: Request) {
    try {
        const { order_id } = await request.json();

        if (!order_id) {
            return NextResponse.json({ error: 'Order ID wajib diisi' }, { status: 400 });
        }

        // Cek status ke Midtrans Server
        const statusResponse = await coreApi.transaction.status(order_id);
        const transactionStatus = statusResponse.transaction_status;
        const fraudstatus = statusResponse.fraud_status;

        let paymentStatus = 'pending';

        if (transactionStatus === 'capture') {
            if (fraudstatus === 'challenge') {
                paymentStatus = 'pending';
            } else if (fraudstatus === 'accept') {
                paymentStatus = 'processed';
            }
        }
        else if (transactionStatus === 'settlement') {
            paymentStatus = 'processed';
        }
        else if (transactionStatus === 'cancel' || transactionStatus === 'deny' || transactionStatus === 'expire') {
            paymentStatus = 'cancelled';
        }
        else if (transactionStatus === 'pending') {
            paymentStatus = 'pending';
        }

        // Update database Supabase
        const { error } = await supabaseAdmin
            .from('orders')
            .update({ status: paymentStatus })
            .eq('id', order_id);

        if (error) {
            console.error('Gagal update status pesanan di Supabase saat sinkronisasi:', error);
            return NextResponse.json({ error: 'Gagal update database' }, { status: 500 });
        }

        return NextResponse.json({ status: paymentStatus, message: 'Sinkronisasi berhasil' }, { status: 200 });

    } catch (error: any) {
        // Jika error 404 dari Midtrans (transaksi belum ada/belum dibayar via token)
        if (error.httpStatusCode === 404) {
             return NextResponse.json({ status: 'pending', message: 'Transaksi belum dibuat di Midtrans' }, { status: 200 });
        }

        console.error('Midtrans Sync Error:', error.message);
        return NextResponse.json({ error: 'Gagal melakukan sinkronisasi' }, { status: 500 });
    }
}
