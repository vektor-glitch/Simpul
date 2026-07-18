import { Snap, CoreApi } from 'midtrans-client';

const isProduction = process.env.MIDTRANS_IS_PRODUCTION === 'true';

// ini buat nampilin pop up pembayaran 
export const snap = new Snap({
    isProduction: isProduction,
    serverKey: process.env.MIDTRANS_SERVER_KEY || '',
    clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || ''
});

// jika butuh webhook tingkat lanjut bisa ekspor coreAPI
export const coreApi = new CoreApi({
    isProduction: isProduction,
    serverKey: process.env.MIDTRANS_SERVER_KEY || '',
    clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || ''
});