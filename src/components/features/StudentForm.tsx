'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Student } from '@/lib/types';
import { useRouter } from 'next/navigation';

const formSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('E-mail inválido'),
  phone: z.string().min(10, 'Telefone inválido (inclua DDD)'),
  value: z.coerce.number().min(1, 'Valor deve ser maior que 0'),
  dueDate: z.coerce.number().min(1).max(31, 'Dia deve ser entre 1 e 31'),
  customMessage: z.string().optional(),
});

interface StudentFormProps {
  initialData?: Student;
  onSubmit: (data: z.infer<typeof formSchema>) => void;
  isEditing?: boolean;
}

export function StudentForm({ initialData, onSubmit, isEditing = false }: StudentFormProps) {
  const router = useRouter();
  
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || '',
      email: initialData?.email || '',
      phone: initialData?.phone || '',
      value: initialData?.value || 0,
      dueDate: initialData?.dueDate || 10,
      customMessage: initialData?.customMessage || '',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do Aluno</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Maria Silva" {...field} className="h-12" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-mail</FormLabel>
              <FormControl>
                <Input placeholder="aluno@email.com" {...field} className="h-12" type="email" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Telefone</FormLabel>
              <FormControl>
                <Input placeholder="11999999999" {...field} className="h-12" type="tel" />
              </FormControl>
              <FormDescription>Apenas números, com DDD.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="value"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mensalidade (R$)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="150.00" 
                    {...field} 
                    value={field.value as string | number} 
                    className="h-12" 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dueDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dia Vencimento</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="1" 
                    max="31" 
                    {...field} 
                    value={field.value as string | number} 
                    className="h-12" 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="customMessage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mensagem de Cobrança Personalizada (Opcional)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Olá {nome}, sua mensalidade vence em breve..." 
                  {...field} 
                  className="min-h-[100px]" 
                />
              </FormControl>
              <FormDescription>
                Esta mensagem será enviada por e-mail para o aluno.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-4 pt-4">
          <Button type="button" variant="outline" className="flex-1 h-12" onClick={() => router.back()}>
            Cancelar
          </Button>
          <Button type="submit" className="flex-1 h-12">
            {isEditing ? 'Salvar Alterações' : 'Cadastrar Aluno'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
