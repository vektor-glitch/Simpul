import { NextResponse } from 'next/server';
import { searchDestination } from '@/lib/rajaongkir';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q');

        if (!query || query.length < 3) {
            return NextResponse.json(
                { error: "Query parameter 'q' wajib diisi (minimal 3 karakter)" },
                { status: 400 }
            );
        }

        const results = await searchDestination(query);
        
        return NextResponse.json(results);
    } catch (error) {
        console.error("Error searching shipping destination:", error);
        return NextResponse.json(
            { error: "Gagal mencari lokasi pengiriman" },
            { status: 500 }
        );
    }
}
