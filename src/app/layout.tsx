import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Geist } from "next/font/google";
import "./globals.css";
import LenisProvider from "@/components/ui/lenis";
import { cn } from "@/lib/utils";
import { Toaster } from "react-hot-toast";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Simpul — Platform Marketplace UMKM Lokal",
  description:
    "Simpul menghubungkan petani, peternak, dan pengrajin lokal langsung ke pembeli tanpa tengkulak. Harga transparan, kekuatan tawar kolektif, dan pengiriman terlacak.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={cn("antialiased", plusJakartaSans.variable, "font-sans", geist.variable)}
    >
      <body className="flex flex-col">
        <LenisProvider>
          {children}
          <Toaster 
            position="bottom-right" 
            toastOptions={{
              style: {
                borderRadius: '16px',
                background: '#333',
                color: '#fff',
                padding: '16px',
                fontWeight: '600',
              },
            }} 
          />
        </LenisProvider>
      </body>
    </html>
  );
}
