'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { signIn } from 'next-auth/react';
import { Loader2, Dumbbell, Eye, EyeOff, Mail, MessageCircle } from 'lucide-react';
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

type SocialProviders = { google: boolean; facebook: boolean; twitter: boolean };

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [socialProviders, setSocialProviders] = useState<SocialProviders | null>(null);
  const { login } = useAuth();

  useEffect(() => {
    fetch('/api/auth/providers')
      .then((res) => res.json())
      .then((data: SocialProviders) => setSocialProviders(data))
      .catch(() => setSocialProviders({ google: false, facebook: false, twitter: false }));
  }, []);
  
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const handleSocialLogin = (provider: 'google' | 'facebook' | 'twitter') => {
    const configured = socialProviders && (
      (provider === 'google' && socialProviders.google) ||
      (provider === 'facebook' && socialProviders.facebook) ||
      (provider === 'twitter' && socialProviders.twitter)
    );
    if (!configured) {
      const names = { google: 'Gmail', facebook: 'Facebook', twitter: 'Twitter' };
      const envVars = { google: 'AUTH_GOOGLE_ID e AUTH_GOOGLE_SECRET', facebook: 'AUTH_FACEBOOK_ID e AUTH_FACEBOOK_SECRET', twitter: 'AUTH_TWITTER_ID e AUTH_TWITTER_SECRET' };
      const isRender = typeof window !== 'undefined' && window.location.hostname.includes('onrender.com');
      const where = isRender ? 'no painel do Render (Environment do serviço front-end)' : 'no .env.local';
      toast.error(`Para ativar login com ${names[provider]}, adicione ${envVars[provider]} ${where}.`);
      return;
    }
    signIn(provider, { callbackUrl: '/auth/callback' }).then((res) => {
      if (res?.error) {
        toast.error('Erro ao conectar. Tente novamente ou use e-mail e senha.');
      }
    });
  };

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email, password: data.password }),
      });
      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.error || `Erro ${response.status}: ${response.statusText}`);
      }
      const result = await response.json();
      if (!result.token || !result.user) throw new Error('Resposta inválida do servidor');
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
        <div className="hidden md:flex flex-col gap-6 text-zinc-100 items-center text-center">
          <div className="flex flex-col items-center gap-3">
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
          <div className="flex flex-col gap-4 w-full max-w-xs mx-auto text-xs">
            <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-left">
              <p className="font-semibold text-zinc-100 mb-1">Visão financeira clara</p>
              <p className="text-zinc-300">Saiba quem já pagou, quem está pendente e quanto ainda vai entrar.</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-left">
              <p className="font-semibold text-zinc-100 mb-1">Agenda organizada</p>
              <p className="text-zinc-300">Visualize aulas da semana e evite conflitos de horário.</p>
            </div>
          </div>
        </div>

        <Card className="w-full max-w-md mx-auto rounded-2xl shadow-xl shadow-black/20 border border-zinc-700/50 bg-zinc-900/80 backdrop-blur-sm ring-1 ring-white/5 overflow-hidden">
          <CardHeader className="space-y-2 pb-2 pt-8 px-8">
            <CardTitle className="text-2xl font-semibold text-zinc-50 tracking-tight">Entrar no NFinance</CardTitle>
            <CardDescription className="text-zinc-400 text-sm leading-relaxed">
              Acesse seu painel para acompanhar alunos, agenda e financeiro.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-4 px-8 pt-2">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-zinc-200">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  autoComplete="email"
                  {...register('email')}
                  className="bg-zinc-800/50 border-zinc-600/80 rounded-lg text-zinc-50 placeholder:text-zinc-500 focus-visible:ring-primary/30"
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
                    className="bg-zinc-800/50 border-zinc-600/80 rounded-lg text-zinc-50 placeholder:text-zinc-500 pr-10 focus-visible:ring-primary/30"
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
            <CardFooter className="flex flex-col gap-4 px-8 pb-8 pt-2">
              <div className="grid grid-cols-3 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 rounded-lg border-zinc-600/80 bg-zinc-800/50 hover:bg-zinc-700/50 hover:border-zinc-500 text-zinc-200 transition-colors"
                  disabled={isLoading}
                  onClick={() => handleSocialLogin('google')}
                >
                  <Mail className="h-5 w-5 mr-1" />
                  Gmail
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 rounded-lg border-zinc-600/80 bg-zinc-800/50 hover:bg-zinc-700/50 hover:border-zinc-500 text-zinc-200 transition-colors"
                  disabled={isLoading}
                  onClick={() => handleSocialLogin('facebook')}
                >
                  <MessageCircle className="h-5 w-5 mr-1" />
                  Facebook
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 rounded-lg border-zinc-600/80 bg-zinc-800/50 hover:bg-zinc-700/50 hover:border-zinc-500 text-zinc-200 transition-colors"
                  disabled={isLoading}
                  onClick={() => handleSocialLogin('twitter')}
                >
                  <MessageCircle className="h-5 w-5 mr-1" />
                  Twitter
                </Button>
              </div>
              <p className="text-xs text-zinc-500 text-center">
                Entrar com Gmail, Facebook ou Twitter e acessar direto o aplicativo.
              </p>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-zinc-600/60" />
                </div>
                <div className="relative flex justify-center text-xs uppercase tracking-wide text-zinc-500">
                  ou entre com e-mail
                </div>
              </div>
              <Button className="w-full h-11 rounded-lg font-medium transition-all hover:opacity-95" type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Entrar
              </Button>
              <div className="text-center text-sm text-zinc-400">
                Não tem uma conta?{' '}
                <Link href="/register" className="text-primary hover:underline font-medium">
                  Cadastre-se gratuitamente
                </Link>
              </div>
              <p className="text-center text-xs text-zinc-500 pt-1">
                Testar sem cadastro: <span className="text-zinc-400 font-mono">demo@nfinance.com</span> / <span className="text-zinc-400 font-mono">demo123</span>
              </p>
              <div className="text-center pt-2">
                <Link href="/app" className="text-xs text-zinc-500 hover:text-zinc-400 inline-flex items-center gap-1">
                  Abrir no celular
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
