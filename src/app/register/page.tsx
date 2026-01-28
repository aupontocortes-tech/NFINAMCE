'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Dumbbell } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { getApiUrl } from '@/lib/utils';

const registerSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${getApiUrl()}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao criar conta');
      }

      login(result.token, result.user);
      toast.success('Conta criada com sucesso!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-950 to-slate-900 flex items-center justify-center px-4">
      <div className="max-w-5xl w-full grid md:grid-cols-[1.2fr,1fr] gap-10 items-center">
        <div className="hidden md:flex flex-col gap-6 text-zinc-100">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-xl">
              <Dumbbell className="w-7 h-7 text-primary" />
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-zinc-400">Painel do Personal</p>
              <h1 className="text-3xl font-bold tracking-tight">NFinance</h1>
            </div>
          </div>
          <p className="text-zinc-300 text-sm leading-relaxed max-w-md">
            Crie sua conta em poucos segundos e comece a centralizar seus alunos, cobranças e agenda
            em um painel pensado para o dia a dia do personal trainer.
          </p>
          <ul className="list-disc list-inside text-xs text-zinc-300 space-y-1">
            <li>Cadastre quantos alunos quiser.</li>
            <li>Defina valores, vencimentos e acompanhe pagamentos.</li>
            <li>No futuro, conecte e-mail e WhatsApp para automatizar lembretes.</li>
          </ul>
        </div>

        <Card className="w-full max-w-md mx-auto shadow-2xl border-zinc-800 bg-zinc-950/90 backdrop-blur">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl font-bold text-zinc-50">Crie sua conta</CardTitle>
            <CardDescription className="text-zinc-400">
              Comece a gerenciar sua base de alunos em poucos minutos.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-zinc-200">Nome completo</Label>
                <Input
                  id="name"
                  placeholder="João Silva"
                  autoComplete="name"
                  {...register('name')}
                  className="bg-zinc-900 border-zinc-700 text-zinc-50 placeholder:text-zinc-500"
                />
                {errors.name && (
                  <p className="text-sm text-red-400">{errors.name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-zinc-200">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  autoComplete="email"
                  {...register('email')}
                  className="bg-zinc-900 border-zinc-700 text-zinc-50 placeholder:text-zinc-500"
                />
                {errors.email && (
                  <p className="text-sm text-red-400">{errors.email.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-zinc-200">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  {...register('password')}
                  className="bg-zinc-900 border-zinc-700 text-zinc-50 placeholder:text-zinc-500"
                />
                {errors.password && (
                  <p className="text-sm text-red-400">{errors.password.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-zinc-200">Confirmar Senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  {...register('confirmPassword')}
                  className="bg-zinc-900 border-zinc-700 text-zinc-50 placeholder:text-zinc-500"
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-red-400">{errors.confirmPassword.message}</p>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button className="w-full h-11" type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Criar conta
              </Button>
              <div className="text-center text-sm text-zinc-400">
                Já tem uma conta?{' '}
                <Link href="/login" className="text-primary hover:underline font-medium">
                  Faça login
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
