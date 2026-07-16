"use client";

import { useState } from "react";
import { Plus, Minus, MessageCircleQuestion } from "lucide-react";

const faqs = [
    {
        q: "Bagaimana jika Pool tidak mencapai target jumlah pesanan?",
        a: "Pool akan tetap terbuka hingga batas waktu yang ditentukan. Jika target belum terpenuhi, produsen tetap bisa menerima pesanan sesuai stok yang telah tergabung, atau Pool dapat diperpanjang oleh admin.",
    },
    {
        q: "Bagaimana Simpul memastikan produsen yang terdaftar benar-benar asli?",
        a: "Setiap produsen melalui proses verifikasi oleh admin platform sebelum dapat memasang produk, termasuk pengecekan identitas dan informasi usaha.",
    },
    {
        q: "Apakah pembayaran di Simpul aman?",
        a: "Seluruh transaksi diproses melalui sistem pembayaran pihak ketiga tepercaya, sehingga dana baru diteruskan setelah transaksi terverifikasi.",
    },
    {
        q: "Berapa biaya yang dikenakan platform?",
        a: "Fee platform ditampilkan secara terbuka di setiap produk sebagai bagian dari rincian harga tidak ada biaya tersembunyi.",
    },
    {
        q: "Apakah saya bisa menjadi produsen meskipun berada di daerah terpencil?",
        a: "Selama memiliki akses internet dan produk untuk dijual, siapa pun dapat mendaftar sebagai produsen di Simpul.",
    },
];

export default function FAQSection() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const toggleFaq = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section id="faq" className="bg-slate-50 py-24 md:py-24  border-t border-slate-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-start">

                    {/* Kolom Kiri: Judul & Kontak (Sticky) */}
                    <div className="lg:col-span-5 lg:sticky lg:top-32">
                        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight">
                            Masih ada yang ingin <span className="text-brand-600">ditanyakan?</span>
                        </h2>
                        <p className="mt-4 text-lg text-slate-500 max-w-md leading-relaxed">
                            Kami merangkum beberapa pertanyaan yang paling sering ditanyakan oleh produsen dan pembeli B2B kami.
                        </p>

                        {/* Kotak Bantuan Tambahan */}
                        <div className="mt-10 p-6 rounded-2xl bg-white border border-slate-200 shadow-sm max-w-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-brand-50 rounded-full blur-2xl -mr-10 -mt-10"></div>
                            <h3 className="font-bold text-slate-900 relative z-10">Belum menemukan jawaban?</h3>
                            <p className="text-sm text-slate-500 mt-2 mb-4 relative z-10">Tim support kami siap membantu kendalamu kapan saja.</p>
                            <a
                                href="https://wa.me/6208987153305?text=Halo%20Tim%20Simpul%2C%20saya%20punya%20pertanyaan%20terkait%20platform%20ini..."
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block w-full py-2.5 rounded-lg bg-brand-50 text-brand-700 font-semibold text-center hover:bg-brand-100 transition-colors relative z-10"
                            >
                                Hubungi via WhatsApp
                            </a>
                        </div>
                    </div>

                    {/* Kolom Kanan: Daftar Accordion FAQ */}
                    <div className="lg:col-span-7 space-y-4">
                        {faqs.map((faq, index) => {
                            const isOpen = openIndex === index;
                            return (
                                <div
                                    key={index}
                                    className={`rounded-2xl transition-all duration-300 ${isOpen ? "bg-white shadow-md border border-brand-100" : "bg-white/40 border border-slate-200 hover:bg-white hover:border-slate-300"
                                        }`}
                                >
                                    <button
                                        onClick={() => toggleFaq(index)}
                                        className="flex items-center justify-between w-full p-6 text-left focus:outline-none"
                                    >
                                        <span className={`font-semibold text-base md:text-lg transition-colors pr-4 ${isOpen ? "text-brand-700" : "text-slate-800"}`}>
                                            {faq.q}
                                        </span>
                                        <div className={`shrink-0 p-2 rounded-full transition-colors ${isOpen ? "bg-brand-100 text-brand-700" : "bg-slate-100 text-slate-500"}`}>
                                            {isOpen ? <Minus size={18} /> : <Plus size={18} />}
                                        </div>
                                    </button>

                                    {/* Animasi Buka/Tutup */}
                                    <div
                                        className={`grid transition-all duration-300 ease-in-out ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                                            }`}
                                    >
                                        <div className="overflow-hidden">
                                            <p className="px-6 pb-6 text-slate-600 leading-relaxed text-sm md:text-base">
                                                {faq.a}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}