'use client';
import { useEffect, useRef, useState } from 'react';

export default function FadeUp({ 
    children, 
    delay = 0,
    className = ""
}: { 
    children: React.ReactNode, 
    delay?: number,
    className?: string
}) {
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // IntersectionObserver adalah fitur bawaan browser yang mendeteksi kapan suatu elemen 
        // masuk ke dalam area layar (saat pengguna melakukan scroll).
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setIsVisible(true);
                observer.unobserve(entry.target); // Berhenti mendeteksi setelah animasi berjalan
            }
        }, { threshold: 0.1 }); // Akan memicu saat 10% dari elemen ini terlihat di layar

        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);

    return (
        <div 
            ref={ref} 
            className={`transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'} ${className}`} 
            style={{ transitionDelay: `${delay}ms` }}
        >
            {children}
        </div>
    );
}
