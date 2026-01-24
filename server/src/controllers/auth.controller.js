import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../data/db.js';

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

export const me = async (req, res) => {
  try {
    const user = await db('users').select('id', 'name', 'email', 'created_at').where({ id: req.user.id }).first();
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar dados do usuário.' });
  }
};
