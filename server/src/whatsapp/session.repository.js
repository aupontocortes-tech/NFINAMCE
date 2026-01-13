import pkg from 'whatsapp-web.js';
const { LocalAuth } = pkg;

/**
 * Interface Base para Repositório de Sessões.
 * Garante que a aplicação possa mudar de LocalAuth para Banco de Dados
 * sem alterar a lógica de negócios (Services/Controllers).
 */
export class SessionRepository {
  constructor() {
    if (this.constructor === SessionRepository) {
      throw new Error("A classe abstrata 'SessionRepository' não pode ser instanciada diretamente.");
    }
  }

  /**
   * Retorna a estratégia de autenticação para o cliente WhatsApp.
   * @param {string} clientId - ID único do cliente/sessão
   */
  getAuthStrategy(clientId) {
    throw new Error("O método 'getAuthStrategy' deve ser implementado.");
  }
}

/**
 * Implementação usando LocalAuth (Sistema de Arquivos).
 * Ideal para MVP e compatível com o sistema atual.
 */
export class LocalSessionRepository extends SessionRepository {
  getAuthStrategy(clientId) {
    console.log(`📂 Inicializando armazenamento local para sessão: ${clientId}`);
    return new LocalAuth({ clientId });
  }
}

// No futuro, você pode criar:
// export class MongoSessionRepository extends SessionRepository { ... }
// export class PostgresSessionRepository extends SessionRepository { ... }
