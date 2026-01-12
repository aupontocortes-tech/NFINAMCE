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

  const SidebarLink = ({ href, icon: Icon, label }: { href: string; icon: any; label: string }) => (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
        isActive(href) 
          ? 'bg-primary/10 text-primary font-medium shadow-sm' 
          : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
      }`}
    >
      <Icon className={`w-5 h-5 ${isActive(href) ? 'text-primary' : 'text-zinc-500'}`} />
      <span>{label}</span>
    </Link>
  );

  return (
    <div className="min-h-screen bg-zinc-50 flex">
      {/* Sidebar Desktop (Lado Esquerdo) */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-zinc-200 fixed inset-y-0 z-30">
        <div className="p-6 border-b border-zinc-200 flex items-center gap-2">
          <div className="bg-primary/10 p-2 rounded-lg">
            <Dumbbell className="text-primary w-6 h-6" />
          </div>
          <span className="font-bold text-xl text-zinc-900 tracking-tight">NFINANCE</span>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <SidebarLink href="/dashboard" icon={LayoutDashboard} label="Visão Geral" />
          <SidebarLink href="/dashboard/students" icon={Users} label="Meus Alunos" />
        </nav>

        <div className="p-4 border-t border-zinc-200 space-y-3 bg-zinc-50/50">
          <div className="w-full">
            <WhatsAppConnect />
          </div>
          <Button variant="outline" className="w-full justify-start gap-3 text-zinc-600 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors" asChild>
            <Link href="/">
              <LogOut className="w-4 h-4" />
              <span>Sair do Sistema</span>
            </Link>
          </Button>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col md:pl-64 min-w-0 transition-all duration-300">
        
        {/* Header Mobile (apenas visível em telas pequenas) */}
        <header className="md:hidden bg-white border-b border-zinc-200 sticky top-0 z-20 px-4 py-3 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <Dumbbell className="text-primary w-6 h-6" />
            <span className="font-bold text-lg">NFINANCE</span>
          </div>
          <div className="flex items-center gap-2">
            <WhatsAppConnect />
            <Button variant="ghost" size="icon" asChild>
              <Link href="/">
                <LogOut className="w-5 h-5 text-zinc-500" />
              </Link>
            </Button>
          </div>
        </header>

        {/* Conteúdo Principal */}
        <main className="flex-1 p-4 sm:p-8 max-w-6xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
          {children}
        </main>

        {/* Bottom Navigation Mobile */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-200 pb-safe pt-2 px-6 flex justify-around items-center z-20 safe-area-bottom">
          <Link href="/dashboard" className={`flex flex-col items-center gap-1 p-2 rounded-lg ${isActive('/dashboard') ? 'text-primary' : 'text-zinc-500'}`}>
            <LayoutDashboard className="w-6 h-6" />
            <span className="text-[10px] font-medium">Início</span>
          </Link>
          <Link href="/dashboard/students" className={`flex flex-col items-center gap-1 p-2 rounded-lg ${isActive('/dashboard/students') ? 'text-primary' : 'text-zinc-500'}`}>
            <Users className="w-6 h-6" />
            <span className="text-[10px] font-medium">Alunos</span>
          </Link>
        </nav>
      </div>
    </div>
  );
}
