import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getApiUrl() {
  // Se houver uma variável de ambiente definida (na Vercel), usa ela.
  // Caso contrário, usa localhost (para desenvolvimento).
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
}
