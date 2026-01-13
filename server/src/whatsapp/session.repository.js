import { useMultiFileAuthState } from '@whiskeysockets/baileys';
import path from 'path';
import fs from 'fs';

/**
 * Repositório de Sessões usando Baileys MultiFileAuth.
 * Salva as credenciais em arquivos JSON locais.
 */
export class LocalSessionRepository {
  /**
   * Prepara o estado de autenticação para o Baileys.
   * @param {string} clientId - ID da sessão
   */
  async getAuthStrategy(clientId) {
    // Define a pasta onde as credenciais serão salvas
    // Usamos 'baileys_auth_info' na raiz do server
    const authPath = path.resolve('baileys_auth_info', clientId);
    
    // Cria o diretório se não existir
    if (!fs.existsSync(authPath)) {
      fs.mkdirSync(authPath, { recursive: true });
    }

    console.log(`📂 Carregando credenciais de: ${authPath}`);
    
    // Retorna o objeto de estado e a função de salvamento
    return await useMultiFileAuthState(authPath);
  }
}
