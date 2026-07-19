"use client";

import { useState } from "react";
import Image from "next/image";
import LogoSvg from "@/components/logo/LOGO-SIMPUL.svg";
import TeamA from "@/components/assets/team-A. -Vektorino I..webp";
import TeamLintang from "@/components/assets/team-Lintang Kinasih.webp";
import TeamVania from "@/components/assets/team-Vania Azalya Putri.webp";

const teamMembers = [
    { name: "A. Vektorino I.", role: "Junior Web Developer", image: TeamA },
    { name: "Lintang Kinasih", role: "Junior Web Developer", image: TeamLintang },
    { name: "Vania Azalya Putri", role: "Junior Web Developer", image: TeamVania },
];

const ArrowRight = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
);

const ArrowLeft = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></svg>
);

export default function AboutSection() {
    // 0 = Story/Vision slide, 1 = Team slide
    const [slide, setSlide] = useState(0);

    const toggleSlide = () => setSlide((prev) => (prev === 0 ? 1 : 0));

    return (
        <section id="about" className="bg-linear-to-br from-brand-700 to-brand-600 text-white pt-10 pb-16 md:pt-12 md:pb-20 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-150 h-150 bg-brand-400/20 blob animate-float blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-20 -left-20 w-100 h-100 bg-earth-400/20 blob animate-float blur-3xl pointer-events-none" style={{ animationDelay: '2s' }}></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">

                <div className="grid grid-cols-1 grid-rows-1 w-full items-center">

                    {/* SLIDE 1: CERITA & LOGO SIMPUL */}
                    <div className={`col-start-1 row-start-1 flex flex-col md:flex-row items-center gap-12 transition-all duration-700 ease-in-out py-4 ${slide === 0 ? "opacity-100 translate-x-0 pointer-events-auto" : "opacity-0 -translate-x-12 pointer-events-none"}`}
                    >
                        <div className="flex-1 space-y-6">
                            <h2 className="text-3xl md:text-4xl font-extrabold leading-tight tracking-tight">
                                Mengapa <span className="text-earth-300">Simpul</span> Ada?
                            </h2>
                            <p className="text-lg text-brand-50/90 leading-relaxed">
                                Berangkat dari keresahan melihat panjangnya rantai pasok yang menekan harga jual produsen dan melambungkan harga beli, Simpul hadir untuk memotong birokrasi itu memberikan keadilan harga bagi petani, peternak, dan pengrajin, serta transparansi penuh bagi pembeli B2B. <br /> <br />
                                Kami percaya produsen berhak tahu dan menentukan nilai dari kerja keras mereka sendiri, dan pembeli berhak tahu ke mana uang mereka benar-benar mengalir. Simpul dibangun untuk menyingkat jarak itu.


                            </p>
                        </div>
                        <div className="flex-1 flex justify-center w-full">
                            {/* Logo Bulat Besar */}
                            <div className="w-64 h-64 md:w-80 md:h-80 rounded-full bg-white border border-white/20 backdrop-blur-md flex items-center justify-center p-8 shadow-2xl relative">
                                <div className="absolute inset-4 rounded-full border border-white/10 border-dashed animate-[spin_20s_linear_infinite]"></div>
                                <div className="w-full h-full md:w-56 md:h-56" style={{ position: 'relative' }}>
                                    <Image src={LogoSvg} alt="Logo Simpul" fill className="object-contain" priority />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SLIDE 2: FOTO TIM */}
                    <div
                        className={`col-start-1 row-start-1 flex flex-col justify-center transition-all duration-700 ease-in-out py-4 ${slide === 1 ? "opacity-100 translate-x-0 pointer-events-auto" : "opacity-0 translate-x-12 pointer-events-none"
                            }`}
                    >
                        <div className="text-center mb-8">
                            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Wajah di Balik <span className="text-earth-300">Simpul</span></h2>
                            <p className="mt-3 text-brand-100 max-w-2xl mx-auto">
                                Kami berdedikasi membangun ekosistem rantai pasok yang adil dan transparan di seluruh pelosok negeri. Untuk Indonesia yang lebih sejahtera
                            </p>
                        </div>

                        {/* Grid Foto Tim: Flex Center untuk 3 Card */}
                        <div className="flex flex-wrap justify-center gap-6 w-full max-w-4xl mx-auto">
                            {teamMembers.map((member, idx) => (
                                <div key={idx} className="group rounded-2xl overflow-hidden bg-brand-800 aspect-[3/4] w-full max-w-[240px] border border-white/10 shadow-lg shrink-0" style={{ position: 'relative' }}>
                                    {/* MENGGUNAKAN IMPORT GAMBAR LANGSUNG */}
                                    <Image
                                        src={member.image}
                                        alt={`Anggota Tim ${member.name}`}
                                        fill
                                        priority={idx === 0}
                                        sizes="(max-width: 640px) 100vw, 240px"
                                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity"></div>
                                    <div className="absolute bottom-0 left-0 w-full p-4 md:p-5 transform translate-y-2 transition-transform duration-300 group-hover:translate-y-0">
                                        <h3 className="text-white font-bold text-base md:text-lg">{member.name}</h3>
                                        <p className="text-earth-300 text-xs md:text-sm font-medium mt-1">{member.role}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Tombol Next / Back */}
                <div className="relative z-20 mt-8 flex justify-center md:justify-end w-full">
                    <button
                        onClick={toggleSlide}
                        className="flex items-center gap-3 bg-white text-brand-700 hover:bg-earth-100 px-6 py-3.5 rounded-full font-bold transition-all shadow-lg hover:shadow-2xl hover:-translate-y-1 active:translate-y-0"
                    >
                        {slide === 0 ? (
                            <>Lihat Tim Kami <ArrowRight /></>
                        ) : (
                            <><ArrowLeft /> Kembali ke Cerita</>
                        )}
                    </button>
                </div>
            </div>
        </section>
    );
}
