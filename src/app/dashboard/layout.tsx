'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, LogOut, Dumbbell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WhatsAppConnect } from '@/components/features/WhatsAppConnect';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      {/* Header Mobile-first - NFINANCE */}
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-10 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <Dumbbell className="text-primary w-6 h-6" />
          <span className="font-bold text-lg hidden sm:inline">NFINANCE</span>
        </div>
        
        <div className="flex items-center gap-2">
          <WhatsAppConnect />
          <Button variant="ghost" size="icon" asChild title="Sair">
            <Link href="/">
              <LogOut className="w-5 h-5 text-zinc-500" />
            </Link>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 pb-20 max-w-5xl mx-auto w-full">
        {children}
      </main>

      {/* Bottom Navigation (Mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-200 py-2 px-6 flex justify-around items-center md:hidden">
        <Link href="/dashboard" className={`flex flex-col items-center gap-1 ${isActive('/dashboard') ? 'text-primary' : 'text-zinc-500'}`}>
          <LayoutDashboard className="w-6 h-6" />
          <span className="text-xs font-medium">Início</span>
        </Link>
        <Link href="/dashboard/students" className={`flex flex-col items-center gap-1 ${isActive('/dashboard/students') ? 'text-primary' : 'text-zinc-500'}`}>
          <Users className="w-6 h-6" />
          <span className="text-xs font-medium">Alunos</span>
        </Link>
      </nav>
      
      {/* Desktop Sidebar (Placeholder - could be added for larger screens) */}
    </div>
  );
}
