import { Request, Response } from 'express';
import { supabase } from '../config/database';
import { Appointment } from '../types';

export class AppointmentController {
  async list(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const { date, startDate, endDate } = req.query;

      let query = supabase
        .from('appointments')
        .select('*')
        .eq('user_id', userId);

      if (date) {
        query = query.eq('date', date);
      }

      if (startDate && endDate) {
        query = query.gte('date', startDate).lte('date', endDate);
      }

      const { data, error } = await query.order('date', { ascending: true });

      if (error) throw error;

      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar agendamentos' });
    }
  }

  async create(req: Request<{}, {}, Appointment>, res: Response) {
    try {
      const userId = req.user!.id;
      const appointment = { ...req.body, user_id: userId };

      const { data, error } = await supabase
        .from('appointments')
        .insert([appointment])
        .select()
        .single();

      if (error) throw error;

      res.status(201).json(data);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao criar agendamento' });
    }
  }

  async update(req: Request<{ id: string }, {}, Appointment>, res: Response) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      const { data, error } = await supabase
        .from('appointments')
        .update(req.body)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;

      if (!data) {
        return res.status(404).json({ error: 'Agendamento não encontrado' });
      }

      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao atualizar agendamento' });
    }
  }

  async delete(req: Request<{ id: string }>, res: Response) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Erro ao excluir agendamento' });
    }
  }
}