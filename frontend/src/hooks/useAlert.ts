import { useState, useCallback } from 'react';

interface AlertState {
  isOpen: boolean;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  onConfirm?: () => void;
}

export const useAlert = () => {
  const [alertState, setAlertState] = useState<AlertState>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info'
  });

  const showAlert = useCallback((
    title: string, 
    message: string, 
    type: 'info' | 'warning' | 'error' | 'success' = 'info',
    onConfirm?: () => void
  ) => {
    setAlertState({
      isOpen: true,
      title,
      message,
      type,
      onConfirm
    });
  }, []);

  const closeAlert = useCallback(() => {
    setAlertState(prev => ({ ...prev, isOpen: false }));
  }, []);

  return {
    alertState,
    showAlert,
    closeAlert
  };
};