'use client';

import Link from 'next/link';
import { APP_NAME, APP_SLOGAN, APP_SHORT_DESC } from '@/lib/brand';
import { Smartphone, Share2, Download } from 'lucide-react';

export default function AppDownloadPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-950 to-slate-900 flex flex-col items-center justify-center px-4 py-8">
      <div className="max-w-md w-full flex flex-col items-center text-center">
        {/* Ícone do app (o que você enviou) */}
        <div className="mb-6 w-28 h-28 rounded-[1.75rem] overflow-hidden shadow-2xl ring-2 ring-white/10">
          <img
            src="/icon.svg"
            alt={`${APP_NAME} - ícone do aplicativo`}
            className="w-full h-full object-cover"
            width={112}
            height={112}
          />
        </div>

        <h1 className="text-3xl font-bold text-zinc-50 tracking-tight">Baixe o {APP_NAME}</h1>
        <p className="text-primary font-medium text-sm mt-2 tracking-wide">{APP_SLOGAN}</p>
        <p className="text-zinc-500 text-xs mt-1">{APP_SHORT_DESC}</p>

        {/* Instruções por sistema */}
        <div className="mt-10 w-full space-y-4 text-left">
          <div className="rounded-2xl bg-zinc-800/50 border border-zinc-700/50 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-emerald-500/20">
                <Download className="w-5 h-5 text-emerald-400" />
              </div>
              <h2 className="font-semibold text-zinc-100 text-base">Android (Chrome)</h2>
            </div>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Toque no menu <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-zinc-600 text-zinc-200 text-xs">⋮</span> no canto superior direito da tela → <strong className="text-zinc-200">&quot;Instalar app&quot;</strong> ou <strong className="text-zinc-200">&quot;Adicionar à tela inicial&quot;</strong>. O ícone do NFinance aparecerá na tela inicial.
            </p>
          </div>

          <div className="rounded-2xl bg-zinc-800/50 border border-zinc-700/50 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <Share2 className="w-5 h-5 text-primary" />
              </div>
              <h2 className="font-semibold text-zinc-100 text-base">iPhone / iPad (Safari)</h2>
            </div>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Abra o site no <strong className="text-zinc-200">Safari</strong>. Toque no ícone de <strong className="text-zinc-200">Compartilhar</strong> (quadrado com seta para cima) na parte de baixo da tela → <strong className="text-zinc-200">&quot;Adicionar à Tela de Início&quot;</strong>. Toque em &quot;Adicionar&quot;. O NFinance ficará como app na sua tela inicial.
            </p>
          </div>
        </div>

        <Link
          href="/login"
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-white font-medium text-sm hover:bg-primary/90 transition-colors"
        >
          <Smartphone className="w-4 h-4" />
          Abrir no navegador
        </Link>
      </div>
    </div>
  );
}
