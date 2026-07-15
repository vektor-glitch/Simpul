import { Snap, CoreApi } from 'midtrans-client';

// ini buat nampilin pop up pembayaran 
export const snap = new Snap({
    isProduction: false, // ubah ke true kalo udah live
    serverKey: process.env.MIDTRANS_SERVER_KEY || '',
    clientKey: process.env.MIDTRANS_CLIENT_KEY || ''
});

// jika butuh webhook tingkat lanjut bisa ekspor coreAPI
export const coreApi = new CoreApi({
    isProduction: false,
    serverKey: process.env.MIDTRANS_SERVER_KEY || '',
    clientKey: process.env.MIDTRANS_CLIENT_KEY || ''
});