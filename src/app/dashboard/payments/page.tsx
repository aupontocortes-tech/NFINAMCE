'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Check, DollarSign, Loader2, Calendar, AlertCircle } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getApiUrl } from '@/lib/utils';
import { toast } from 'sonner';

type Payment = {
  id: number;
  valor: number;
  data_vencimento: string;
  status: string;
  mes: number;
  ano: number;
  data_pagamento: string | null;
  metodo_pagamento: string | null;
  aluno_nome: string;
  aluno_email: string | null;
};

export default function PaymentsPage() {
  const { token } = useAuth();
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);

  const loadPayments = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${getApiUrl()}/pagamentos?month=${month}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!res.ok) throw new Error('Falha ao carregar pagamentos');
      
      const data = await res.json();
      setPayments(data);
    } catch (error) {
      console.error(error);
      toast.error('Erro ao carregar pagamentos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, month]);

  const stats = useMemo(() => {
    const totalExpected = payments.reduce((acc, p) => acc + (p.valor || 0), 0);
    const totalReceived = payments
      .filter(p => p.status === 'pago')
      .reduce((acc, p) => acc + (p.valor || 0), 0);
    const totalPending = totalExpected - totalReceived;

    return { totalExpected, totalReceived, totalPending };
  }, [payments]);

  const handleMarkAsPaid = async (id: number) => {
    if (!token) return;
    setProcessingId(id);
    try {
      const res = await fetch(`${getApiUrl()}/pagamentos/${id}/pago`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ metodo: 'manual' })
      });

      if (!res.ok) throw new Error('Falha ao atualizar pagamento');

      toast.success('Pagamento marcado como pago!');
      await loadPayments();
    } catch (error) {
      console.error(error);
      toast.error('Erro ao marcar como pago');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900">Financeiro</h1>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-zinc-500" />
          <Input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="w-40"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">Total Previsto</CardTitle>
            <DollarSign className="w-4 h-4 text-zinc-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {stats.totalExpected.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">Total Recebido</CardTitle>
            <Check className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">R$ {stats.totalReceived.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">Pendente</CardTitle>
            <AlertCircle className="w-4 h-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">R$ {stats.totalPending.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pagamentos de {new Date(month + '-01').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : payments.length === 0 ? (
            <div className="text-center py-10 text-zinc-500 space-y-2">
              <p>Nenhum pagamento encontrado para este mês.</p>
              <p className="text-xs text-zinc-400">
                Dica: cadastre alunos na aba <span className="font-semibold">Meus Alunos</span> para gerar mensalidades automaticamente.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {payments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-zinc-50 transition-colors">
                  <div>
                    <p className="font-semibold">{payment.aluno_nome}</p>
                    <p className="text-sm text-zinc-500">
                      Vencimento: {new Date(payment.data_vencimento).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="font-semibold">R$ {payment.valor.toFixed(2)}</p>
                      <Badge variant={payment.status === 'pago' ? 'default' : 'secondary'} className={payment.status === 'pago' ? 'bg-green-600 hover:bg-green-700' : 'bg-orange-100 text-orange-700 hover:bg-orange-200'}>
                        {payment.status === 'pago' ? 'Pago' : 'Pendente'}
                      </Badge>
                    </div>
                    {payment.status !== 'pago' && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-green-600 border-green-200 hover:bg-green-50"
                        onClick={() => handleMarkAsPaid(payment.id)}
                        disabled={processingId === payment.id}
                      >
                        {processingId === payment.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Check className="w-4 h-4 mr-2" />
                        )}
                        Marcar Pago
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
