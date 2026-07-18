// Proxy ini berfungsi sebagai autentifikasi role dari user
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
    let response = NextResponse.next();

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value)
                    );
                    response = NextResponse.next({ request });
                    cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    const {
        data: { user },
    } = await supabase.auth.getUser();

    const path = request.nextUrl.pathname;
    const isDasboardRoute = path.startsWith('/dashboard');
    const isAuthRoute = path.startsWith('/auth');

    // ini belum login tapi coba akses dashboard, nanti bakal redirect ke login
    if (isDasboardRoute && !user) {
        return NextResponse.redirect(new URL("/auth/login", request.url));
    }

    // ini kalo udah login tapi buka ke login/register page, nanti bakal di redirect ke marketplace
    if (isAuthRoute && user) {
        return NextResponse.redirect(new URL("/marketplace", request.url));
    }

    // ini proteksi role specific dashboard
    if (isDasboardRoute && user) {
        const { data: profile } = await supabase
            .from("users")
            .select("role")
            .eq("id", user.id)
            .single();

        const role = profile?.role;

        if (path.startsWith("/dashboard/producer") && role !== "producer") {
            return NextResponse.redirect(new URL("/marketplace", request.url));
        }
        if (path.startsWith("/dashboard/admin") && role !== "admin") {
            return NextResponse.redirect(new URL("/marketplace", request.url));
        }

        // Auto-redirect jika user mengakses root /dashboard
        if (path === "/dashboard" || path === "/dashboard/") {
            if (role === "buyer") return NextResponse.redirect(new URL("/dashboard/buyer/profile", request.url));
            if (role === "producer") return NextResponse.redirect(new URL("/dashboard/producer", request.url));
            if (role === "admin") return NextResponse.redirect(new URL("/dashboard/admin", request.url));
            return NextResponse.redirect(new URL("/marketplace", request.url));
        }
    }

    return response;
}

export const config = {
    matcher: ["/dashboard/:path*", "/auth/:path*"],
};