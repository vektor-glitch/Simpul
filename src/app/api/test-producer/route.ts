import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
    const supabase = await createClient();
    
    const { data: producers, error: producerError } = await supabase
        .from('producer_profiles')
        .select(`
            *,
            user:users(name, role)
        `)
        .eq('user_id', '22222222-2222-2222-2222-222222222222');

    return NextResponse.json({ producers, producerError });
}
