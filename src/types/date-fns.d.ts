declare module 'date-fns' {
  export function format(date: Date | number, format: string, options?: { locale?: any }): string;
  // Adicione outras funções conforme necessário
}

declare module 'date-fns/locale' {
  export const ptBR: any;
  // Adicione outros locales conforme necessário
}
