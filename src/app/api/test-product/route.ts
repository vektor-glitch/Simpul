import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    const { data: product, error } = await supabase
        .from("products")
        .select(`
            *, 
            users!inner(
                name,
                phone, 
                producer_profiles(business_name, location, description)
            )
        `)
        .eq("id", id)
        .eq("is_active", true)
        .single();

    return NextResponse.json({ product, error });
}
