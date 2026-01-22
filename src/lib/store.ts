import { create } from 'zustand';
import { Student } from './types';

interface AppState {
  students: Student[];
  addStudent: (student: Student) => void;
  updateStudent: (id: string, data: Partial<Student>) => void;
  deleteStudent: (id: string) => void;
  markAsPaid: (id: string) => void;
  getPendingStudents: () => Student[];
}

const MOCK_STUDENTS: Student[] = [
  {
    id: '1',
    name: 'João Silva',
    phone: '11999999999',
    value: 150,
    dueDate: 5,
    status: 'pending',
    customMessage: 'Olá João, sua mensalidade vence hoje!'
  },
  {
    id: '2',
    name: 'Maria Oliveira',
    phone: '11988888888',
    value: 200,
    dueDate: 10,
    status: 'paid',
    lastPaymentDate: '2023-10-10'
  },
  {
    id: '3',
    name: 'Carlos Souza',
    phone: '21977777777',
    value: 120,
    dueDate: 13,
    status: 'pending'
  }
];

export const useAppStore = create<AppState>((set, get) => ({
  students: MOCK_STUDENTS,
  
  addStudent: (student) => set((state) => ({ 
    students: [...state.students, student] 
  })),

  updateStudent: (id, data) => set((state) => ({
    students: state.students.map((s) => s.id === id ? { ...s, ...data } : s)
  })),

  deleteStudent: (id) => set((state) => ({
    students: state.students.filter((s) => s.id !== id)
  })),

  markAsPaid: (id) => set((state) => ({
    students: state.students.map((s) => 
      s.id === id ? { ...s, status: 'paid', lastPaymentDate: new Date().toISOString() } : s
    )
  })),

  getPendingStudents: () => {
    return get().students.filter(s => s.status === 'pending');
  }
}));
