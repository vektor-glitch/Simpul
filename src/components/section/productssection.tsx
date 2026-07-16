import Link from "next/link";

export default function ProductsSection() {
    return (
        <section className="bg-slate-50 py-24 md:py-32">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <div className="flex flex-wrap items-end justify-between gap-6">
                    <div className="max-w-2xl">
                        <h2 className="font-extrabold text-3xl md:text-4xl">Produk dari Tangan <span className="text-brand-600"> Produsen Nusantara</span></h2>
                        <p className="mt-4 max-w-md text-slate-500">
                            Setiap produk di sini datang langsung dari petani, peternak, dan
                            pengrajin yang telah terverifikasi.
                        </p>
                    </div>
                    <Link href="/marketplace" className="whitespace-nowrap font-medium text-brand-500 hover:underline">
                        Lihat Semua Produk →
                    </Link>
                </div>
                {/* ini nanti disini isi card dari preview product di marketplace */}
            </div>
        </section>
    );
}