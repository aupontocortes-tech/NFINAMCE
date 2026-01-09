'use client';

import { StudentForm } from '@/components/features/StudentForm';
import { useAppStore } from '@/lib/store';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import { Student } from '@/lib/types';

export default function EditStudentPage() {
  const { students, updateStudent } = useAppStore();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [student, setStudent] = useState<Student | undefined>(undefined);

  useEffect(() => {
    const found = students.find(s => s.id === id);
    if (!found) {
      toast.error('Aluno não encontrado');
      router.push('/dashboard/students');
    } else {
      setStudent(found);
    }
  }, [id, students, router]);

  const handleSubmit = (data: any) => {
    updateStudent(id, data);
    toast.success('Aluno atualizado com sucesso!');
    router.push('/dashboard/students');
  };

  if (!student) return <div>Carregando...</div>;

  return (
    <div className="max-w-md mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-zinc-900">Editar Aluno</h1>
      <div className="bg-white p-6 rounded-lg shadow-sm border border-zinc-200">
        <StudentForm initialData={student} onSubmit={handleSubmit} isEditing />
      </div>
    </div>
  );
}
