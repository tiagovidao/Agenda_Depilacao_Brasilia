// frontend/src/App.tsx
import { useState } from "react";
import Dashboard from "./components/Dashboard";
import Login from "./components/Login";
import Register from "./components/Register";
import { AlertModal } from "./components/ui/Modal";
import { type User } from "./types/user";
import "./styles/animations.css";

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showRegister, setShowRegister] = useState(false);
  const [alertMessage, setAlertMessage] = useState<{
    show: boolean;
    title: string;
    message: string;
    type: 'success' | 'error' | 'info';
  }>({
    show: false,
    title: '',
    message: '',
    type: 'info'
  });

  const handleLogin = (user: User) => {
    setIsAuthenticated(true);
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  const handleRegisterSuccess = () => {
    setShowRegister(false);
    setAlertMessage({
      show: true,
      title: 'Conta criada!',
      message: 'Sua conta foi criada com sucesso. Faça login para continuar.',
      type: 'success'
    });
  };

  const closeAlert = () => {
    setAlertMessage(prev => ({ ...prev, show: false }));
  };

  // Loading state could be added here if needed
  // const [isLoading, setIsLoading] = useState(true);

  if (!isAuthenticated) {
    if (showRegister) {
      return (
        <>
          <Register
            onRegisterSuccess={handleRegisterSuccess}
            onBackToLogin={() => setShowRegister(false)}
          />
          <AlertModal
            isOpen={alertMessage.show}
            onClose={closeAlert}
            title={alertMessage.title}
            message={alertMessage.message}
            type={alertMessage.type}
          />
        </>
      );
    }

    return (
      <>
        <Login
          onLogin={handleLogin}
          onGoToRegister={() => setShowRegister(true)}
        />
        <AlertModal
          isOpen={alertMessage.show}
          onClose={closeAlert}
          title={alertMessage.title}
          message={alertMessage.message}
          type={alertMessage.type}
        />
      </>
    );
  }

  return (
    <Dashboard 
      currentUser={currentUser!} 
      onLogout={handleLogout} 
    />
  );
};

export default App;