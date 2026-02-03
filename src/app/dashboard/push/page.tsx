'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell } from 'lucide-react';

export default function PushPage() {
  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Notificações</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Avisos e lembretes do NFinance. Você será informado aqui sobre novidades e alertas.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <CardTitle className="text-lg">Alertas e notificações</CardTitle>
            <Badge variant="secondary" className="text-xs mt-1">
              Em breve
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-zinc-600">
            Quando estiver disponível, você receberá notificações diretamente no navegador ou no aplicativo, por exemplo:
          </p>
          <ul className="list-disc list-inside text-sm text-zinc-600 space-y-1">
            <li>Lembretes de pagamento próximo ao vencimento.</li>
            <li>Avisos quando um aluno fizer cadastro ou alterar dados.</li>
            <li>Resumo diário ou semanal (opcional) de alunos e receita.</li>
          </ul>
          <p className="text-xs text-zinc-400 mt-2">
            As opções aparecerão nesta página. Você poderá ativar ou desativar cada tipo de notificação.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
