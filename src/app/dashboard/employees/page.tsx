'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { getApiUrl } from '@/lib/utils';
import { Users, Check, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Employee {
  id?: number;
  nome: string;
  telefone?: string;
  valor: number;
  tipo_cobranca: 'hora' | 'diaria' | 'mensal';
  status?: 'ativo' | 'inativo';
}

export default function EmployeesPage() {
  const [items, setItems] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<Employee>({ nome: '', telefone: '', valor: 0, tipo_cobranca: 'mensal', status: 'ativo' });
  const [month, setMonth] = useState<string>(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
  });

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${getApiUrl()}/funcionarios`);
      const data = await res.json();
      setItems(data);
    } catch {
      toast.error('Erro ao carregar funcionários');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const create = async () => {
    try {
      const res = await fetch(`${getApiUrl()}/funcionarios`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Falha ao criar');
      toast.success('Funcionário criado');
      setForm({ nome: '', telefone: '', valor: 0, tipo_cobranca: 'mensal', status: 'ativo' });
      load();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const remove = async (id?: number) => {
    if (!id) return;
    if (!confirm('Excluir funcionário?')) return;
    const res = await fetch(`${getApiUrl()}/funcionarios/${id}`, { method: 'DELETE' });
    if (res.ok) {
      toast.success('Excluído');
      load();
    } else {
      toast.error('Falha ao excluir');
    }
  };

  const fecharMes = async () => {
    try {
      const res = await fetch(`${getApiUrl()}/fechamento/${month}`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao gerar cobranças');
      toast.success(data.message);
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900 flex items-center gap-2"><Users className="w-5 h-5" /> Funcionários</h1>
        <div className="flex gap-2 items-center">
          <Input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="w-40" />
          <Button variant="outline" onClick={fecharMes}>Fechar mês</Button>
        </div>
      </div>

      {/* Formulário simples */}
      <Card>
        <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-5 gap-3">
          <Input placeholder="Nome" value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} />
          <Input placeholder="Telefone (com DDI)" value={form.telefone} onChange={e => setForm({ ...form, telefone: e.target.value })} />
          <Input type="number" placeholder="Valor" value={form.valor} onChange={e => setForm({ ...form, valor: Number(e.target.value) })} />
          <select className="border rounded-md px-3 py-2" value={form.tipo_cobranca} onChange={e => setForm({ ...form, tipo_cobranca: e.target.value as Employee['tipo_cobranca'] })}>
            <option value="mensal">Mensal</option>
            <option value="hora">Hora</option>
            <option value="diaria">Diária</option>
          </select>
          <Button onClick={create} className="w-full">Adicionar</Button>
        </CardContent>
      </Card>

      {/* Lista */}
      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="text-center py-10 text-zinc-500">Carregando...</div>
        ) : items.length === 0 ? (
          <div className="text-center py-10 text-zinc-500">Nenhum funcionário cadastrado.</div>
        ) : (
          items.map((e) => (
            <Card key={e.id}>
              <CardContent className="p-4 flex justify-between items-start">
                <div>
                  <p className="font-semibold text-lg">{e.nome}</p>
                  <p className="text-sm text-zinc-500">{e.telefone || 'Sem telefone'}</p>
                  <div className="flex gap-4 mt-2 text-sm">
                    <span>Valor: <strong>R$ {Number(e.valor).toFixed(2)}</strong></span>
                    <span>Tipo: <Badge variant="outline">{e.tipo_cobranca}</Badge></span>
                    <span>Status: <Badge variant={e.status === 'ativo' ? 'default' : 'destructive'}>{e.status}</Badge></span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => remove(e.id)}><Trash2 className="w-4 h-4" /></Button>
                </div>
              </CardContent>
              <CardFooter className="bg-zinc-50 p-3 text-sm text-zinc-600">
                Para cobrança por hora/diária, registre os horários em "Horários". No fechamento mensal, o sistema calculará automaticamente.
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}