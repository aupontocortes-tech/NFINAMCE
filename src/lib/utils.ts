import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getApiUrl() {
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
  
  // Configuração automática para o Render (Frontend Production)
  if (typeof window !== 'undefined' && window.location.hostname.includes('onrender.com')) {
    return 'https://nfinamce.onrender.com';
  }

  return 'http://localhost:3001';
}
