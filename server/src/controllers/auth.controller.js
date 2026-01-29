import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../data/db.js';
import { sendEmail } from '../services/email.service.js';

const JWT_SECRET = process.env.JWT_SECRET || 'nfinance-secret-key-change-me';

export const register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Preencha todos os campos.' });
  }

  try {
    const existingUser = await db('users').where({ email }).first();
    if (existingUser) {
      return res.status(400).json({ error: 'E-mail já cadastrado.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insert and get ID (Compatible with PG and SQLite if using recent Knex/better-sqlite3)
    const [inserted] = await db('users').insert({ name, email, password: hashedPassword }).returning(['id', 'name', 'email']);
    
    // Fallback if returning not supported or behaves differently
    let user = inserted;
    if (!user || !user.id) {
        // Fetch by email if insert didn't return full object
         user = await db('users').where({ email }).first();
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    // Enviar e-mail de boas-vindas
    const emailSubject = 'Bem-vindo ao NFinance! 🚀';
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #18181b;">Bem-vindo(a), ${user.name}!</h1>
        <p>Estamos muito felizes em ter você conosco.</p>
        <p>O <strong>NFinance</strong> vai te ajudar a organizar suas aulas e pagamentos de forma simples.</p>
        <hr style="border: 1px solid #e4e4e7; margin: 20px 0;">
        <p>Se tiver dúvidas, responda a este e-mail.</p>
        <p style="color: #71717a; font-size: 14px;">Equipe NFinance</p>
      </div>
    `;
    
    // Não usamos await aqui para não bloquear a resposta da API
    sendEmail(user.email, emailSubject, emailHtml).catch(err => console.error('Erro ao enviar email de boas-vindas:', err));

    res.status(201).json({ user: { id: user.id, name: user.name, email: user.email }, token });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Erro ao registrar usuário.' });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Preencha e-mail e senha.' });
  }

  try {
    const user = await db('users').where({ email }).first();
    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    
    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword, token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Erro ao fazer login.' });
  }
};

/** Login/cadastro via rede social (Google, Facebook, Twitter). Cria usuário se não existir. */
export const social = async (req, res) => {
  const { email, name } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'E-mail é obrigatório.' });
  }

  try {
    let user = await db('users').where({ email }).first();
    if (!user) {
      const hashedPassword = await bcrypt.hash(
        crypto.randomBytes(32).toString('hex'),
        10
      );
      const [inserted] = await db('users')
        .insert({
          name: name || email.split('@')[0],
          email,
          password: hashedPassword,
        })
        .returning(['id', 'name', 'email']);
      user = inserted;
      if (!user?.id) {
        user = await db('users').where({ email }).first();
      }
    }
    if (!user) {
      return res.status(500).json({ error: 'Erro ao criar ou buscar usuário.' });
    }
    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    const { password: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword, token });
  } catch (error) {
    console.error('Social auth error:', error);
    res.status(500).json({ error: 'Erro ao autenticar com rede social.' });
  }
};

/** Verifica se a API Resend está configurada (envio de e-mails). */
export const resendStatus = async (_req, res) => {
  const configured = !!process.env.RESEND_API_KEY;
  res.json({
    resend: configured,
    message: configured
      ? 'API Resend configurada. E-mails serão enviados via Resend.'
      : 'RESEND_API_KEY não definida. Configure em server/.env (veja CONFIGURAR_RESEND.md).',
  });
};

export const me = async (req, res) => {
  try {
    const user = await db('users').select('id', 'name', 'email', 'created_at').where({ id: req.user.id }).first();
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar dados do usuário.' });
  }
};
