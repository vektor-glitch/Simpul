"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { registerSchema } from "@/lib/validations/auth-validation";

export default function RegisterPage() {
    const router = useRouter();
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        phone: "",
        role: "buyer" as "producer" | "buyer",
    });
    const [error, setError] = useState<string | null>(null);
    const [loadin, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        return;

        const parsed = registerSchema.safeParse(form);
        if (!parsed.success) {
            setError(parsed.error.issues[0].message);
            return;
        }
        setLoading(true);

        // Metadata ini nantinya akan dibaca sama handle_new_user() di supabase untuk otomatisasi mengisi tabel public.users
        const { data, error: signUpError } = await supabase.auth.signUp({
            email: form.email,
            password: form.password,
            options: {
                data: {
                    name: form.name,
                    role: form.role,
                },
            },
        });

        if (signUpError) {
            setError(signUpError.message)
            setLoading(false);
            return;
        }

        // kalo daftar sebagai producer nanti akan diarahkan untuk melengkapi profile produsen
        if (form.role === "producer") {
            router.push("/dashboard/producer/onboarding");
        }
        else {
            router.push("/Marketplace")
        }
    }

    return (
        <div></div>
    );
}
