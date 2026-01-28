'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Dumbbell, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { getApiUrl } from '@/lib/utils';

const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      const apiUrl = getApiUrl();
      console.log('🔗 Tentando conectar em:', apiUrl);
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      });

      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.error || `Erro ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.token || !result.user) {
        throw new Error('Resposta inválida do servidor');
      }

      login(result.token, result.user);
      toast.success('Login realizado com sucesso!');
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        const apiUrl = getApiUrl();
        toast.error(`Não foi possível conectar ao servidor em ${apiUrl}. Verifique se o backend está online.`);
        console.error('❌ Erro de conexão:', error);
        console.error('📍 URL tentada:', apiUrl);
      } else {
        toast.error(error instanceof Error ? error.message : 'Erro desconhecido ao fazer login');
        console.error('Erro no login:', error);
      }
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
            Organize seus alunos, automatize cobranças e acompanhe recebimentos em um só lugar.
            Pensado para personal trainers que querem profissionalizar o dia a dia.
          </p>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="rounded-lg border border-white/10 bg-white/5 p-3">
              <p className="font-semibold text-zinc-100 mb-1">Visão financeira clara</p>
              <p className="text-zinc-300">Saiba quem já pagou, quem está pendente e quanto ainda vai entrar.</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-3">
              <p className="font-semibold text-zinc-100 mb-1">Agenda organizada</p>
              <p className="text-zinc-300">Visualize aulas da semana e evite conflitos de horário.</p>
            </div>
          </div>
        </div>

        <Card className="w-full max-w-md mx-auto shadow-2xl border-zinc-800 bg-zinc-950/90 backdrop-blur">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl font-bold text-zinc-50">Entrar no NFinance</CardTitle>
            <CardDescription className="text-zinc-400">
              Acesse seu painel para acompanhar alunos, agenda e financeiro.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
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
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-zinc-200">Senha</Label>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    {...register('password')}
                    className="bg-zinc-900 border-zinc-700 text-zinc-50 placeholder:text-zinc-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-400">{errors.password.message}</p>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button className="w-full h-11" type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Entrar
              </Button>
              <div className="text-center text-sm text-zinc-400">
                Não tem uma conta?{' '}
                <Link href="/register" className="text-primary hover:underline font-medium">
                  Cadastre-se gratuitamente
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
