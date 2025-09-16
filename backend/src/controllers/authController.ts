import { Request, Response } from 'express';
import { supabase } from '../config/database';
import { LoginRequest, RegisterRequest } from '../types';

export class AuthController {
  async login(req: Request<{}, {}, LoginRequest>, res: Response) {
    try {
      const { usernameOrEmail, password } = req.body;
      
      const isEmail = usernameOrEmail.includes('@');
      const field = isEmail ? 'email' : 'username';
      
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq(field, usernameOrEmail.toLowerCase())
        .eq('password', password)
        .single();

      if (error || !user) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }

      const { password: _, ...userWithoutPassword } = user;
      
      res.json({ user: userWithoutPassword });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao fazer login' });
    }
  }

  async register(req: Request<{}, {}, RegisterRequest>, res: Response) {
    try {
      const { name, username, email, password } = req.body;

      const { data, error } = await supabase
        .from('users')
        .insert([{
          name: name.trim(),
          username: username.trim().toLowerCase(),
          email: email.trim().toLowerCase(),
          password
        }])
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          const field = error.message.includes('username') ? 'username' : 'email';
          return res.status(409).json({ 
            error: `${field === 'username' ? 'Usuário' : 'Email'} já existe` 
          });
        }
        throw error;
      }

      const { password: _, ...userWithoutPassword } = data;
      res.status(201).json({ user: userWithoutPassword });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao criar conta' });
    }
  }
}