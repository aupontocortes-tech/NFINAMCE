'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { getApiUrl } from '@/lib/utils';
import { Loader2, AlertCircle } from 'lucide-react';

/**
 * Página /teste — abre o app direto (login demo automático).
 * Acesse: http://localhost:3000/teste
 */
export default function TestePage() {
  const { login } = useAuth();
  const [status, setStatus] = useState<'loading' | 'ok' | 'erro'>('loading');
  const [mensagem, setMensagem] = useState('');

  useEffect(() => {
    let cancelled = false;
    const timeoutMs = 6000;

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/04f05b88-2244-43f2-bc12-4e88d10b62fd',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'teste/page.tsx:effect',message:'entrar effect started',data:{hasLogin:!!login},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'D'})}).catch(()=>{});
    // #endregion

    async function entrar() {
      try {
        const apiUrl = getApiUrl();
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/04f05b88-2244-43f2-bc12-4e88d10b62fd',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'teste/page.tsx:beforeFetch',message:'apiUrl and before fetch',data:{apiUrl},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A,B'})}).catch(()=>{});
        // #endregion

        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeoutMs);

        const res = await fetch(`${apiUrl}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'demo@nfinance.com', password: 'demo123' }),
          signal: controller.signal,
        });

        clearTimeout(id);
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/04f05b88-2244-43f2-bc12-4e88d10b62fd',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'teste/page.tsx:afterFetch',message:'fetch completed',data:{ok:res.ok,status:res.status},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A,C'})}).catch(()=>{});
        // #endregion

        if (cancelled) return;

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setMensagem(data.error || 'Backend respondeu com erro.');
          setStatus('erro');
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/04f05b88-2244-43f2-bc12-4e88d10b62fd',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'teste/page.tsx:resNotOk',message:'setStatus erro res.notOk',data:{status:res.status},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'C'})}).catch(()=>{});
          // #endregion
          return;
        }

        const data = await res.json();
        if (!data.token || !data.user) {
          setMensagem('Resposta inválida do servidor.');
          setStatus('erro');
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/04f05b88-2244-43f2-bc12-4e88d10b62fd',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'teste/page.tsx:invalidPayload',message:'no token or user',data:{hasToken:!!data.token,hasUser:!!data.user},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'C'})}).catch(()=>{});
          // #endregion
          return;
        }

        login(data.token, data.user);
        setStatus('ok');
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/04f05b88-2244-43f2-bc12-4e88d10b62fd',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'teste/page.tsx:loginCalled',message:'login called setStatus ok',data:{},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'D'})}).catch(()=>{});
        // #endregion
      } catch (err) {
        if (cancelled) return;
        const isTimeout = err instanceof Error && err.name === 'AbortError';
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/04f05b88-2244-43f2-bc12-4e88d10b62fd',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'teste/page.tsx:catch',message:'fetch catch',data:{name:err instanceof Error?err.name:'',isTimeout},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A,E'})}).catch(()=>{});
        // #endregion
        setMensagem(
          isTimeout
            ? 'Backend não respondeu a tempo. Rode iniciar-tudo.bat (deixe as duas janelas abertas) e tente de novo.'
            : 'Backend não está rodando. Rode iniciar-tudo.bat e tente de novo.'
        );
        setStatus('erro');
      }
    }

    entrar();
    return () => { cancelled = true; };
  }, [login]);

  if (status === 'ok') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-100 p-4">
        <div className="text-center">
          <p className="text-zinc-600">Redirecionando para o painel...</p>
          <Loader2 className="mx-auto mt-4 h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (status === 'erro') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-100 p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-zinc-200 p-6 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-amber-500 mb-4" />
          <h1 className="text-xl font-semibold text-zinc-800 mb-2">Não foi possível abrir</h1>
          <p className="text-zinc-600 text-sm mb-6">{mensagem}</p>
          <div className="flex flex-col gap-2">
            <Link
              href="/teste"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary text-white px-4 py-2 font-medium hover:opacity-90"
            >
              Tentar de novo
            </Link>
            <Link href="/login" className="text-sm text-zinc-500 hover:text-zinc-700">
              Ir para a tela de login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-100 p-4">
      <div className="text-center max-w-sm">
        <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-zinc-600 font-medium">Abrindo o app...</p>
        <p className="text-zinc-400 text-sm mt-2">
          Se ficar parado aqui, rode <strong>iniciar-tudo.bat</strong> e deixe as duas janelas abertas.
        </p>
      </div>
    </div>
  );
}
