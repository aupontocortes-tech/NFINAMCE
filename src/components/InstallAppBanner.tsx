'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { APP_NAME, APP_SLOGAN } from '@/lib/brand';
import { X } from 'lucide-react';

const STORAGE_KEY = 'nfinance-hide-install-banner';

export function InstallAppBanner() {
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const hidden = localStorage.getItem(STORAGE_KEY);
    if (hidden === 'true') return;

    const isStandalone =
      typeof window !== 'undefined' &&
      (window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as { standalone?: boolean }).standalone === true);

    if (isStandalone) return;

    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        typeof navigator !== 'undefined' ? navigator.userAgent : ''
      );

    if (isMobile) {
      setVisible(true);
    }
  }, [mounted]);

  const handleDismiss = (dontShowAgain: boolean) => {
    setVisible(false);
    if (dontShowAgain) {
      localStorage.setItem(STORAGE_KEY, 'true');
    }
  };

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 p-4 pb-safe safe-area-inset-bottom md:hidden animate-in slide-in-from-bottom duration-300"
      role="banner"
      aria-label="Adicione o NFinance à tela inicial"
    >
      <div className="mx-auto max-w-lg rounded-2xl bg-zinc-900 shadow-2xl ring-1 ring-white/10 overflow-hidden">
        <div className="flex items-start gap-4 p-4">
          <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center overflow-hidden">
            <img
              src="/icon.svg"
              alt=""
              className="w-10 h-10"
              width={40}
              height={40}
            />
          </div>
          <div className="flex-1 min-w-0 pt-0.5">
            <h3 className="font-semibold text-zinc-50 text-base">{APP_NAME}</h3>
            <p className="text-sm text-zinc-400 mt-0.5">{APP_SLOGAN}</p>
            <p className="text-xs text-zinc-500 mt-2">
              Toque em compartilhar e depois em &quot;Adicionar à Tela de Início&quot; para abrir como app.
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleDismiss(false)}
            className="flex-shrink-0 p-2 -m-2 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-white/5 transition-colors"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex items-center gap-2 px-4 pb-4 pt-0">
          <Link
            href="/app"
            className="flex-1 py-2.5 rounded-xl bg-primary text-white text-center text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Ver como adicionar
          </Link>
          <button
            type="button"
            onClick={() => handleDismiss(true)}
            className="py-2.5 px-3 rounded-xl text-xs text-zinc-500 hover:text-zinc-300 hover:bg-white/5 transition-colors"
          >
            Não mostrar de novo
          </button>
        </div>
      </div>
    </div>
  );
}
