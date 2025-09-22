// frontend/src/utils/currency.ts
export const formatCurrency = (value: string): string => {
  if (!value) return '';
  const digits = value.replace(/\D/g, '');
  if (!digits) return '';
  const number = parseInt(digits) / 100;
  return number.toLocaleString('pt-BR', { 
    style: 'currency', 
    currency: 'BRL' 
  });
};

export const parseCurrency = (value: string): number => {
  return parseFloat(value.replace(/[R$\s.]/g, '').replace(',', '.')) || 0;
};
