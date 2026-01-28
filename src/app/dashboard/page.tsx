'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, DollarSign, AlertCircle, Plus, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getApiUrl } from '@/lib/utils';
import { toast } from 'sonner';

interface DashboardSummary {
  totalStudents: number;
  expectedRevenue: number;
  pendingCount: number;
  pendingValue: number;
  upcomingPayments: Array<{
    name: string;
    value: number;
    dueDate: string;
  }>;
}

export default function DashboardPage() {
  const { token, logout } = useAuth();
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;
      
      try {
        const res = await fetch(`${getApiUrl()}/dashboard/summary`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (res.status === 401) {
          toast.error('Sessão expirada. Faça login novamente.');
          logout();
          return;
        }

        if (!res.ok) throw new Error('Falha ao carregar dados');
        
        const summary = await res.json();
        setData(summary);
        setErrorMessage(null);
      } catch (error) {
        console.error(error);

        // Mensagens mais amigáveis quando a API não responde
        if (error instanceof TypeError) {
          const friendly =
            'Não foi possível conectar com o servidor.\n\n' +
            'Verifique se o backend está rodando em http://localhost:3001 (modo local)\n' +
            'ou se a variável NEXT_PUBLIC_API_URL foi configurada na Vercel/Render.';
          setErrorMessage(friendly);
          toast.error('Falha de conexão com a API. Veja as instruções na tela.');
        } else if (error instanceof Error) {
          setErrorMessage(error.message);
          toast.error(error.message);
        } else {
          setErrorMessage('Erro desconhecido ao carregar o dashboard.');
          toast.error('Erro ao carregar dados do dashboard');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, logout]);

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Se não houver dados, mostra zeros ou estado vazio
  const displayData = data || {
    totalStudents: 0,
    expectedRevenue: 0,
    pendingCount: 0,
    pendingValue: 0,
    upcomingPayments: []
  };

  const showOnboarding =
    !errorMessage &&
    displayData.totalStudents === 0 &&
    displayData.expectedRevenue === 0 &&
    displayData.pendingCount === 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900">Visão Geral</h1>
      </div>

      {/* Alerta amigável quando a API não está acessível */}
      {errorMessage && (
        <Card className="border-amber-300 bg-amber-50">
          <CardHeader>
            <CardTitle className="text-amber-800">
              Não conseguimos falar com o servidor 😅
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-amber-900 whitespace-pre-line">
            <p>{errorMessage}</p>
            <ul className="list-disc list-inside mt-2">
              <li>
                <span className="font-semibold">Modo local:</span> abra um terminal, entre em <code>server</code> e rode <code>npm start</code>.
              </li>
              <li>
                <span className="font-semibold">Produção:</span> confirme se o backend na Render está online e se a variável <code>NEXT_PUBLIC_API_URL</code> na Vercel aponta para essa URL.
              </li>
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Onboarding quando ainda não existem dados */}
      {showOnboarding && (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-primary">
              Bem-vindo(a) ao NFinance! 👋
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-zinc-700">
            <p>Veja o passo a passo para começar a usar o sistema:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Cadastre seus primeiros alunos na aba <span className="font-semibold">Meus Alunos</span>.</li>
              <li>Defina o valor da mensalidade e o dia de vencimento de cada aluno.</li>
              <li>Acompanhe os vencimentos e pendências na aba <span className="font-semibold">Pagamentos</span>.</li>
              <li>Se quiser automatizar lembretes por e-mail/WhatsApp no futuro, basta configurar as integrações no backend.</li>
            </ol>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Alunos */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">Total de Alunos</CardTitle>
            <Users className="w-4 h-4 text-zinc-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{displayData.totalStudents}</div>
            <p className="text-xs text-zinc-500">Ativos na plataforma</p>
          </CardContent>
        </Card>

        {/* Receita Mensal */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">Receita Prevista</CardTitle>
            <DollarSign className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {displayData.expectedRevenue.toFixed(2)}</div>
            <p className="text-xs text-zinc-500">Se todos pagarem</p>
          </CardContent>
        </Card>

        {/* Pendentes */}
        <Card className={displayData.pendingCount > 0 ? "border-red-200 bg-red-50" : ""}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-red-600">Pendentes (Mês Atual)</CardTitle>
            <AlertCircle className="w-4 h-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-700">{displayData.pendingCount}</div>
            <p className="text-xs text-red-600">R$ {displayData.pendingValue.toFixed(2)} a receber</p>
          </CardContent>
        </Card>
      </div>

      <div className="pt-4">
         <Button asChild className="w-full h-14 text-lg shadow-md">
          <Link href="/dashboard/students/new" prefetch={false}>
            <Plus className="mr-2 h-5 w-5" /> Adicionar Novo Aluno
          </Link>
        </Button>
      </div>

      {/* Lista Rápida de Vencimentos Próximos */}
      {displayData.upcomingPayments.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Vencimentos Próximos (5 dias)</h2>
          <div className="space-y-3">
            {displayData.upcomingPayments.map((payment, idx) => (
              <Card key={idx} className="border-l-4 border-l-yellow-500">
                <CardContent className="p-4 flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{payment.name}</p>
                    <p className="text-sm text-zinc-500">
                      Vence em: {new Date(payment.dueDate).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-zinc-700">R$ {payment.value.toFixed(2)}</p>
                    <Button variant="ghost" size="sm" className="h-8 text-xs mt-1" asChild>
                      <Link href="/dashboard/payments">Ver</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
