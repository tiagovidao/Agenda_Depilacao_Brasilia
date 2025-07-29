export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  created_at: string;
}

export interface RegisterForm {
  name: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginForm {
  usernameOrEmail: string;
  password: string;
}