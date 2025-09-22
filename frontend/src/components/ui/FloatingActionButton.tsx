import React from 'react';
interface FloatingActionButtonProps {
  onClick: () => void;
  disabled?: boolean;
  show?: boolean;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onClick,
  disabled = false,
  show = true
}) => {
  if (!show) return null;

  return (
    <div className="fixed bottom-12 left-1/2 transform -translate-x-1/2 z-40">
      <button
        onClick={onClick}
        disabled={disabled}
        className={`
          group flex items-center gap-3 px-6 py-4 rounded-full shadow-2xl 
          transition-all duration-300 transform hover:scale-105
          ${disabled 
            ? 'bg-gray-400 cursor-not-allowed opacity-60' 
            : 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800'
          }
        `}
      >

        <span className="text-white font-semibold text-lg pr-2">
          Novo Agendamento
        </span>
      </button>
    </div>
  );
};

export default FloatingActionButton;