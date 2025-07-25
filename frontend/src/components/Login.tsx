import { useState } from "react";
import Logo from '../images/agenda-logo.svg'; // Importação da logo

interface LoginProps {
  onLogin: (username: string) => void;
}

const Login = ({ onLogin }: LoginProps) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Usuários permitidos e senha comum
    const allowedUsers = ["elainevidao", "biancavidao"];
    const commonPassword = "19212523"; // Senha comum para ambos
    
    if (allowedUsers.includes(username) && password === commonPassword) {
      onLogin(username);
    } else {
      setError("Credenciais inválidas");
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
            Sistema de Agendamento
          </p>
          
          {/* Logo responsiva */}
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
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Usuário
              </label>
              <div className="mt-1">
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Senha
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 p-3">
                <p className="text-sm text-red-700 text-center">{error}</p>
              </div>
            )}

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all"
              >
                Entrar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;