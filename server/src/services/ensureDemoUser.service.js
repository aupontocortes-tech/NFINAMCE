import bcrypt from 'bcryptjs';
import { db } from '../data/db.js';

const DEMO_EMAIL = 'demo@nfinance.com';
const DEMO_PASSWORD = 'demo123';

/** Cria ou atualiza o usuário demo (apenas em ambiente não-produção) para login rápido local. */
export async function ensureDemoUser() {
  if (process.env.NODE_ENV === 'production' && !process.env.DEMO_USER) return;
  try {
    const existing = await db('users').where({ email: DEMO_EMAIL }).first();
    const hashed = await bcrypt.hash(DEMO_PASSWORD, 10);
    if (existing) {
      await db('users').where({ email: DEMO_EMAIL }).update({ password: hashed, name: 'Demo NFinance' });
      const after = await db('users').where({ email: DEMO_EMAIL }).first();
      if (after && !(await bcrypt.compare(DEMO_PASSWORD, after.password))) {
        const rehash = await bcrypt.hash(DEMO_PASSWORD, 10);
        await db('users').where({ email: DEMO_EMAIL }).update({ password: rehash });
      }
      console.log('👤 Usuário demo: demo@nfinance.com / demo123');
      return;
    }
    await db('users').insert({ name: 'Demo NFinance', email: DEMO_EMAIL, password: hashed });
    console.log('👤 Usuário demo: demo@nfinance.com / demo123');
  } catch (err) {
    console.error('Erro ao garantir usuário demo:', err.message);
  }
}
