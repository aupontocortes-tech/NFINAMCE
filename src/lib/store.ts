import { create } from 'zustand';
import { Student } from './types';

interface AppState {
  students: Student[];
  setStudents: (students: Student[]) => void;
  addStudent: (student: Student) => void;
  updateStudent: (id: string, data: Partial<Student>) => void;
  deleteStudent: (id: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  students: [],
  setStudents: (students) => set({ students }),
  addStudent: (student) => set((state) => ({ 
    students: [...state.students, student] 
  })),
  updateStudent: (id, data) => set((state) => ({
    students: state.students.map((s) => s.id === id ? { ...s, ...data } : s)
  })),
  deleteStudent: (id) => set((state) => ({
    students: state.students.filter((s) => s.id !== id)
  })),
}));
