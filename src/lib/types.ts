export interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  value: number;
  dueDate: number; // Dia do mês (1-31)
  status: 'paid' | 'pending';
  lastPaymentDate?: string;
  user_id?: number; // Para multi-tenant
  customMessage?: string; // Mensagem de cobrança personalizada
}

export interface DashboardStats {
  totalStudents: number;
  totalRevenue: number;
  pendingCount: number;
}
