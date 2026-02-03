'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { APP_NAME, APP_SLOGAN } from '@/lib/brand';
import { X, Smartphone, Download } from 'lucide-react';

const STORAGE_KEY = 'nfinance-hide-install-banner';

type BeforeInstallPromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }> };

export function InstallAppBanner() {
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const ua = navigator.userAgent;
    setIsIOS(/iPhone|iPad|iPod/i.test(ua));
    setIsAndroid(/Android/i.test(ua));

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const hidden = localStorage.getItem(STORAGE_KEY);
    if (hidden === 'true') return;

    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as { standalone?: boolean }).standalone === true;

    if (isStandalone) return;

    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile) setVisible(true);
  }, [mounted]);

  const handleDismiss = (dontShowAgain: boolean) => {
    setVisible(false);
    if (dontShowAgain) localStorage.setItem(STORAGE_KEY, 'true');
  };

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') setVisible(false);
    setInstallPrompt(null);
  };

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 p-4 pb-[env(safe-area-inset-bottom)] md:hidden animate-in slide-in-from-bottom duration-300"
      role="banner"
      aria-label="Baixe o aplicativo NFinance"
    >
      <div className="mx-auto max-w-lg rounded-2xl bg-zinc-900 shadow-2xl ring-1 ring-white/10 overflow-hidden">
        <div className="flex items-start gap-4 p-4">
          <div className="flex-shrink-0 w-16 h-16 rounded-2xl overflow-hidden ring-2 ring-white/10 shadow-lg">
            <img
              src="/icon.svg"
              alt=""
              className="w-full h-full object-cover"
              width={64}
              height={64}
            />
          </div>
          <div className="flex-1 min-w-0 pt-0.5">
            <h3 className="font-bold text-zinc-50 text-lg">Baixe o {APP_NAME}</h3>
            <p className="text-sm text-zinc-400 mt-0.5">{APP_SLOGAN}</p>
            <p className="text-xs text-zinc-500 mt-2">
              Use como app no seu celular: ícone na tela inicial, abre mais rápido.
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

        {/* Instruções por sistema */}
        <div className="px-4 pb-3 space-y-2">
          {isAndroid && (
            <div className="rounded-xl bg-zinc-800/60 border border-zinc-700/50 p-3">
              <p className="text-xs font-medium text-zinc-300 mb-1">Android (Chrome)</p>
              <p className="text-xs text-zinc-400">
                Toque no menu <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-zinc-600 text-zinc-200 text-[10px]">⋮</span> no canto superior direito → <strong className="text-zinc-200">&quot;Instalar app&quot;</strong> ou <strong className="text-zinc-200">&quot;Adicionar à tela inicial&quot;</strong>.
              </p>
            </div>
          )}
          {isIOS && (
            <div className="rounded-xl bg-zinc-800/60 border border-zinc-700/50 p-3">
              <p className="text-xs font-medium text-zinc-300 mb-1">iPhone / iPad (Safari)</p>
              <p className="text-xs text-zinc-400">
                Toque em <strong className="text-zinc-200">Compartilhar</strong> <span className="text-zinc-500">(ícone com seta para cima)</span> na parte de baixo da tela → <strong className="text-zinc-200">&quot;Adicionar à Tela de Início&quot;</strong>.
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 px-4 pb-4 pt-0">
          {isAndroid && installPrompt && (
            <button
              type="button"
              onClick={handleInstallClick}
              className="flex-1 py-3 rounded-xl bg-primary text-white font-medium text-sm flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors"
            >
              <Download className="w-4 h-4" />
              Instalar app
            </button>
          )}
          <Link
            href="/app"
            className={`py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-colors ${
              isAndroid && installPrompt
                ? 'flex-1 border border-zinc-600 text-zinc-300 hover:bg-zinc-800'
                : 'flex-1 bg-primary text-white hover:bg-primary/90'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            Ver instruções
          </Link>
          <button
            type="button"
            onClick={() => handleDismiss(true)}
            className="py-3 px-3 rounded-xl text-xs text-zinc-500 hover:text-zinc-300 hover:bg-white/5 transition-colors"
          >
            Não mostrar
          </button>
        </div>
      </div>
    </div>
  );
}
