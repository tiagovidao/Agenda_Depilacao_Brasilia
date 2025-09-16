import type { User, RegisterForm } from '../types/user';
import type { Appointment } from '../types/appointment';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface RevenueData {
  total: number;
  laser: number;
  cera: number;
  count: number;
  appointments: Appointment[];
}

class ApiClient {
  private userId: string = '';
  private token: string = '';

  setUserId(userId: string) {
    this.userId = userId;
  }

  setToken(token: string) {
    this.token = token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(this.userId && { 'X-User-Id': this.userId }),
      ...(this.token && { 'Authorization': `Bearer ${this.token}` }),
      ...options.headers,
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        error: 'Erro desconhecido'
      }));
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }

    if (response.status === 204) {
      return null as T;
    }

    return await response.json();
  }

  async login(usernameOrEmail: string, password: string): Promise<{ user: User }> {
    const data = await this.request<{ user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ usernameOrEmail, password }),
    });
    
    if (data.user?.id) {
      this.setUserId(data.user.id);
    }
    
    return data;
  }

  async register(userData: Omit<RegisterForm, 'confirmPassword'>): Promise<{ user: User }> {
    return this.request<{ user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getAppointments(params?: {
    date?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<Appointment[]> {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request<Appointment[]>(`/appointments${query}`);
  }

  async createAppointment(appointment: Omit<Appointment, 'id'>): Promise<Appointment> {
    return this.request<Appointment>('/appointments', {
      method: 'POST',
      body: JSON.stringify(appointment),
    });
  }

  async updateAppointment(id: number, appointment: Omit<Appointment, 'id'>): Promise<Appointment> {
    return this.request<Appointment>(`/appointments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(appointment),
    });
  }

  async deleteAppointment(id: number): Promise<void> {
    return this.request<void>(`/appointments/${id}`, {
      method: 'DELETE',
    });
  }

  async getRevenue(params: {
    period: string;
    date?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<RevenueData> {
    const query = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined) as [string, string][]
    ).toString();
    
    return this.request<RevenueData>(`/revenue?${query}`);
  }

  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.request<{ status: string; timestamp: string }>('/health');
  }
}

export const api = new ApiClient();