'use client';

import Link from 'next/link';
import { Dumbbell, Smartphone } from 'lucide-react';

export default function AppDownloadPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-950 to-slate-900 flex flex-col items-center justify-center px-4 py-8">
      <div className="max-w-md w-full flex flex-col items-center text-center">
        {/* Logo NFinance */}
        <div className="flex flex-col items-center gap-4 mb-8">
          <div className="bg-primary/20 p-4 rounded-2xl">
            <Dumbbell className="w-16 h-16 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-zinc-50 tracking-tight">NFinance</h1>
          <p className="text-zinc-400 text-sm uppercase tracking-[0.2em]">Gestão para Personal Trainers</p>
        </div>

        {/* Ícone celular */}
        <div className="mb-6 p-3 rounded-full bg-white/5">
          <Smartphone className="w-10 h-10 text-zinc-300" />
        </div>

        {/* Mensagem para baixar o app */}
        <h2 className="text-xl font-semibold text-zinc-100 mb-2">
          Baixe o aplicativo NFinance
        </h2>
        <p className="text-zinc-400 text-sm leading-relaxed mb-8">
          Em breve disponível na App Store (iPhone) e Google Play (Android). 
          Organize alunos, cobranças e agenda direto do celular.
        </p>

        {/* Placeholder lojas */}
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xs mx-auto mb-8">
          <div className="flex-1 rounded-lg border border-zinc-600/60 bg-zinc-800/40 py-3 px-4 text-zinc-400 text-sm">
            App Store (em breve)
          </div>
          <div className="flex-1 rounded-lg border border-zinc-600/60 bg-zinc-800/40 py-3 px-4 text-zinc-400 text-sm">
            Google Play (em breve)
          </div>
        </div>

        {/* Link para usar no navegador */}
        <p className="text-zinc-500 text-xs mb-4">
          Enquanto isso, use o NFinance no navegador do seu celular.
        </p>
        <Link
          href="/login"
          className="text-primary hover:underline font-medium text-sm"
        >
          Abrir NFinance no navegador →
        </Link>
      </div>
    </div>
  );
}
