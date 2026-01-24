'use client';

import { StudentForm } from '@/components/features/StudentForm';
import { useAppStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { getApiUrl } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

export default function NewStudentPage() {
  const { addStudent } = useAppStore();
  const { token } = useAuth();
  const router = useRouter();

  const handleSubmit = async (data: any) => {
    if (!token) {
      toast.error('Você precisa estar logado para adicionar alunos.');
      return;
    }

    const newStudent = {
      id: crypto.randomUUID(),
      ...data,
      status: 'pending' as const,
    };

    // Atualiza estado local para manter a UI responsiva
    addStudent(newStudent);

    // Persiste no backend (para aparecer em Pagamentos)
    try {
      const res = await fetch(`${getApiUrl()}/alunos`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          nome: data.name,
          email: data.email, // Ensure email is passed too
          telefone: data.phone,
          valor: data.value,
          plano: 'mensal',
          status: 'ativo',
          vencimento: String(data.dueDate), // dia do mês
          customMessage: data.customMessage,
        }),
      });
      const resp = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(resp.error || 'Falha ao salvar aluno no servidor');
      toast.success('Aluno cadastrado com sucesso!');
    } catch (e: any) {
      toast.error(e.message || 'Erro ao salvar aluno no servidor');
    }

    router.push('/dashboard/students');
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-zinc-900">Novo Aluno</h1>
      <div className="bg-white p-6 rounded-lg shadow-sm border border-zinc-200">
        <StudentForm onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
