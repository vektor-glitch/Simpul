"use client";

import { useState, useEffect, useRef } from "react";
import { Search, MapPin, Loader2 } from "lucide-react";
import { useDebounce } from "use-debounce";

interface Location {
    id: string;
    label: string;
}

interface LocationAutocompleteProps {
    value: string; // The ID
    labelValue: string; // The text label
    onChange: (id: string, label: string) => void;
    placeholder?: string;
    className?: string;
}

export default function LocationAutocomplete({ 
    value, 
    labelValue, 
    onChange, 
    placeholder = "Ketik nama kecamatan atau kota...",
    className = ""
}: LocationAutocompleteProps) {
    const [query, setQuery] = useState(labelValue);
    const [debouncedQuery] = useDebounce(query, 500);
    const [options, setOptions] = useState<Location[]>([]);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setQuery(labelValue);
    }, [labelValue]);

    useEffect(() => {
        const fetchLocations = async () => {
            if (!debouncedQuery || debouncedQuery.length < 3) {
                setOptions([]);
                return;
            }
            
            // Jangan fetch jika query sama dengan label yang sudah terpilih (berarti user tidak sedang mencari hal baru)
            if (debouncedQuery === labelValue) return;

            setLoading(true);
            try {
                const res = await fetch(`/api/shipping/search?q=${encodeURIComponent(debouncedQuery)}`);
                const data = await res.json();
                
                if (data?.meta?.code === 429 || data?.status === "error" || data?.meta?.status === "error") {
                    console.warn("API Limit exceeded, using local fallback options");
                    // Gunakan opsi fallback manual agar UI tidak nge-blank saat kuota habis
                    const queryLower = debouncedQuery.toLowerCase();
                    const localFallbacks = [
                        { id: "31517", label: "Sleman, DI Yogyakarta (Fallback)" },
                        { id: "31442", label: "Bantul, DI Yogyakarta (Fallback)" },
                        { id: "4878", label: "Bandung, Jawa Barat (Fallback)" },
                        { id: "31397", label: "Yogyakarta, DI Yogyakarta (Fallback)" },
                        { id: "31464", label: "Kulon Progo, DI Yogyakarta (Fallback)" },
                        { id: "31548", label: "Gunung Kidul, DI Yogyakarta (Fallback)" },
                        { id: "31454", label: "Sewon, Bantul, DI Yogyakarta (Fallback)" }
                    ].filter(opt => opt.label.toLowerCase().includes(queryLower));
                    
                    setOptions(localFallbacks);
                    setIsOpen(localFallbacks.length > 0);
                    return;
                }

                if (data?.data && Array.isArray(data.data)) {
                    setOptions(data.data.map((item: any) => ({
                        id: item.id.toString(),
                        label: item.label || item.name || item.text || "Lokasi Tidak Diketahui"
                    })));
                    setIsOpen(true);
                } else if (data?.data === null || !data?.data) {
                    setOptions([{ id: "limit", label: "Batas harian pencarian API habis. Silakan coba lagi besok." }]);
                    setIsOpen(true);
                }
            } catch (error) {
                console.error("Failed to fetch locations", error);
            } finally {
                setLoading(false);
            }
        };

        fetchLocations();
    }, [debouncedQuery, labelValue]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (loc: Location) => {
        setQuery(loc.label);
        onChange(loc.id, loc.label);
        setIsOpen(false);
    };

    return (
        <div ref={wrapperRef} className={`relative ${className}`}>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        if (e.target.value.length >= 3) setIsOpen(true);
                    }}
                    onFocus={() => {
                        if (options.length > 0) setIsOpen(true);
                    }}
                    placeholder={placeholder}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
                {loading && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <Loader2 className="animate-spin text-gray-400" size={18} />
                    </div>
                )}
            </div>

            {isOpen && options.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                    {options.map((loc) => (
                        <div
                            key={loc.id}
                            onClick={() => handleSelect(loc)}
                            className="flex items-start gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0"
                        >
                            <MapPin className="text-gray-400 mt-0.5 shrink-0" size={16} />
                            <div className="text-sm text-gray-700">{loc.label}</div>
                        </div>
                    ))}
                </div>
            )}
            
            {isOpen && query.length >= 3 && !loading && options.length === 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg p-4 text-center text-sm text-gray-500">
                    Lokasi tidak ditemukan
                </div>
            )}
        </div>
    );
}
