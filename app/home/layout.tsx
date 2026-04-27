import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Stress Detection Application",
  description: "Real-time biometric stress monitoring and analytics.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.className} bg-[#0A0F2C] text-white antialiased min-h-screen`}
      >
        {/* SHARED NAVIGATION BAR */}
        <nav className="flex items-center justify-between px-6 md:px-12 py-8 max-w-7xl mx-auto border-b border-white/5">
          <div className="text-lg font-bold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
            Stress Detection Application
          </div>
          
          <div className="flex items-center gap-8 md:gap-12">
            <div className="hidden md:flex gap-12 text-xs font-bold tracking-widest">
              <Link 
                href="/" 
                className="hover:text-blue-400 transition-colors duration-200"
              >
                LIVE MONITORING
              </Link>
              <Link 
                href="/history" 
                className="hover:text-blue-400 transition-colors duration-200"
              >
                HISTORY
              </Link>
            </div>
            
            {/* Note: Profile Settings button logic usually stays in page.tsx 
                because it relies on the UserStore state which isn't globally 
                available in a Server Layout without extra setup.
            */}
          </div>
        </nav>

        {/* MAIN CONTENT AREA */}
        <main className="relative">
          {children}
        </main>

        {/* GLOBAL FOOTER (Optional) */}
        <footer className="py-10 text-center opacity-20 text-[10px] font-bold tracking-[0.2em] uppercase">
          © 2026 StressGuard AI • Biometric Research Division
        </footer>
      </body>
    </html>
  );
}