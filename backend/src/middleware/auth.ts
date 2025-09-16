import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/database';

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    
    if (!userId) {
      return res.status(401).json({ error: 'ID do usuário não fornecido' });
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: 'Usuário não autorizado' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(500).json({ error: 'Erro na autenticação' });
  }
};