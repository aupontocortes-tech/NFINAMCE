'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';

export default function ProfilePage() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Perfil do Professor</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Estas são as informações básicas da sua conta no NFinance.
        </p>
      </div>

      <Card>
        <CardHeader className="flex items-center gap-4">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary font-bold text-xl">
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <CardTitle className="text-lg">{user.name}</CardTitle>
            <p className="text-sm text-zinc-500">{user.email}</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-500">Plano</span>
            <Badge variant="secondary" className="text-xs">
              Versão em desenvolvimento
            </Badge>
          </div>
          <p className="text-sm text-zinc-600">
            No futuro, esta área poderá centralizar configurações como:
          </p>
          <ul className="list-disc list-inside text-sm text-zinc-600 space-y-1">
            <li>Dados pessoais e senha de acesso.</li>
            <li>Configurações de e-mail (Resend/SMTP).</li>
            <li>Integrações com WhatsApp / outros canais.</li>
          </ul>
          <p className="text-xs text-zinc-400 mt-2">
            Por enquanto, use esta tela apenas como visão geral dos seus dados.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

