// frontend/src/components/Login.tsx
import { useState } from "react";
import { Lock, User, Eye, EyeOff } from "lucide-react";
import { supabase } from "../lib/supabase";
import type { LoginForm, User as UserType } from "../types/user";
import Logo from '../images/agenda-logo.svg';

interface LoginProps {
  onLogin: (user: UserType) => void;
  onGoToRegister: () => void;
}

const Login = ({ onLogin, onGoToRegister }: LoginProps) => {
  const [form, setForm] = useState<LoginForm>({
    usernameOrEmail: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.usernameOrEmail.trim() || !form.password) {
      setError("Preencha todos os campos");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const isEmail = form.usernameOrEmail.includes('@');
      const field = isEmail ? 'email' : 'username';
      const value = form.usernameOrEmail.trim().toLowerCase();

      const { data } = await supabase
        .from('users')
        .select('*')
        .eq(field, value)
        .eq('password', form.password)
        .single();

      if (!data) {
        setError("Credenciais inválidas");
        return;
      }

      onLogin(data);
    } catch  {
      setError("Erro ao fazer login. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof LoginForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (error) setError("");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-6 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex flex-col items-center">
          <h2 className="mt-2 text-center text-3xl font-bold text-purple-600">
            Depilação Brasília
          </h2>
          <p className="mt-1 text-center text-lg text-purple-500">
            Sistema de Agendamento
          </p>

          <div className="mt-4 w-full max-w-[180px] sm:max-w-[220px] mx-auto">
            <img 
              src={Logo} 
              alt="Logo Depilação Brasília" 
              className="w-full h-auto" 
            />
          </div>
        </div>
      </div>

      <div className="mt-6 sm:mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-6 px-4 shadow rounded-xl sm:px-8 sm:py-8">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="usernameOrEmail" className="flex text-sm font-medium text-gray-700 mb-1 items-center gap-2">
                <User size={16} className="text-purple-600" />
                Usuário ou Email
              </label>
              <input
                id="usernameOrEmail"
                type="text"
                value={form.usernameOrEmail}
                onChange={(e) => handleInputChange('usernameOrEmail', e.target.value)}
                placeholder="Digite seu usuário ou email"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label htmlFor="password" className="flex text-sm font-medium text-gray-700 mb-1 items-center gap-2">
                <Lock size={16} className="text-purple-600" />
                Senha
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="Digite sua senha"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent transition-all pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 p-3">
                <p className="text-sm text-red-700 text-center">{error}</p>
              </div>
            )}

            <div className="space-y-3">
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white transition-all ${
                  isLoading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500'
                }`}
              >
                {isLoading ? 'Entrando...' : 'Entrar'}
              </button>

              <button
                type="button"
                onClick={onGoToRegister}
                className="w-full py-2 px-4 text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                Não tem uma conta? Cadastre-se
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
