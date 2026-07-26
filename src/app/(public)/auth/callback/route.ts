// src/app/auth/callback/route.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')

    if (code) {
        const cookieStore = await cookies()
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) {
                        return cookieStore.get(name)?.value
                    },
                    set(name: string, value: string, options: CookieOptions) {
                        cookieStore.set({ name, value, ...options })
                    },
                    remove(name: string, options: CookieOptions) {
                        cookieStore.set({ name, value: '', ...options })
                    },
                },
            }
        )

        // Proses penukaran kode dengan sesi login yang sah
        const { data, error } = await supabase.auth.exchangeCodeForSession(code)
        
        if (!error && data.user) {
            // Cek role user
            const { data: profile } = await supabase
                .from('users')
                .select('role')
                .eq('id', data.user.id)
                .single()
                
            if (profile?.role === 'admin') {
                return NextResponse.redirect(`${origin}/dashboard/admin`)
            } else if (profile?.role === 'producer') {
                return NextResponse.redirect(`${origin}/dashboard/producer`)
            }
        }
    }

    // Jika buyer atau terjadi error / fallback
    return NextResponse.redirect(`${origin}/marketplace`)
}