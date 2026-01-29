'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getApiUrl } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AuthCallbackPage() {
  const { data: session, status } = useSession();
  const { login, isAuthenticated } = useAuth();
  const router = useRouter();
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    if (status === 'loading' || syncing) return;
    if (status === 'unauthenticated') {
      router.replace('/login');
      return;
    }
    if (!session?.user?.email) {
      router.replace('/login');
      return;
    }
    if (isAuthenticated) {
      router.replace('/dashboard');
      return;
    }

    const syncWithBackend = async () => {
      setSyncing(true);
      try {
        const apiUrl = getApiUrl();
        const res = await fetch(`${apiUrl}/auth/social`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: session.user.email,
            name: session.user.name ?? session.user.email.split('@')[0],
          }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || 'Erro ao conectar com o aplicativo.');
        }
        const { token, user } = await res.json();
        if (!token || !user) throw new Error('Resposta inválida.');
        login(token, { id: user.id, name: user.name, email: user.email });
        toast.success('Entrada feita com sucesso!');
        router.replace('/dashboard');
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Erro ao entrar.');
        router.replace('/login');
      } finally {
        setSyncing(false);
      }
    };

    syncWithBackend();
  }, [session, status, login, isAuthenticated, router, syncing]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-950 to-slate-900 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-zinc-200">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p>Conectando ao NFinance...</p>
      </div>
    </div>
  );
}
