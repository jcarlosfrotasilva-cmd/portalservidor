import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Portal do Servidor | EE Profª Marlene Frattini",
  description: "Sistema de Gestão de Servidores - EE Profª Marlene Frattini",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body className="bg-slate-50 text-slate-900 antialiased">
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
