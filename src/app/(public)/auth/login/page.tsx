"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { loginSchema } from "@/lib/validations/auth-validation";

export default function LoginPage() {
    const router = useRouter();
    const supabase = createClient();

    const [form, setForm] = useState({
        email: "", password: ""
    });
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);

        const parsed = loginSchema.safeParse(form);
        if (!parsed.success) {
            setError(parsed.error.issues[0].message);
            return;
        }

        setLoading(true);

        const { data: profile } = await supabase
            .from("users")
            .select("role")
            .eq("id", data.user.id)
            .single();

        if (profile?.role === "producer") {
            router.push("/dasboard/producer");
        }
        else if (profile?.role === "admin") {
            router.push("/dasboard/admin");
        }
        else {
            router.push("/marketplace");
        }
        router.refresh();
    }

    return (
        <div></div>
    )
}