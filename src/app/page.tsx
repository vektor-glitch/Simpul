import Navbar from '@/components/ui/navbar';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-gray-100">

      {/* Panggil Navbar KHUSUS di halaman ini saja */}
      <Navbar />

      {/* Bagian Hero Section (Konten Utama Landing Page) */}
      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center justify-center min-h-[80vh] text-center">

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-8 animate-fade-in-up">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          Rantai Pasok Lokal Era Baru
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
          Harga <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">Transparan</span>, <br />
          Kekuatan <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">Kolektif</span>.
        </h1>

        <p className="mt-4 text-xl text-gray-400 max-w-2xl mx-auto mb-10">
          Simpul menghubungkan produsen lokal langsung dengan pembeli. Tidak ada tengkulak, tidak ada markup tersembunyi.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <button className="px-8 py-4 rounded-full text-white bg-emerald-600 hover:bg-emerald-500 font-semibold transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)]">
            Mulai Belanja
          </button>
          <button className="px-8 py-4 rounded-full text-gray-300 bg-white/5 hover:bg-white/10 border border-white/10 font-semibold transition-all">
            Gabung Sebagai Produsen
          </button>
        </div>

      </main>
    </div>
  );
}