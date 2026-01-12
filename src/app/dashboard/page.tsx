'use client';

import { useAppStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, DollarSign, AlertCircle, Plus, Play } from 'lucide-react';
import Link from 'next/link';
import { runDailyAutomation } from '@/lib/whatsapp';
import { toast } from 'sonner';

export default function DashboardPage() {
  const { students } = useAppStore();

  const totalStudents = students.length;
  const totalRevenue = students.reduce((acc, curr) => acc + curr.value, 0);
  const pendingStudents = students.filter(s => s.status === 'pending');
  const pendingCount = pendingStudents.length;
  const pendingValue = pendingStudents.reduce((acc, curr) => acc + curr.value, 0);

  const handleRunAutomation = async () => {
    const count = await runDailyAutomation(students);
    if (count > 0) {
      toast.success(`${count} mensagens de cobrança enviadas!`);
    } else {
      toast.info("Nenhuma cobrança pendente para hoje.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900">Visão Geral</h1>
        <Button onClick={handleRunAutomation} variant="outline" size="sm" className="gap-2">
          <Play className="w-4 h-4" />
          <span className="hidden sm:inline">Rodar Cobrança</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Alunos */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">Total de Alunos</CardTitle>
            <Users className="w-4 h-4 text-zinc-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
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
            <div className="text-2xl font-bold">R$ {totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-zinc-500">Se todos pagarem</p>
          </CardContent>
        </Card>

        {/* Pendentes */}
        <Card className={pendingCount > 0 ? "border-red-200 bg-red-50" : ""}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-red-600">Pendentes</CardTitle>
            <AlertCircle className="w-4 h-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-700">{pendingCount}</div>
            <p className="text-xs text-red-600">R$ {pendingValue.toFixed(2)} a receber</p>
          </CardContent>
        </Card>
      </div>

      <div className="pt-4">
        <Button asChild className="w-full h-14 text-lg shadow-md">
          <Link href="/dashboard/students/new">
            <Plus className="mr-2 h-5 w-5" /> Adicionar Novo Aluno
          </Link>
        </Button>
      </div>

      {/* Lista Rápida de Pendentes */}
      {pendingCount > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Cobranças Pendentes</h2>
          <div className="space-y-3">
            {pendingStudents.map(student => (
              <Card key={student.id} className="border-l-4 border-l-red-500">
                <CardContent className="p-4 flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{student.name}</p>
                    <p className="text-sm text-zinc-500">Vence dia {student.dueDate}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-red-600">R$ {student.value}</p>
                    <Button variant="ghost" size="sm" className="h-8 text-xs mt-1" asChild>
                      <Link href="/dashboard/students">Ver</Link>
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
