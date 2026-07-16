// library from lenis
'use client'

import { useEffect } from "react"
import Lenis from "lenis"

export default function LenisProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        let lenis: any;
        // @ts-ignore
        lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smoothWheel: true,
            wheelMultiplier: 1.0,
            touchMultiplier: 1.5,
            infinite: false,
        });

        // Simpan ke object window agar bisa diakses secara global dari komponen lain
        (window as any).lenis = lenis;

        // game loop dari raf bahasa bayinya kayak mesin yang berputar setiap frame 
        function raf(time: number) {
            lenis.raf(time)
            requestAnimationFrame(raf)
        }

        requestAnimationFrame(raf)

        // pencegahan memory leak dari lenis nya
        return () => {
            lenis.destroy()
        }
    }, [])

    return <>{children}</>
}

// ini buat alur lenis
// dari layout.tsx render LenisProvider mount, useEffect jalan, lenis dibuat, raf loop dimulai, scroll jadi smooth
// saat user tutup tab nanti LenisProvider unmount, cleansup jalan, lenis.destroy() dipanggil, memory bersih dan ga leak