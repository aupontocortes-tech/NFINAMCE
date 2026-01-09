export interface Student {
  id: string;
  name: string;
  phone: string;
  value: number;
  dueDate: number; // Dia do mês (1-31)
  customMessage?: string;
  status: 'paid' | 'pending';
  lastPaymentDate?: string;
}

export interface DashboardStats {
  totalStudents: number;
  totalRevenue: number;
  pendingCount: number;
}
