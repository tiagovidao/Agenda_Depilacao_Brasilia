import { Request, Response } from 'express';
import { supabase } from '../config/database';

export class RevenueController {
  async getRevenue(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const { period, date, startDate, endDate } = req.query;

      let query = supabase
        .from('appointments')
        .select('type, value, date')
        .eq('user_id', userId);

      const targetDate = date ? new Date(date as string) : new Date();

      switch (period) {
        case 'day':
          const dayStr = targetDate.toISOString().split('T')[0];
          query = query.eq('date', dayStr);
          break;

        case 'week':
          const weekStart = new Date(targetDate);
          weekStart.setDate(targetDate.getDate() - targetDate.getDay());
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 6);
          
          query = query
            .gte('date', weekStart.toISOString())
            .lte('date', weekEnd.toISOString());
          break;

        case 'month':
          const monthStart = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
          const monthEnd = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0);
          
          query = query
            .gte('date', monthStart.toISOString())
            .lte('date', monthEnd.toISOString());
          break;

        case 'custom':
          if (startDate && endDate) {
            query = query
              .gte('date', startDate)
              .lte('date', endDate);
          }
          break;
      }

      const { data, error } = await query;

      if (error) throw error;

      const revenue = {
        total: 0,
        laser: 0,
        cera: 0,
        count: data?.length || 0,
        appointments: data || []
      };

      if (data) {
        data.forEach(apt => {
          revenue.total += apt.value || 0;
          if (apt.type === 'Laser') {
            revenue.laser += apt.value || 0;
          } else if (apt.type === 'Cera') {
            revenue.cera += apt.value || 0;
          }
        });
      }

      res.json(revenue);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao calcular receitas' });
    }
  }
}