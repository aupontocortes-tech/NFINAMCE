'use client';

import { useAppStore } from '@/lib/store';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Edit, Trash2, Phone, Search, Send } from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { getApiUrl } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

export default function StudentsPage() {
  const { students, setStudents, updateStudent, deleteStudent } = useAppStore();
  const { token } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'paid'>('all');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (token) {
      fetch(`${getApiUrl()}/alunos`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const mappedStudents = data.map((s: any) => ({
            id: s.id.toString(),
            name: s.nome,
            email: s.email || '',
            phone: s.telefone || '',
            value: Number(s.valor),
            dueDate: s.vencimento,
            status: (s.status === 'ativo' ? 'pending' : (s.status === 'paid' ? 'paid' : 'pending')) as 'pending' | 'paid',
            customMessage: s.mensagem_cobranca,
          }));
          setStudents(mappedStudents);
        }
      })
      .catch(err => console.error('Erro ao buscar alunos:', err));
    }
  }, [token, setStudents]);

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || student.status === filter;
    return matchesSearch && matchesFilter;
  });

  const handleMarkAsPaid = (id: string, name: string) => {
    updateStudent(id, { status: 'paid' });
    toast.success(`${name} marcado como pago!`);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Tem certeza que deseja excluir ${name}?`)) {
      deleteStudent(id);
      toast.success(`${name} excluído.`);
    }
  };

  const handleSendLate = async () => {
    if (!confirm('Deseja enviar cobrança para TODOS os alunos pendentes e atrasados?')) return;
    
    setSending(true);
    try {
      const res = await fetch(`${getApiUrl()}/cobrancas/pendentes`, { method: 'POST' });
      const data = await res.json();
      
      
      if (res.ok) {
        toast.success(data.message);
      } else {
        toast.error(data.message || 'Erro ao enviar cobranças');
      }
    } catch (error) {
      toast.error('Erro de conexão com o servidor');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold text-zinc-900">Meus Alunos</h1>
        
        {/* Filtros */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
            <Input 
              placeholder="Buscar por nome..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button 
              variant={filter === 'all' ? 'default' : 'outline'} 
              onClick={() => setFilter('all')}
              className="flex-1 md:flex-none"
            >
              Todos
            </Button>
            <Button 
              variant={filter === 'pending' ? 'default' : 'outline'} 
              onClick={() => setFilter('pending')}
              className="flex-1 md:flex-none"
            >
              Pendentes
            </Button>
            <Button 
              variant={filter === 'paid' ? 'default' : 'outline'} 
              onClick={() => setFilter('paid')}
              className="flex-1 md:flex-none"
            >
              Pagos
            </Button>
            <Button 
              variant="default"
              className="bg-green-600 hover:bg-green-700 text-white flex-1 md:flex-none gap-2 ml-2"
              onClick={handleSendLate}
              disabled={sending}
              title="Enviar cobrança para todos os atrasados"
            >
              <Send className="w-4 h-4" />
              {sending ? 'Enviando...' : 'Enviar'}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredStudents.length === 0 ? (
          <div className="text-center py-10 text-zinc-500">
            Nenhum aluno encontrado.
          </div>
        ) : (
          filteredStudents.map((student) => (
            <Card key={student.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-lg">{student.name}</h3>
                    <div className="flex items-center text-zinc-500 text-sm gap-1">
                      <Phone className="w-3 h-3" />
                      {student.phone}
                    </div>
                  </div>
                  <Badge variant={student.status === 'paid' ? 'default' : 'destructive'}>
                    {student.status === 'paid' ? 'Pago' : 'Pendente'}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                  <div>
                    <p className="text-zinc-500">Mensalidade</p>
                    <p className="font-semibold">R$ {student.value.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-zinc-500">Vencimento</p>
                    <p className="font-semibold">Dia {student.dueDate}</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-zinc-50 p-3 flex gap-2 justify-end">
                {student.status === 'pending' && (
                  <Button 
                    size="sm" 
                    className="bg-green-600 hover:bg-green-700 text-white flex-1"
                    onClick={() => handleMarkAsPaid(student.id, student.name)}
                  >
                    <Check className="w-4 h-4 mr-1" /> Pago
                  </Button>
                )}
                <Button size="sm" variant="outline" asChild className="flex-1">
                  <Link href={`/dashboard/students/${student.id}`}>
                    <Edit className="w-4 h-4 mr-1" /> Editar
                  </Link>
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={() => handleDelete(student.id, student.name)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
