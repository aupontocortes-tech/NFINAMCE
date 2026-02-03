'use client';

import Link from 'next/link';
import { APP_NAME, APP_SLOGAN, APP_SHORT_DESC } from '@/lib/brand';
import { Smartphone, Share2 } from 'lucide-react';

export default function AppDownloadPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-950 to-slate-900 flex flex-col items-center justify-center px-4 py-8">
      <div className="max-w-md w-full flex flex-col items-center text-center">
        {/* Ícone oficial do app */}
        <div className="mb-6 w-24 h-24 rounded-[1.75rem] overflow-hidden shadow-2xl ring-2 ring-white/10">
          <img
            src="/icon.svg"
            alt={`${APP_NAME} - ícone do aplicativo`}
            className="w-full h-full object-cover"
            width={96}
            height={96}
          />
        </div>

        <h1 className="text-3xl font-bold text-zinc-50 tracking-tight">{APP_NAME}</h1>
        <p className="text-primary font-medium text-sm mt-2 tracking-wide">{APP_SLOGAN}</p>
        <p className="text-zinc-500 text-xs mt-1">{APP_SHORT_DESC}</p>

        {/* Instrução para adicionar à tela inicial */}
        <div className="mt-10 w-full rounded-2xl bg-zinc-800/50 border border-zinc-700/50 p-5 text-left">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-primary/20">
              <Share2 className="w-5 h-5 text-primary" />
            </div>
            <h2 className="font-semibold text-zinc-100 text-base">Adicione à tela inicial</h2>
          </div>
          <p className="text-sm text-zinc-400 leading-relaxed">
            No seu celular, abra o menu do navegador (⋮ ou compartilhar), toque em <strong className="text-zinc-300">&quot;Adicionar à Tela de Início&quot;</strong> ou <strong className="text-zinc-300">&quot;Instalar app&quot;</strong>. O NFinance ficará como um ícone na sua tela, como um app.
          </p>
        </div>

        {/* Lojas em breve */}
        <p className="text-zinc-500 text-xs mt-6 mb-3">Em breve nas lojas</p>
        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs mx-auto mb-8">
          <div className="flex-1 rounded-xl border border-zinc-600/60 bg-zinc-800/40 py-3 px-4 text-zinc-400 text-sm font-medium">
            App Store
          </div>
          <div className="flex-1 rounded-xl border border-zinc-600/60 bg-zinc-800/40 py-3 px-4 text-zinc-400 text-sm font-medium">
            Google Play
          </div>
        </div>

        <Link
          href="/login"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-white font-medium text-sm hover:bg-primary/90 transition-colors"
        >
          <Smartphone className="w-4 h-4" />
          Abrir no navegador
        </Link>
      </div>
    </div>
  );
}
