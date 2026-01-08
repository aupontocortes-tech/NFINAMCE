'use client';

import { StudentForm } from '@/components/features/StudentForm';
import { useAppStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function NewStudentPage() {
  const { addStudent } = useAppStore();
  const router = useRouter();

  const handleSubmit = (data: any) => {
    const newStudent = {
      id: crypto.randomUUID(), // Nativo do browser/node recente
      ...data,
      status: 'pending' as const,
    };
    
    addStudent(newStudent);
    toast.success('Aluno cadastrado com sucesso!');
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
