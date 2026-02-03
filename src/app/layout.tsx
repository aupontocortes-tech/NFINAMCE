import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NFinance - Gestão para Personal Trainers",
  description: "Sua gestão. Seus alunos. Um só lugar. Gestão e cobrança para personal trainers.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
  appleWebApp: {
    capable: true,
    title: "NFinance",
    statusBarStyle: "black-translucent",
  },
  openGraph: {
    title: "NFinance - Gestão para Personal Trainers",
    description: "Sua gestão. Seus alunos. Um só lugar.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

import { AuthProvider } from '@/contexts/AuthContext';
import { SessionProvider } from '@/components/SessionProvider';
import { InstallAppBanner } from '@/components/InstallAppBanner';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-zinc-50`}
      >
        <SessionProvider>
          <AuthProvider>
            {children}
            <Toaster />
            <InstallAppBanner />
          </AuthProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
