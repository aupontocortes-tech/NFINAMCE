import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getApiUrl() {
  // Prioridade 1: Variável de ambiente (configurada na Render/Vercel)
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  // Prioridade 2: Se estiver rodando no cliente (navegador)
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    
    // Se for localhost, usa backend local no mesmo host (evita mistura localhost vs 127.0.0.1)
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return `http://${hostname}:3001`;
    }
    
    // Se estiver na Render (onrender.com), usa backend na Render
    if (hostname.includes('onrender.com')) {
      return 'https://nfinamce.onrender.com';
    }
    
    // Para qualquer outro domínio em produção, tenta o backend na Render
    return 'https://nfinamce.onrender.com';
  }

  // Fallback para server-side: usa localhost
  return 'http://localhost:3001';
}
