import { NextResponse } from 'next/server';
import { calculateCost } from '@/lib/rajaongkir';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { origin, destination, weight, courier } = body;

        // Validasi input 
        if (!origin || !destination || !weight || !courier) {
            return NextResponse.json(
                { error: "Parameter origin, destination, weight, dan courier wajib diisi" },
                { status: 400 }
            );
        }

        // Panggil fungsi dari lib 
        const results = await calculateCost(origin, destination, weight, courier);

        return NextResponse.json({ results });
    }
    catch (error) {
        console.error("Error calculating shipping cost:", error);
        return NextResponse.json(
            { error: "Gagal menghitung ongkos kirim" },
            { status: 500 }
        );
    }
}