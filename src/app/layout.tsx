import type { Metadata } from "next";
import { Inter, Fredoka } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-fredoka",
});

export const metadata: Metadata = {
  title: "Équinox",
  description: "Festival étudiant – Tremplin DJ",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-black text-white">
        {/* NAVBAR */}
        <header className="sticky top-0 z-50 border-b border-neutral-800 bg-black/80 backdrop-blur">
          <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
            <Link href="/" className="font-bold tracking-tight">
              Équinox
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