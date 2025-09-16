export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  password?: string;
  created_at: string;
}

export interface Appointment {
  id?: number;
  times: string[];
  type: 'Laser' | 'Cera';
  client_name: string;
  value: number;
  observations: string;
  date: string;
  user_id: string;
  phone?: string;
}

export interface LoginRequest {
  usernameOrEmail: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  username: string;
  email: string;
  password: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}