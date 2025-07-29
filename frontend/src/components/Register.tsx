// frontend/src/components/Register.tsx
import { useState } from "react";
import { User, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { supabase } from "../lib/supabase";
import type { RegisterForm } from "../types/user";
import Logo from '../images/agenda-logo.svg';

interface RegisterProps {
  onRegisterSuccess: () => void;
  onBackToLogin: () => void;
}

const Register = ({ onRegisterSuccess, onBackToLogin }: RegisterProps) => {
  const [form, setForm] = useState<RegisterForm>({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!form.name.trim()) newErrors.name = "Nome é obrigatório";
    if (!form.username.trim()) newErrors.username = "Nome de usuário é obrigatório";
    if (form.username.length < 3) newErrors.username = "Nome de usuário deve ter pelo menos 3 caracteres";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.email.trim()) newErrors.email = "Email é obrigatório";
    else if (!emailRegex.test(form.email)) newErrors.email = "Email inválido";

    if (!form.password) newErrors.password = "Senha é obrigatória";
    else if (form.password.length < 6) newErrors.password = "Senha deve ter pelo menos 6 caracteres";

    if (!form.confirmPassword) newErrors.confirmPassword = "Confirmação de senha é obrigatória";
    else if (form.password !== form.confirmPassword) newErrors.confirmPassword = "Senhas não coincidem";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('users')
        .insert([{
          name: form.name.trim(),
          username: form.username.trim().toLowerCase(),
          email: form.email.trim().toLowerCase(),
          password: form.password
        }])
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          if (error.message.includes('username')) {
            setErrors({ username: 'Nome de usuário já existe' });
          } else if (error.message.includes('email')) {
            setErrors({ email: 'Email já cadastrado' });
          }
        } else {
          setErrors({ general: 'Erro ao criar conta. Tente novamente.' });
        }
        return;
      }

      onRegisterSuccess();
    } catch {
      setErrors({ general: 'Erro inesperado. Tente novamente.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof RegisterForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-6 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex flex-col items-center">
          <h2 className="mt-2 text-center text-3xl font-bold text-purple-600">
            Depilação Brasília
          </h2>
          <p className="mt-1 text-center text-lg text-purple-500">
            Criar Nova Conta
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
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="flex text-sm font-medium text-gray-700 mb-1 items-center gap-2">
                <User size={16} className="text-purple-600" />
                Nome Completo
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Digite seu nome completo"
                className={`w-full px-4 py-2.5 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
                  errors.name ? 'border-red-300 focus:ring-red-300' : 'border-gray-300 focus:ring-purple-300'
                }`}
              />
              {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome de Usuário
              </label>
              <input
                type="text"
                value={form.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                placeholder="Digite seu nome de usuário"
                className={`w-full px-4 py-2.5 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
                  errors.username ? 'border-red-300 focus:ring-red-300' : 'border-gray-300 focus:ring-purple-300'
                }`}
              />
              {errors.username && <p className="text-red-600 text-sm mt-1">{errors.username}</p>}
            </div>

            <div>
              <label className="flex text-sm font-medium text-gray-700 mb-1 items-center gap-2">
                <Mail size={16} className="text-purple-600" />
                Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Digite seu email"
                className={`w-full px-4 py-2.5 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
                  errors.email ? 'border-red-300 focus:ring-red-300' : 'border-gray-300 focus:ring-purple-300'
                }`}
              />
              {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="flex text-sm font-medium text-gray-700 mb-1 items-center gap-2">
                <Lock size={16} className="text-purple-600" />
                Senha
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="Digite sua senha"
                  className={`w-full px-4 py-2.5 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 transition-all pr-10 ${
                    errors.password ? 'border-red-300 focus:ring-red-300' : 'border-gray-300 focus:ring-purple-300'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirmar Senha
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  placeholder="Confirme sua senha"
                  className={`w-full px-4 py-2.5 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 transition-all pr-10 ${
                    errors.confirmPassword ? 'border-red-300 focus:ring-red-300' : 'border-gray-300 focus:ring-purple-300'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-red-600 text-sm mt-1">{errors.confirmPassword}</p>}
            </div>

            {errors.general && (
              <div className="rounded-lg bg-red-50 p-3">
                <p className="text-sm text-red-700 text-center">{errors.general}</p>
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
                {isLoading ? 'Criando conta...' : 'Criar Conta'}
              </button>

              <button
                type="button"
                onClick={onBackToLogin}
                className="w-full py-2 px-4 text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                Já tem uma conta? Fazer login
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
