import { DeckCarousel } from "../ui/blur-reveal-deck";
import Image from "next/image";

const testimonials = [
    {
        name: "Siti Nur Kinasih",
        quote: "Biasanya hasil panen saya dibeli tengkulak dengan harga jauh di bawah pasar. Lewat Pool di Simpul, saya bisa gabung dengan petani lain dan memenuhi pesanan besar yang dulu tidak mungkin saya layani sendiri.",
        role: "-Petani Sayur, Jawa Tengah"
    },
    {
        name: "Azalya Mahmudah",
        quote: "Saya bisa lihat persis berapa yang saya bayar untuk produk, ongkir, dan biaya platform. Tidak ada kejutan harga.",
        role: "-Pembeli B2B, Restoran Sambel Uwenak"
    },
    {
        name: "Ibrahim",
        quote: "Sebagai pengrajin, biasanya saya kesulitan menjual ke luar daerah. Sekarang pembeli bisa menemukan produk saya langsung.",
        role: "-Pengrajin Anyaman, Kalimantan"
    },
]

export default function Testimonials() {
    return (
        <section className="bg-white pt-24 pb-12 md:pt-32 md:pb-16 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[10%] right-[10%] w-[500px] h-[500px] bg-brand-200 blob animate-float blur-3xl opacity-40"></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-8 items-start">

                    {/* Left Column: Text */}
                    <div className="text-left">
                        <h2 className="font-extrabold text-3xl md:text-5xl leading-tight text-slate-900">
                            Cerita dari <span className="text-brand-600">Simpul</span>
                        </h2>
                        <p className="mt-6 text-lg text-slate-500 leading-relaxed max-w-lg">
                            Gambaran nyata bagaimana Simpul bisa mengubah cara produsen dan pembeli bertransaksi. Dari petani yang mendapat harga adil hingga restoran yang menikmati transparansi.
                        </p>

                        <div className="mt-12 flex items-center gap-4">
                            <div className="text-sm font-medium text-slate-600">
                                Testimonials disamping hanya berupa <span className="text-brand-700 font-bold">ilustrasi skenario pengguna.</span> untuk keperluan demonstrasi
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Deck Carousel */}
                    <div className="flex justify-center lg:justify-end w-full relative">
                        {/* Decorative Quote Icon behind the deck */}
                        <div className="absolute -top-10 -left-6 text-[120px] leading-none font-serif text-brand-200/60 z-0 pointer-events-none selection:bg-transparent">
                            &ldquo;
                        </div>

                        <div className="w-full max-w-md h-112.5 relative z-10">
                            <DeckCarousel
                                items={testimonials.map(t => ({
                                    title: t.name,
                                    text: t.quote,
                                    role: t.role
                                }))}
                                accentColor="#16a34a"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}