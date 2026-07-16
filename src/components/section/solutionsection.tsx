export default function SolutionSection() {
    return (
        <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-14">
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-2 animate-fade-up">Kenapa <span className="text-brand-600">Simpul</span> Berbeda?</h2>
                    <p className="text-slate-500 mt-3 max-w-xl mx-auto animate-fade-up">Bukan sekadar toko online. Simpul dirancang untuk menjawab akar masalah yang membuat tengkulak masih bertahan.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {/* Card 1: Transparansi Harga */}
                    <div className="card-hover bg-linear-to-br from-brand-50 to-brand-100 rounded-2xl p-6 border border-brand-200 animate-fade-up">
                        <div className="w-12 h-12 rounded-xl bg-brand-600 flex items-center justify-center mb-4">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 20h16a2 2 0 002-2V8a2 2 0 00-2-2h-5.586a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 0010.586 3H4a2 2 0 00-2 2v13a2 2 0 002 2z" /></svg>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Transparansi Harga</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">Setiap produk menampilkan breakdown harga lengkap: harga produsen, ongkir aktual, dan fee platform. Tidak ada markup tersembunyi.</p>
                    </div>

                    {/* Card 2: Kekuatan Kolektif */}
                    <div className="card-hover bg-linear-to-br from-earth-50 to-earth-100 rounded-2xl p-6 border border-earth-200 animate-fade-up">
                        <div className="w-12 h-12 rounded-xl bg-earth-500 flex items-center justify-center mb-4">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Kekuatan Kolektif</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">Fitur Pool memungkinkan beberapa produsen sejenis bergabung memenuhi pesanan besar yang tidak bisa dilayani sendiri-sendiri.</p>
                    </div>

                    {/* Card 3: Kepercayaan & Keterlacakan */}
                    <div className="card-hover bg-linear-to-br from-blue-50 to-indigo-100 rounded-2xl p-6 border border-blue-200 animate-fade-up">
                        <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center mb-4">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Kepercayaan & Keterlacakan</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">Status pengiriman diperbarui real-time oleh produsen. Pembeli tahu persis di mana pesanannya berada dari dikemas hingga diterima.</p>
                    </div>
                </div>
            </div>
        </section>
    );
}