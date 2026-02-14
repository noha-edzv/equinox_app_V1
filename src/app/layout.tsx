import type { Metadata } from "next";
import { Inter, Fredoka, Poppins } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import Image from "next/image";

const inter = Inter({ subsets: ["latin"] });
const poppins = Poppins({
   subsets: ["latin"],
    weight: ["200", "300", "400", "500", "600", "700"],
    display: "swap",
}); 

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-fredoka",
});

export const metadata: Metadata = {
  title: "Equinox",
  description: "Festival étudiant – Tremplin DJ",
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="dark">
      <body className="min-h-screen">
        {/* NAVBAR */}
        <header className="sticky top-0 z-50 border-b border-neutral-800 bg-black/80 backdrop-blur">
          <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center">
             <Image
              src="/equinox_fontVF2.png"
              alt="Équinox"
              width={105}
              height={30}
              priority
              />
            </Link>


            <nav className="flex items-center gap-4 text-sm text-neutral-300">
              <Link className="hover:text-white" href="/">Accueil</Link>
              <Link className="hover:text-white" href="/candidater">Candidater</Link>
              <Link className="hover:text-white" href="/vote">Vote</Link>
            </nav>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="mx-auto max-w-6xl px-6 py-10">
          {children}
        </main>
      </body>
    </html>
  );
}