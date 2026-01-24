'use client';

import { StudentForm } from '@/components/features/StudentForm';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import { Student } from '@/lib/types';
import { getApiUrl } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

export default function EditStudentPage() {
  const { token } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [student, setStudent] = useState<Student | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    // Fetch all students and find the one (since we don't have getOne yet)
    // Or ideally, implement getOne in backend. For now, let's try to fetch list.
    fetch(`${getApiUrl()}/alunos`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      if (Array.isArray(data)) {
        // Backend returns "mensagem_cobranca" but frontend expects "customMessage"
        // We need to map it.
        const found = data.find((s: any) => s.id.toString() === id);
        if (found) {
            setStudent({
                id: found.id.toString(),
                name: found.nome,
                email: found.email || '',
                phone: found.telefone || '',
                value: found.valor,
                dueDate: found.vencimento || found.diaVencimento,
                status: found.status === 'ativo' ? 'pending' : (found.status === 'paid' ? 'paid' : 'pending'),
                customMessage: found.mensagem_cobranca || found.customMessage,
            });
        } else {
            toast.error('Aluno não encontrado');
            router.push('/dashboard/students');
        }
      }
    })
    .catch(err => toast.error('Erro ao carregar aluno'))
    .finally(() => setLoading(false));
  }, [id, token, router]);

  const handleSubmit = async (data: any) => {
    if (!token) return;

    try {
      const res = await fetch(`${getApiUrl()}/alunos/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          nome: data.name,
          email: data.email,
          telefone: data.phone,
          valor: data.value,
          vencimento: String(data.dueDate),
          customMessage: data.customMessage,
        }),
      });

      if (!res.ok) throw new Error('Falha ao atualizar');
      
      toast.success('Aluno atualizado com sucesso!');
      router.push('/dashboard/students');
    } catch (e) {
      toast.error('Erro ao atualizar aluno');
    }
  };

  if (loading) return <div className="p-8 text-center">Carregando...</div>;
  if (!student) return null;

  return (
    <div className="max-w-md mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-zinc-900">Editar Aluno</h1>
      <div className="bg-white p-6 rounded-lg shadow-sm border border-zinc-200">
        <StudentForm initialData={student} onSubmit={handleSubmit} isEditing />
      </div>
    </div>
  );
}
